import { Router } from "@oak/oak";
import { CrudTipo } from "./controller/crud.controller.ts";
import TipoModel from "./model.ts";
import { ResponseOak } from "../../../../libs/response.ts"; 

const tipo = new Router();
const tip = new CrudTipo();

tipo
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
      await tip.select(ctx, proy, 0);
    } catch (error) {
      console.error("Error en GET /tipo-proyectos:", error);
      return ResponseOak(ctx, 500, {
        error: "Error al obtener tipos"
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
      
      await tip.select(ctx, proy, id);
    } catch (error) {
      console.error("Error en GET /tipo-proyectos/:id", error);
      return ResponseOak(ctx, 500, {
        error: "Error al obtener tipo"
      }, {
        content: "Content-Type",
        app: "application/json",
      });
    }
  })
  .post("/", async (ctx) => {
    try {      
      const body = await ctx.request.body.formData();
      
      const tipo: TipoModel = {
        proy: parseInt(body.get("proy") as string),
        tipo: body.get("tipo") as string,
        subtipo: body.get("subtipo") as string,
      };
            
      await tip.create(ctx, tipo);
    } catch (error) {
      console.error("Error en POST /tipo-proyectos:", error);
      return ResponseOak(ctx, 500, {
        error: "Error al crear tipo: " + (error instanceof Error ? error.message : String(error))
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
      
      const tipo: TipoModel = {
        id: id,
        proy: parseInt(body.get("proy") as string),
        tipo: body.get("tipo") as string,
        subtipo: body.get("subtipo") as string,
      };
            
      await tip.update(ctx, tipo);
    } catch (error) {
      console.error("Error en PUT /tipo-proyectos/:id:", error);
      return ResponseOak(ctx, 500, {
        error: "Error al actualizar tipo: " + (error instanceof Error ? error.message : String(error))
      }, {
        content: "Content-Type",
        app: "application/json",
      });
    }
  })
  .delete("/:id", async (ctx) => {
    try {
      const id = parseInt(ctx.params.id);
      await tip.delete(ctx, id);
    } catch (error) {
      console.error("Error en DELETE /tipo-proyectos/:id", error);
      return ResponseOak(ctx, 500, {
        error: "Error al eliminar tipo"
      }, {
        content: "Content-Type",
        app: "application/json",
      });
    }
  });

export default tipo;