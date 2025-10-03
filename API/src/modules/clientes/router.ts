import { Router } from "@oak/oak";

const clientes = new Router();

clientes
    .get("/", (ctx) => {})
    .get("/:id", (ctx) => {})
    .post("/", (ctx) => {})
    .put("/:id", (ctx) => {})
    .delete("/:id", (ctx) => {})

export {clientes};