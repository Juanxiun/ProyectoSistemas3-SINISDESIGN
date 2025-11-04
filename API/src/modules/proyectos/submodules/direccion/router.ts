import { Router } from "@oak/oak";
import { CrudDireccion } from "./controller/crud.controller.ts";
import DireccionModel from "./model.ts";
import { ResponseOak } from "../../../../libs/response.ts";

const direccion = new Router();
const dir = new CrudDireccion();

direccion
  .get("/", async (ctx) => {
    try {
      const proy = parseInt(ctx.request.url.searchParams.get("proy") || "0");
      if (!proy) {
        return ResponseOak(ctx, 400, {
          error: "El parámetro 'proy' es requerido"
        }, {
          content: "Content-Type",
          app: "application/json",
        });
      }
      await dir.select(ctx, proy, 0);
    } catch (error) {
      console.error("Error en GET /direccion-proyectos:", error);
      return ResponseOak(ctx, 500, {
        error: "Error al obtener direcciones"
      }, {
        content: "Content-Type",
        app: "application/json",
      });
    }
  })
  .get("/:id", async (ctx) => {
    try {
      const id = parseInt(ctx.params.id);
      const proy = parseInt(ctx.request.url.searchParams.get("proy") || "0");
      
      if (!proy) {
        return ResponseOak(ctx, 400, {
          error: "El parámetro 'proy' es requerido"
        }, {
          content: "Content-Type",
          app: "application/json",
        });
      }
      
      await dir.select(ctx, proy, id);
    } catch (error) {
      console.error("Error en GET /direccion-proyectos/:id", error);
      return ResponseOak(ctx, 500, {
        error: "Error al obtener dirección"
      }, {
        content: "Content-Type",
        app: "application/json",
      });
    }
  })
  .post("/", async (ctx) => {
    try {      
      const body = await ctx.request.body.formData();
            
      const direccion: DireccionModel = {
        proy: parseInt(body.get("proy") as string),
        pais: body.get("pais") as string,
        departamento: body.get("departamento") as string,
        zona: body.get("zona") as string,
        calle: body.get("calle") as string,
        puerta: parseInt(body.get("puerta") as string),
      };
            
      await dir.create(ctx, direccion);
    } catch (error) {
      console.error("Error en POST /direccion-proyectos:", error);
      return ResponseOak(ctx, 500, {
        error: "Error al crear dirección: " + (error instanceof Error ? error.message : String(error))
      }, {
        content: "Content-Type",
        app: "application/json",
      });
    }
  })
  .put("/:id", async (ctx) => {
    try {
      const id = parseInt(ctx.params.id);
      const body = await ctx.request.body.formData();
      
      const direccion: DireccionModel = {
        id: id,
        proy: parseInt(body.get("proy") as string),
        pais: body.get("pais") as string,
        departamento: body.get("departamento") as string,
        zona: body.get("zona") as string,
        calle: body.get("calle") as string,
        puerta: parseInt(body.get("puerta") as string),
      };
            
      await dir.update(ctx, direccion);
    } catch (error) {
      console.error("Error en PUT /direccion-proyectos/:id:", error);
      return ResponseOak(ctx, 500, {
        error: "Error al actualizar dirección: " + (error instanceof Error ? error.message : String(error))
      }, {
        content: "Content-Type",
        app: "application/json",
      });
    }
  })
  .delete("/:id", async (ctx) => {
    try {
      const id = parseInt(ctx.params.id);
      await dir.delete(ctx, id);
    } catch (error) {
      console.error("Error en DELETE /direccion-proyectos/:id", error);
      return ResponseOak(ctx, 500, {
        error: "Error al eliminar dirección"
      }, {
        content: "Content-Type",
        app: "application/json",
      });
    }
  });

export default direccion;