import { Router } from "@oak/oak";
import { CrudPago } from "./controller/crud.controller.ts";
import PagoModel from "./model.ts";

const pago = new Router();
const pag = new CrudPago();

pago
  .get("/:proy", async (ctx) => {
    const proy = parseInt(ctx.params.proy);
    await pag.select(ctx, proy, 0);
  })
  .get("/:proy/:id", async (ctx) => {
    const proy = parseInt(ctx.params.proy);
    const id = parseInt(ctx.params.id);
    await pag.select(ctx, proy, id);
  })
  .post("/", async (ctx) => {
    const form = await ctx.request.body.formData();
    const pago: PagoModel = {
      proy: parseInt(form.get("proy") as string),
      titulo: form.get("titulo") as string,
      monto: parseFloat(form.get("monto") as string),
      fecha: form.get("fecha") as string,
    };
    await pag.create(ctx, pago);
  })
  .put("/:id", async (ctx) => {
    const id = parseInt(ctx.params.id);
    const form = await ctx.request.body.formData();
    const pago: PagoModel = {
      id: id,
      proy: parseInt(form.get("proy") as string),
      titulo: form.get("titulo") as string,
      monto: parseFloat(form.get("monto") as string),
      fecha: form.get("fecha") as string,
    };
    await pag.update(ctx, pago);
  })
  .delete("/:id", async (ctx) => {
    const id = parseInt(ctx.params.id);
    await pag.delete(ctx, id);
  });

export default pago;