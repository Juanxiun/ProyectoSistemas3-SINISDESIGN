import { Router } from "@oak/oak";
import { CrudFase } from "./controller/crud.controller.ts";
import FaseModel from "./model.ts";

const fase = new Router();
const fas = new CrudFase();

fase
  .get("/:proy", async (ctx) => {
    const proy = parseInt(ctx.params.proy);
    await fas.select(ctx, proy, 0);
  })
  .get("/:proy/:id", async (ctx) => {
    const proy = parseInt(ctx.params.proy);
    const id = parseInt(ctx.params.id);
    await fas.select(ctx, proy, id);
  })
  .post("/", async (ctx) => {
    const form = await ctx.request.body.formData();
    const fase: FaseModel = {
      proy: parseInt(form.get("proy") as string),
      fase: form.get("fase") as string,
      detalle: form.get("detalle") as string,
      inicio: form.get("inicio") as string,
      estado: form.has("est") ? parseInt(form.get("est") as string) : undefined,
    };
    await fas.create(ctx, fase);
  })
  .put("/:id", async (ctx) => {
    const id = parseInt(ctx.params.id);
    const form = await ctx.request.body.formData();
    const fase: FaseModel = {
      id: id,
      proy: parseInt(form.get("proy") as string),
      fase: form.get("fase") as string,
      detalle: form.get("detalle") as string,
      inicio: form.get("inicio") as string,
      estado: form.has("est") ? parseInt(form.get("est") as string) : undefined,
    };
    await fas.update(ctx, fase);
  })
  .delete("/:id", async (ctx) => {
    const id = parseInt(ctx.params.id);
    const form = await ctx.request.body.formData();
    const final = form.get("final") as string;
    await fas.delete(ctx, final, id,);
  });

export default fase;