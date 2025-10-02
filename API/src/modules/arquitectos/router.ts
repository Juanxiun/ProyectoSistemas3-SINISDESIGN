import { Router } from "@oak/oak";
import { CrudArquitectos } from "./controller/crud.controller.ts";
import informaciones from "./submodules/informaciones/router.ts";
import especializaciones from "./submodules/especializaciones/router.ts";
const arquitectoRouter = new Router();
const crud = new CrudArquitectos();

arquitectoRouter
  .get("/", (ctx) => crud.select(ctx))
  .get("/:codigo", (ctx) => crud.select(ctx, ctx.params.codigo))
  .post("/", (ctx) => crud.create(ctx))
  .put("/:codigo", (ctx) => crud.update(ctx, ctx.params.codigo))
  .delete("/:codigo", (ctx) => crud.delete(ctx, ctx.params.codigo));


//otras
arquitectoRouter.use(
  "/:codigo/especializaciones", especializaciones.routes(), especializaciones.allowedMethods()
);

arquitectoRouter.use(
  "/:codigo/informaciones", informaciones.routes(), informaciones.allowedMethods()
);

export default arquitectoRouter;