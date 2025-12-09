import { Context } from "@oak/oak";
import { GetHistorial } from "../query/historial.query.ts";
import { ResponseOak } from "../../../libs/response.ts";

export class HistorialPagosController {
  async listar(ctx: Context) {
    const filtros = ctx.request.url.searchParams;

    const result = await GetHistorial({
      proy: filtros.get("proy"),
      accion: filtros.get("accion"),
      fechaInicio: filtros.get("fechaInicio"),
      fechaFin: filtros.get("fechaFin"),
      texto: filtros.get("texto")
    });

    return ResponseOak(
      ctx,
      result.std,
      { msg: "Historial obtenido", data: result.data },
      {
        content: "Content-Type",
        app: "application/json",
      }
    );
  }
}
