import { Context } from "@oak/oak";
import { DeudaQuery } from "../query/deuda.query.ts";
import { DeudaModel } from "../model.ts";
import { ResponseOak } from "../../../../../libs/response.ts";

export class DeudaController {
  public async deuda(ctx: Context, proy: number) {
    const result = await DeudaQuery(proy);
    const deuda: DeudaModel[] = result.data ?? [];

    if (result.std === 500) {
      return ResponseOak(ctx, 500, {
        error: "Error interno del servidor",
        data: deuda,
      }, {
        content: "Content-Type",
        app: "application/json",
      });
    } else {
      const std = deuda.length > 0 ? 200 : 400;
      return ResponseOak(ctx, std, {
        msg: std === 200 ? "Exito." : "Ningun registro encontrado",
        data: deuda,
      }, {
        content: "Content-Type",
        app: "application/json",
      });
    }
  }
}
