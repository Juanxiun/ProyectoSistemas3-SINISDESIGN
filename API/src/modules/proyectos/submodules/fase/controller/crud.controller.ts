import { Context } from "@oak/oak";
import FaseModel from "../model.ts";
import {
  CreateQuery,
  DeleteQuery,
  SelectQuery,
  UpdateQuery,
} from "../query/crud.query.ts";
import { ResponseOak } from "../../../../../libs/response.ts";

export class CrudFase {
  public async select(ctx: Context, proy: number, id: number) {
    const fases = await SelectQuery(proy, id);
    const fase: FaseModel[] = fases.data ?? [];

    if (fases.std === 500) {
      return ResponseOak(ctx, 500, {
        error: "Error interno del servidor.",
        data: fase,
      }, {
        content: "Content-Type",
        app: "application/json",
      });
    } else {
      const std = fase.length > 0 ? 200 : 400;
      return ResponseOak(ctx, std, {
        msg: std === 200 ? "Exito." : "Ningun registro encontrado",
        data: fase,
      }, {
        content: "Content-Type",
        app: "application/json",
      });
    }
  }

  public async create(ctx: Context, fase: FaseModel) {
    const result = await CreateQuery(fase);

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

  public async update(ctx: Context, fase: FaseModel) {
    const result = await UpdateQuery(fase);
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

  public async delete(ctx: Context, final: string, id: number) {
    const result = await DeleteQuery(id, final);
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
