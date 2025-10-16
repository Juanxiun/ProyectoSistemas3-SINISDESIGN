import { Router } from "@oak/oak";
import { CrudClientes } from "./controller/crud.controller.ts";

const router = new Router();
const clientes = new Router();
const crudClientes = new CrudClientes();

clientes
    .get("/", (ctx) => crudClientes.select(ctx))
    .get("/:ci", (ctx) => crudClientes.select(ctx, ctx.params.ci))
    .post("/", (ctx) => crudClientes.create(ctx))
    .put("/:ci", (ctx) => crudClientes.update(ctx, ctx.params.ci))
    .delete("/:ci", (ctx) => crudClientes.delete(ctx, ctx.params.ci))

router.use(clientes.routes());

export {clientes, router};
export default router;