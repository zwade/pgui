# pgUI

## Problem Overview

This is ultimately an ACID-violation problem. Specifically, there are two endpoints on the server, one for logging in and one for running queries.

Both of these endpoints run entirely in a transaction, which allow them to delay certain checks. For instance, the query endpoint is using an asynchronous crypto library, so it does not check the validity of the current user until it's ready to commit the transaction. If the check fails, then it aborts instead. Because the http request never returns (inelegant, but not uncommon in express apps 😛), the user gets no signal whatsoever from the server, since it will never receive any response.

Likewise, the login endpoint starts by adding a new login to the event log, and then checks to see if the user is valid. If the user is not valid, then it rolls back the insertion and sends the client an error.

## Solution

In theory, since these are both running in transactions, both of which will always be aborted (assuming the client does not have a valid login), then there should be no way to get or do anything with the database. The "isolation" principle of acidity means that the two transactions cannot interact, and we have already established that neither gives you anython on it's own.

However, principles and practice are often at odds, and Postgres transactions are not perfectly isolated. Consider this minimal example (not much different from what we have in this problem)

#### Schema
```sql
CREATE TABLE test (id int UNIQUE);
```

and now say we have two different clients who both run

```sql
BEGIN
INSERT INTO test (id) VALUES (1);
```

Since they're both in an active transaction, they should be isolated from each other. However, we have a problem. If both of them commit like this, then we have violated our `UNIQUE` constraint on `test (id)`. So, postgres can't allow them to do this. Instead, whichever of the two runs second will not be able to perform the insertion immediately. That call will block until the first transaction commits or aborts.

This of course means that it could be blocking for an arbitrary amount of time if the first client gets to choose when they commit/abort. Coming back to our problem, we see that the `login` table is created as such

```sql
CREATE TABLE _pgui.login (
    id serial PRIMARY KEY,
    username text NOT NULL,
    time timestamp NOT NULL DEFAULT now()
);
```

Since `PRIMARY KEY` just means that it's unique, not null, and has an index, this is ripe for us to use the timing based side-channel. Specifically what we can do to leak a bit of information is this:

 1. Run a query that first inserts into the `login` table with the next valid `id` and then sleeps for `2` seconds if a criteria is met, or `0` seconds otherwise.
 2. Try to login
 3. See how long the login took to fail. If it took `>2s`, then our criteria was met. Otherwise, it wasn't.

Once we have a single bit leak, we can just binary search on the whole flag.

## Relevance of the Problem

I wrote this problem because I think it's often assumed that if individual queries to a database don't leak any information, then they're safe. Although it's uncommon to see this pattern of delayed checks in a transaction, I've definitely seen (and written) complex logic that operates inside of a transaction. Even if an attacker doesn't have full SQL execution, if they can selectively trigger an insertion upon some criteria being met, then they can use this isolation violation to leak information about the state of the world.
