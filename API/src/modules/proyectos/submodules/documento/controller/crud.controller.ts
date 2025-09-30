import { Context } from "@oak/oak";
import DocumentoModel from "../model.ts";
import {
  CreateQuery,
  DeleteQuery,
  SelectQuery,
  UpdateQuery,
} from "../query/crud.query.ts";
import { ResponseOak } from "../../../../../libs/response.ts";

export class CrudDocumento {
  public async select(ctx: Context, fase: number, id: number) {
    const documentos = await SelectQuery(fase, id);
    const doc: DocumentoModel[] = documentos.data ?? [];

    if (documentos.std === 500) {
      return ResponseOak(ctx, 500, {
        error: "Error interno del servidor.",
        data: doc,
      }, {
        content: "Content-Type",
        app: "application/json",
      });
    } else {
      const std = doc.length > 0 ? 200 : 400;
      return ResponseOak(ctx, std, {
        msg: std === 200 ? "Exito." : "Ningun registro encontrado",
        data: doc,
      }, {
        content: "Content-Type",
        app: "application/json",
      });
    }
  }

  public async create(ctx: Context, documento: DocumentoModel) {
    const result = await CreateQuery(documento);

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

  public async update(ctx: Context, documento: DocumentoModel) {
    const result = await UpdateQuery(documento);
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
