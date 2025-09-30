import { Router } from "@oak/oak";
import { CrudDireccion } from "./controller/crud.controller.ts";
import DireccionModel from "./model.ts";

const direccion = new Router();
const dir = new CrudDireccion();

direccion
  .get("/:proy", async (ctx) => {
    const proy = parseInt(ctx.params.proy);
    await dir.select(ctx, proy, 0);
  })
  .get("/:proy/:id", async (ctx) => {
    const proy = parseInt(ctx.params.proy);
    const id = parseInt(ctx.params.id);
    await dir.select(ctx, proy, id);
  })
  .post("/", async (ctx) => {
    const form = await ctx.request.body.formData();
    const direccion: DireccionModel = {
      proy: parseInt(form.get("proy") as string),
      pais: form.get("pais") as string,
      departamento: form.get("departamento") as string,
      zona: form.get("zona") as string,
      calle: form.get("calle") as string,
      puerta: parseInt(form.get("puerta") as string),
    };
    await dir.create(ctx, direccion);
  })
  .put("/:id", async (ctx) => {
    const id = parseInt(ctx.params.id);
    const form = await ctx.request.body.formData();
    const direccion: DireccionModel = {
      id: id,
      proy: parseInt(form.get("proy") as string),
      pais: form.get("pais") as string,
      departamento: form.get("departamento") as string,
      zona: form.get("zona") as string,
      calle: form.get("calle") as string,
      puerta: parseInt(form.get("puerta") as string),
    };
    await dir.update(ctx, direccion);
  })
  .delete("/:id", async (ctx) => {
    const id = parseInt(ctx.params.id);
    await dir.delete(ctx, id);
  });

export default direccion;
