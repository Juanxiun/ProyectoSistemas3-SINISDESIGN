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
    const tipos = await SelectQuery(proy, id);
    const tipo: TipoModel[] = tipos.data ?? [];

    if (tipos.std === 500) {
      return ResponseOak(ctx, 500, {
        error: "Error interno del servidor.",
        data: tipo,
      }, {
        content: "Content-Type",
        app: "application/json",
      });
    } else {
      const std = tipo.length > 0 ? 200 : 400;
      return ResponseOak(ctx, std, {
        msg: std === 200 ? "Exito." : "Ningun registro encontrado",
        data: tipo,
      }, {
        content: "Content-Type",
        app: "application/json",
      });
    }
  }

  public async create(ctx: Context, tipo: TipoModel) {
    const result = await CreateQuery(tipo);

    if (result.std === 500) {
      return ResponseOak(ctx, 500, {
        error: "Error interno del servidor.",
      }, {
        content: "Content-Type",
        app: "application/json",
      });
    } else {
      return ResponseOak(ctx, 200, {
        msg: "Creacion exitosa!.",
      }, {
        content: "Content-Type",
        app: "application/json",
      });
    }
  }

  public async update(ctx: Context, tipo: TipoModel) {
    const result = await UpdateQuery(tipo);
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

  public async delete(ctx: Context, id: number) {
    const result = await DeleteQuery(id);
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
