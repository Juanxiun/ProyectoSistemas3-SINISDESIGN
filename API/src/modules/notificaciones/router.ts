import { Router } from "@oak/oak";

const notificaciones = new Router();

notificaciones
    .get("/", (ctx) => {})
    .get("/:id", (ctx) => {})
    .post("/", (ctx) => {})
    .put("/:id", (ctx) => {})
    .delete("/:id", (ctx) => {})

export {notificaciones};