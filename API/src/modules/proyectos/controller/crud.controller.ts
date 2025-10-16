import { Context } from "@oak/oak";
import ProyectoModel from "../model.ts";
import {
  CreateQuery,
  DeleteQuery,
  SelectQuery,
  UpdateQuery,
} from "../query/crud.query.ts";
import { ResponseOak } from "../../../libs/response.ts";

export class CrudProyectos {
  public async select(ctx: Context, id: number, arq: string) {
    const proyectos = await SelectQuery(arq, id);
    const proy: ProyectoModel[] = proyectos.data ?? [];

    if (proyectos.std === 500) {
      return ResponseOak(ctx, 500, {
        error: "Error interno del servidor.",
        data: proy,
      }, {
        content: "Content-Type",
        app: "application/json",
      });
    } else {
      const std = proy.length > 0 ? 200 : 400;
      return ResponseOak(ctx, std, {
        msg: std === 200 ? "Exito." : "Ningun registro encontrado",
        data: proy,
      }, {
        content: "Content-Type",
        app: "application/json",
      });
    }
  }

public async create(ctx: Context, proyectos: ProyectoModel) {
    try {
      console.log("=== INICIANDO CREATE ===");
      console.log("Proyecto recibido:", proyectos);
      
      const result = await CreateQuery(proyectos);
      
      console.log("Resultado de CreateQuery:", result);

      if (result.std === 500) {
        return ResponseOak(ctx, 500, {
          error: "Error interno del servidor.",
        }, {
          content: "Content-Type",
          app: "application/json",
        });
      } else {
        // Verificar si result tiene id antes de usarlo
        const responseData: any = {
          msg: "Creacion exitosa!.",
        };
        
        // Solo agregar proyectoId si existe
        if ((result as any).id) {
          responseData.proyectoId = (result as any).id;
        }
        
        return ResponseOak(ctx, 200, responseData, {
          content: "Content-Type",
          app: "application/json",
        });
      }
    } catch (error) {
      console.error("=== ERROR EN CREATE ===");
      console.error("Error:", error);
      console.error("Stack:", error instanceof Error ? error.stack : "");
      
      return ResponseOak(ctx, 500, {
        error: "Error en el servidor: " + (error instanceof Error ? error.message : String(error)),
      }, {
        content: "Content-Type",
        app: "application/json",
      });
    }
  }

  public async update(ctx: Context, proyectos: ProyectoModel) {
    const result = await UpdateQuery(proyectos);
    if (result.std === 500) {
      return ResponseOak(ctx, 500, {
        error: "Error interno del servidor.",
      }, {
        content: "Content-Type",
        app: "application/json",
      });
    } else {
      return ResponseOak(ctx, 200, {
        msg: "Actualizacion exitosa!.",
      }, {
        content: "Content-Type",
        app: "application/json",
      });
    }
  }

  public async delete(ctx: Context, id: number, fecha: string) {
    const result = await DeleteQuery(id, fecha);
    if (result.std === 500) {
      return ResponseOak(ctx, 500, {
        error: "Error interno del servidor.",
      }, {
        content: "Content-Type",
        app: "application/json",
      });
    } else {
      return ResponseOak(ctx, 200, {
        msg: "Eliminacion exitosa!.",
      }, {
        content: "Content-Type",
        app: "application/json",
      });
    }
  }
}