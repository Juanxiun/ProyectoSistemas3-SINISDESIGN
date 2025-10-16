import { Router } from "@oak/oak";
import { CrudProyectos } from "./controller/crud.controller.ts";
import ProyectoModel from "./model.ts";
import { ListProyecto } from "./controller/list.controller.ts";

const proyecto = new Router();
const proy = new CrudProyectos();
const list = new ListProyecto();

proyecto
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
    try {
      const form = await ctx.request.body.formData();
      
      console.log("FormData recibido:");
      console.log("arq:", form.get("arq"));
      console.log("cli:", form.get("cli"));
      console.log("nombre:", form.get("nombre"));
      console.log("inicio:", form.get("inicio"));
      console.log("costo:", form.get("costo"));
      console.log("imagen tipo:", form.get("imagen")?.constructor.name);

      const proyecto: ProyectoModel = {
        id: 0,
        arq: form.get("arq") as string,
        cli: parseInt(form.get("cli") as string),
        nombre: form.get("nombre") as string,
        inicio: form.get("inicio") as string,
        costo: parseFloat(form.get("costo") as string),
        imagen: form.get("imagen") as File,
      };
      await proy.create(ctx, proyecto);
    } catch (error) {
      console.error("Error en POST /proyectos:", error);
      throw error;
    }
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
      costo: parseFloat(form.get("costo") as string), 
      imagen: form.get("imagen") as File, 
    };
    await proy.update(ctx, proyecto);
  })
  
  // DELETE - Eliminar proyecto
  .delete("/:id/:fecha", async (ctx) => {
    const id = parseInt(ctx.params.id);
    const fecha = ctx.params.fecha;
    await proy.delete(ctx, id, fecha);
  })

  // GET - Listar proyectos
  .get("/p/list/:user", async (ctx) => {
    const user = ctx.params.user;
    await list.List(ctx, user);
  })

export default proyecto;