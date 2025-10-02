import { Router } from "@oak/oak";
import { CrudProyectos } from "./controller/crud.controller.ts";
import ProyectoModel from "./model.ts";
import { fileBlob } from "../../libs/converFile.ts";
import tipo from "./submodules/tipo/router.ts";
import reunion from "./submodules/reunion/router.ts";
import pago from "./submodules/pago/router.ts";
import fase from "./submodules/fase/router.ts";
import direccion from "./submodules/direccion/router.ts";
import documento from "./submodules/documento/router.ts";

//ininicar la clase proy  / iniciar las rutas
const proyecto = new Router();
const proy = new CrudProyectos();

//rutas
proyecto
  //crud
  .get("/:arq", async (ctx) => {
    const arq = ctx.params.arq;
    await proy.select(ctx, 0, arq);
  })
  .get("/:arq/:id", async (ctx) => {
    const id = parseInt(ctx.params.id);
    const arq = ctx.params.arq;
    await proy.select(ctx, id, arq);
  })
  .post("/", async (ctx) => {
    const form = await ctx.request.body.formData();

    const proyecto: ProyectoModel = {
      id: 0,
      arq: form.get("arq") as string,
      cli: parseInt(form.get("cli") as string),
      nombre: form.get("nombre") as string,
      inicio: form.get("inicio") as string,
      costo: parseFloat(form.get("precio") as string),
      imagen: form.get("foto") as string,
    };
    await proy.create(ctx, proyecto);
  })
  .put("/:id", async (ctx) => {
    const id = parseInt(ctx.params.id);
    const form = await ctx.request.body.formData();
    const proyecto: ProyectoModel = {
      id: id,
      arq: form.get("arq") as string,
      cli: parseInt(form.get("cli") as string),
      nombre: form.get("nombre") as string,
      inicio: form.get("inicio") as string,
      costo: parseFloat(form.get("precio") as string),
      imagen: form.get("foto") as File,
    };
    await proy.update(ctx, proyecto);
  })
  .delete("/:id/:fecha", async (ctx) => {
    const id = parseInt(ctx.params.id);
    const fecha = ctx.params.fecha;

    await proy.delete(ctx, id, fecha);
  });
//rutas adicionales
proyecto.use("/dep/tipo", tipo.routes(), tipo.allowedMethods());
proyecto.use("/dep/reunion", reunion.routes(), reunion.allowedMethods());
proyecto.use("/dep/pago", pago.routes(), pago.allowedMethods());
proyecto.use("/dep/direccion", direccion.routes(), direccion.allowedMethods());
proyecto.use("/dep/fase", fase.routes(), fase.allowedMethods());
proyecto.use("/dep/fase/add/documento", documento.routes(), documento.allowedMethods());


export default proyecto;
