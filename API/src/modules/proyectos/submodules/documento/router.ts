import { Router } from "@oak/oak";
import { CrudDocumento } from "./controller/crud.controller.ts";
import DocumentoModel from "./model.ts";

const documento = new Router();
const doc = new CrudDocumento();

documento
  .get("/:fase", async (ctx) => {
    const fase = parseInt(ctx.params.fase);
    await doc.select(ctx, fase, 0);
  })
  .get("/:fase/:id", async (ctx) => {
    const fase = parseInt(ctx.params.fase);
    const id = parseInt(ctx.params.id);
    await doc.select(ctx, fase, id);
  })
  .post("/", async (ctx) => {
    const form = await ctx.request.body.formData();
    const documento: DocumentoModel = {
      fase: parseInt(form.get("fase") as string),
      nombre: form.get("nombre") as string,
      documento: form.get("documento") as File,
      fecha: form.get("fecha") as string,
    };
    await doc.create(ctx, documento);
  })
  .put("/:id", async (ctx) => {
    const id = parseInt(ctx.params.id);
    const form = await ctx.request.body.formData();
    const documento: DocumentoModel = {
      id: id,
      fase: parseInt(form.get("fase") as string),
      nombre: form.get("nombre") as string,
      documento: form.get("documento") as File,
      fecha: form.get("fecha") as string,
    };
    await doc.update(ctx, documento);
  })
  .delete("/:id", async (ctx) => {
    const id = parseInt(ctx.params.id);
    await doc.delete(ctx, id);
  });

export default documento;
