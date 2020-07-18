# pgUI

## Quick Links

 - "Public Challenge Description": details/public.md
 - "Secret Design Specification": details/private.md
 - "Full Solution Explanation": solver/index.ts

## Overview

This is a postgres-oriented web challenge for players with moderate experience with web technologies and exploitation.

## Directory structure

 - `client`: All of the front-end code
 - `db`: The database initialization scripts
 - `details`: Information about the problem, both public and private
 - `server`: All of the backend code
 - `solver`: The solver program. It has it's own README for how to use it

## Setup

### Environment Variables

This step is important! Since this problem is full-source, I don't pre-set the passwords for different things. This must be done via environment variables.
You may either put these in your environment (not recommended), or you can put them in a top level `.env` file. The variables you need are

 - `PG_PASS`: The password for the `postgres` user in the db. This is how the server will connect to the database
 - `ADMIN_PASS`: The passwrod for the `admin` user in the application itself. This will never actually be used (unless players get way more creative than I anticipate), but is necessary for creating the default user.
 - `FLAG`: The flag that competitors will submit. I recommend `CTF{looking_a_bit_basic}`

Note that `docker-compose` will not let you create the containers without these two set.

### Running

Once your environment variables are in place, running should be as simple as

```bash
docker-compose build
docker-compose up -d
```

The service exposes a single port, `5000`, over which `HTTP` is served. Although I have not tested it, you should theoretically be able to scale up the number of server nodes. However, for scaling I would generally recommend creating multiple distinct environments.

### Player details

Since the problem is full-source, I wrote a convenient script `./create-player-bundle.sh` which shold create a `bundle.tgz` that contains only those files that players should have. Additionally, it includes `details/public.md` which should be used for creating the problem entry into your scoreboard.

I haven't prepared any hints for this problem. Hopefully that's not an issue.

## Creator

This problem was written by Zach Wade ([@zwad3](https://twitter.com/zwad3)). If you need to reach me for anything, you can contact me at [zach@dttw.tech](#mailto:zach@dttw.tech).

Much of the core problem idea was designed in conjunction with Matthew Savage ([@thebluepichu](https://twitter.com/thebluepichu)).
