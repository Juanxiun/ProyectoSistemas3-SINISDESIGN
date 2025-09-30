import { Router } from "@oak/oak";
import { CrudTipo } from "./controller/crud.controller.ts";
import TipoModel from "./model.ts";

const tipo = new Router();
const tip = new CrudTipo();

tipo
  .get("/:proy", async (ctx) => {
    const proy = parseInt(ctx.params.proy);
    await tip.select(ctx, proy, 0);
  })
  .get("/:proy/:id", async (ctx) => {
    const proy = parseInt(ctx.params.proy);
    const id = parseInt(ctx.params.id);
    await tip.select(ctx, proy, id);
  })
  .post("/", async (ctx) => {
    const form = await ctx.request.body.formData();
    const tipo: TipoModel = {
      proy: parseInt(form.get("proy") as string),
      tipo: form.get("tipo") as string,
      subtipo: form.get("subtipo") as string,
    };
    await tip.create(ctx, tipo);
  })
  .put("/:id", async (ctx) => {
    const id = parseInt(ctx.params.id);
    const form = await ctx.request.body.formData();
    const tipo: TipoModel = {
      id: id,
      proy: parseInt(form.get("proy") as string),
      tipo: form.get("tipo") as string,
      subtipo: form.get("subtipo") as string,
    };
    await tip.update(ctx, tipo);
  })
  .delete("/:id", async (ctx) => {
    const id = parseInt(ctx.params.id);
    await tip.delete(ctx, id);
  });

export default tipo;
