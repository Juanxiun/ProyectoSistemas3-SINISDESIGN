const db = {
    host: Deno.env.get("DB_HOST") ?? "",
    port: parseInt(Deno.env.get("DB_PORT") ?? "3306"),
    name: Deno.env.get("DB_NAME") ?? "",
    user: Deno.env.get("DB_USER") ?? "",
    pass: Deno.env.get("DB_PASS") ?? "",
}

const encrypt = {
    rounds: 14,
}

export {db, encrypt};