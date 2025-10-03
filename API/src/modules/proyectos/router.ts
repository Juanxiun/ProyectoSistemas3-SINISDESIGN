import { Router } from "@oak/oak";
import { CrudProyectos } from "./controller/crud.controller.ts";
import ProyectoModel from "./model.ts";
import { ListProyecto } from "./controller/list.controller.ts";

//ininicar la clase proy  / iniciar las rutas
const proyecto = new Router();
const proy = new CrudProyectos();
const list = new ListProyecto();

//rutas
proyecto
  //crud
  .get("/:user", async (ctx) => {
    const usr = ctx.params.user;
    await proy.select(ctx, 0, usr);
  })
  .get("/:usr/:id", async (ctx) => {
    const id = parseInt(ctx.params.id);
    const usr = ctx.params.usr;
    await proy.select(ctx, id, usr);
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
  })

//Rutas adicionales 
  .get("/p/list/:user", async (ctx) => {
    const user = ctx.params.user;
    await list.List(ctx, user);

  })

export default proyecto;
