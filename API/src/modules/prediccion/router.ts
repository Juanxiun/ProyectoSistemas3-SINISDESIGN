import { Router } from "@oak/oak";
import Nodo from "./functions/nodos.function.ts";

const prediccion = new Router();

prediccion
  .get("/:proy", async (ctx) => {
    const proy = ctx.params.proy;
    const nodos = new Nodo();
    const result = await nodos.processProject(proy);
    ctx.response.body = result;
  });

export default prediccion;
