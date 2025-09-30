import { Router } from "@oak/oak";
import { CrudReunion } from "./controller/crud.controller.ts";
import ReunionModel from "./model.ts";

const reunion = new Router();
const reu = new CrudReunion();

reunion
  .get("/:proy", async (ctx) => {
    const proy = parseInt(ctx.params.proy);
    await reu.select(ctx, proy, 0);
  })
  .get("/:proy/:id", async (ctx) => {
    const proy = parseInt(ctx.params.proy);
    const id = parseInt(ctx.params.id);
    await reu.select(ctx, proy, id);
  })
  .post("/", async (ctx) => {
    const form = await ctx.request.body.formData();
    const reunion: ReunionModel = {
      proy: parseInt(form.get("proy") as string),
      titulo: form.get("titulo") as string,
      descripcion: form.get("descripcion") as string,
      fecha: form.get("fecha") as string,
      estado: form.has("est") ? parseInt(form.get("est") as string) : undefined,
    };
    await reu.create(ctx, reunion);
  })
  .put("/:id", async (ctx) => {
    const id = parseInt(ctx.params.id);
    const form = await ctx.request.body.formData();
    const reunion: ReunionModel = {
      id: id,
      proy: parseInt(form.get("proy") as string),
      titulo: form.get("titulo") as string,
      descripcion: form.get("descripcion") as string,
      fecha: form.get("fecha") as string,
      estado: form.has("est") ? parseInt(form.get("est") as string) : undefined,
    };
    await reu.update(ctx, reunion);
  })
  .delete("/:id", async (ctx) => {
    const id = parseInt(ctx.params.id);
    await reu.delete(ctx, id);
  });

export default reunion;