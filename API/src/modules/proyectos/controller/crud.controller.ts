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
      const result = await CreateQuery(proyectos);
            
      if (result.std === 500) {
        return ResponseOak(ctx, 500, {
          error: "Error interno del servidor.",
        }, {
          content: "Content-Type",
          app: "application/json",
        });
      } else {
        const responseData: any = {
          std: 200,
          msg: "Creacion exitosa!.",
        };
        
        if (result.id) {
          responseData.id = result.id;
        }
        
        return ResponseOak(ctx, 200, responseData, {
          content: "Content-Type",
          app: "application/json",
        });
      }
    } catch (error) {
      return ResponseOak(ctx, 500, {
        error: "Error en el servidor: " + (error instanceof Error ? error.message : String(error)),
      }, {
        content: "Content-Type",
        app: "application/json",
      });
    }
  }

  public async update(ctx: Context, proyectos: ProyectoModel) {
    try {
      const result = await UpdateQuery(proyectos);
      
      if (result.std === 500) {
        return ResponseOak(ctx, 500, {
          error: "Error interno del servidor al actualizar.",
        }, {
          content: "Content-Type",
          app: "application/json",
        });
      } else {
        return ResponseOak(ctx, 200, {
          msg: "Actualización exitosa!",
        }, {
          content: "Content-Type",
          app: "application/json",
        });
      }
    } catch (error) {
      return ResponseOak(ctx, 500, {
        error: "Error en el servidor: " + (error instanceof Error ? error.message : String(error)),
      }, {
        content: "Content-Type",
        app: "application/json",
      });
    }
  }

  public async delete(ctx: Context, id: number) {
  try {
    console.log(`Intentando eliminar proyecto ID: ${id}`);
    
    const result = await DeleteQuery(id);
    
    if (result.std === 500) {
      console.error(`Error en DeleteQuery para ID: ${id}`);
      return ResponseOak(ctx, 500, {
        error: "Error interno del servidor al eliminar.",
      }, {
        content: "Content-Type",
        app: "application/json",
      });
    } else {
      console.log(`Proyecto ID: ${id} eliminado exitosamente`);
      return ResponseOak(ctx, 200, {
        msg: "Eliminación exitosa!",
        id: id 
      }, {
        content: "Content-Type",
        app: "application/json",
      });
    }
  } catch (error) {
    console.error(`Excepción en delete para ID ${id}:`, error);
    return ResponseOak(ctx, 500, {
      error: "Error en el servidor: " + (error instanceof Error ? error.message : String(error)),
    }, {
      content: "Content-Type",
      app: "application/json",
    });
  }
}
}