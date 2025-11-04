import { Router } from "@oak/oak";
import { CrudProyectos } from "./controller/crud.controller.ts";
import ProyectoModel from "./model.ts";
import { ListProyecto } from "./controller/list.controller.ts";
import { ResponseOak } from "../../libs/response.ts";

const proyecto = new Router();
const proy = new CrudProyectos();
const list = new ListProyecto();

proyecto
  .get("/p/list/:user", async (ctx) => {
    const user = ctx.params.user;
    if (user === "x") {
      await list.ListView(ctx);
    } else {
      await list.List(ctx, user);
    }
  })

  .get("/:usr/:id", async (ctx) => {
    const id = parseInt(ctx.params.id);
    const usr = ctx.params.usr;
    await proy.select(ctx, id, usr);
  })

  .get("/:user", async (ctx) => {
    const usr = ctx.params.user;
    await proy.select(ctx, 0, usr);
  })

  .post("/", async (ctx) => {
    try {
      const form = await ctx.request.body.formData();
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
    try {
      const id = parseInt(ctx.params.id);
      const form = await ctx.request.body.formData();

      if (!form.has("nombre") || !form.has("inicio") || !form.has("costo")) {
        return ResponseOak(ctx, 400, {
          error: "Faltan campos requeridos: nombre, inicio, costo",
        }, {
          content: "Content-Type",
          app: "application/json",
        });
      }

      const imagenFile = form.get("imagen");
      let imagenParaProcesar: File | string = "";
      if (imagenFile && imagenFile instanceof File && imagenFile.size > 0) {
        const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!tiposPermitidos.includes(imagenFile.type)) {
          return ResponseOak(ctx, 400, {
            error: "Formato de imagen no soportado. Use JPG, PNG o WebP",
          }, {
            content: "Content-Type",
            app: "application/json",
          });
        }
        const maxSize = 5 * 1024 * 1024;
        if (imagenFile.size > maxSize) {
          return ResponseOak(ctx, 400, {
            error: `La imagen no puede exceder 5MB.`,
          }, {
            content: "Content-Type",
            app: "application/json",
          });
        }
        imagenParaProcesar = imagenFile;
      }

      const fechaFinal = form.get("final") as string;
      const tieneFechaFinal = fechaFinal && fechaFinal.trim() !== "";

      const proyecto: ProyectoModel = {
        id: id,
        arq: form.get("arq") as string,
        cli: parseInt(form.get("cli") as string),
        nombre: form.get("nombre") as string,
        inicio: form.get("inicio") as string,
        costo: parseFloat(form.get("costo") as string),
        est: form.has("est") ? parseInt(form.get("est") as string) : 1,
        imagen: imagenParaProcesar,
        final: tieneFechaFinal ? fechaFinal : undefined,
      };

      await proy.update(ctx, proyecto);
    } catch (error) {
      console.error("Error en PUT /proyectos/:id:", error);
      return ResponseOak(ctx, 500, {
        error: "Error en el servidor: " + (error instanceof Error ? error.message : String(error)),
      }, {
        content: "Content-Type",
        app: "application/json",
      });
    }
  })

  .delete("/:id", async (ctx) => {
    const id = parseInt(ctx.params.id);
    if (isNaN(id)) {
      return ResponseOak(ctx, 400, { error: "ID inválido" }, {
        content: "Content-Type",
        app: "application/json",
      });
    }
    await proy.delete(ctx, id);
  });

export default proyecto;
