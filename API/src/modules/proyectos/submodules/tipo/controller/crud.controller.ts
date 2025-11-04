import { Context } from "@oak/oak";
import TipoModel from "../model.ts";
import {
  CreateQuery,
  DeleteQuery,
  SelectQuery,
  UpdateQuery,
} from "../query/crud.query.ts";
import { ResponseOak } from "../../../../../libs/response.ts";

export class CrudTipo {
  public async select(ctx: Context, proy: number, id: number) {
    try {
      console.log(`🔍 Buscando tipo - proy: ${proy}, id: ${id}`);
      
      const tipos = await SelectQuery(proy, id);
      const tipoList: TipoModel[] = tipos.data ?? [];

      console.log(`📊 Resultados encontrados: ${tipoList.length}`);

      if (tipos.std === 500) {
        return ResponseOak(ctx, 500, {
          error: "Error interno del servidor al obtener tipos.",
          data: tipoList,
        }, {
          content: "Content-Type",
          app: "application/json",
        });
      } else {
        const std = tipoList.length > 0 ? 200 : 404;
        return ResponseOak(ctx, std, {
          msg: std === 200 ? "Éxito." : "Ningún registro encontrado",
          data: tipoList,
        }, {
          content: "Content-Type",
          app: "application/json",
        });
      }
    } catch (error) {
      console.error("Error en CrudTipo.select:", error);
      return ResponseOak(ctx, 500, {
        error: "Error en el servidor: " + (error instanceof Error ? error.message : String(error))
      }, {
        content: "Content-Type",
        app: "application/json",
      });
    }
  }

  public async create(ctx: Context, tipo: TipoModel) {
    try {
      console.log("➕ Creando tipo:", tipo);
      
      const result = await CreateQuery(tipo);

      if (result.std === 500) {
        return ResponseOak(ctx, 500, {
          error: "Error interno del servidor al crear tipo.",
        }, {
          content: "Content-Type",
          app: "application/json",
        });
      } else {
        return ResponseOak(ctx, 200, {
          msg: "Creación exitosa!",
        }, {
          content: "Content-Type",
          app: "application/json",
        });
      }
    } catch (error) {
      console.error("Error en CrudTipo.create:", error);
      return ResponseOak(ctx, 500, {
        error: "Error en el servidor: " + (error instanceof Error ? error.message : String(error))
      }, {
        content: "Content-Type",
        app: "application/json",
      });
    }
  }

  public async update(ctx: Context, tipo: TipoModel) {
    try {
      console.log("✏️ Actualizando tipo:", tipo);
      
      const result = await UpdateQuery(tipo);
      
      if (result.std === 500) {
        return ResponseOak(ctx, 500, {
          error: "Error interno del servidor al actualizar tipo.",
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
      console.error("Error en CrudTipo.update:", error);
      return ResponseOak(ctx, 500, {
        error: "Error en el servidor: " + (error instanceof Error ? error.message : String(error))
      }, {
        content: "Content-Type",
        app: "application/json",
      });
    }
  }

  public async delete(ctx: Context, id: number) {
    try {
      console.log(`🗑️ Eliminando tipo ID: ${id}`);
      
      const result = await DeleteQuery(id);
      
      if (result.std === 500) {
        return ResponseOak(ctx, 500, {
          error: "Error interno del servidor al eliminar tipo.",
        }, {
          content: "Content-Type",
          app: "application/json",
        });
      } else {
        return ResponseOak(ctx, 200, {
          msg: "Eliminación exitosa!",
        }, {
          content: "Content-Type",
          app: "application/json",
        });
      }
    } catch (error) {
      console.error("Error en CrudTipo.delete:", error);
      return ResponseOak(ctx, 500, {
        error: "Error en el servidor: " + (error instanceof Error ? error.message : String(error))
      }, {
        content: "Content-Type",
        app: "application/json",
      });
    }
  }
}