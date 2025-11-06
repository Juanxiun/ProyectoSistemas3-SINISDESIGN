import { Context } from "@oak/oak";
import ReunionModel from "../model.ts";
import {
  CreateQuery,
  DeleteQuery,
  SelectQuery,
  UpdateQuery,
} from "../query/crud.query.ts";
import { ResponseOak } from "../../../../../libs/response.ts";

export class CrudReunion {
  public async select(ctx: Context, proy: number, id: number) {
    const reuniones = await SelectQuery(proy, id);
    const reunion: ReunionModel[] = reuniones.data ?? [];

    if (reuniones.std === 500) {
      return ResponseOak(ctx, 500, {
        error: "Error interno del servidor.",
        data: reunion,
      }, {
        content: "Content-Type",
        app: "application/json",
      });
    } else {
      const std = reunion.length > 0 ? 200 : 400;
      return ResponseOak(ctx, std, {
        msg: std === 200 ? "Exito." : "Ningun registro encontrado",
        data: reunion,
      }, {
        content: "Content-Type",
        app: "application/json",
      });
    }
  }

  public async create(ctx: Context, reunion: ReunionModel) {
    const result = await CreateQuery(reunion);

    if (result.std === 500) {
      return ResponseOak(ctx, 500, {
        error: "Error interno del servidor.",
      }, {
        content: "Content-Type",
        app: "application/json",
      });
    } else {
      // devolver insertId si está disponible
      return ResponseOak(ctx, 200, {
        msg: "Creacion exitosa!.",
        id: result.insertId ?? undefined,
      }, {
        content: "Content-Type",
        app: "application/json",
      });
    }
  }

  public async update(ctx: Context, reunion: ReunionModel) {
    const result = await UpdateQuery(reunion);
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
