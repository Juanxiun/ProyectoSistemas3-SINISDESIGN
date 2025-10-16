import { Context } from "@oak/oak";
import { ResponseOak } from "../../../libs/response.ts";
import {
  AvanceProyectoQuery,
  DepartamentosQuery,
  GananciaQuery,
  ProyTerminadoQuery,
  TipoProyectoQuery,
} from "../query/reporte.query.ts";

export class ReporteController {
  public async ganancia(ctx: Context) {
    const searchParams = ctx.request.url.searchParams;
    const arq = searchParams.get("arq");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!arq || !startDate || !endDate) {
      return ResponseOak(ctx, 400, {
        msg: "Faltan parámetros: arq, startDate y endDate son requeridos.",
      }, {
        content: "Content-Type",
        app: "application/json",
      });
    }

    const result = await GananciaQuery(arq, startDate, endDate);
    return ResponseOak(ctx, result.std, {
      msg: result.msg || "Éxito",
      data: result.data,
    }, {
      content: "Content-Type",
      app: "application/json",
    });
  }

  public async departamentos(ctx: Context) {
    const searchParams = ctx.request.url.searchParams;
    const arq = searchParams.get("arq");
    const pais = searchParams.get("pais");

    if (!arq || !pais) {
      return ResponseOak(ctx, 400, {
        msg: "Faltan parámetros: arq y pais son requeridos.",
      }, {
        content: "Content-Type",
        app: "application/json",
      });
    }

    const result = await DepartamentosQuery(arq, pais);
    return ResponseOak(ctx, result.std, {
      msg: result.msg || "Éxito",
      data: result.data,
    }, {
      content: "Content-Type",
      app: "application/json",
    });
  }

  public async proyTerminado(ctx: Context) {
    const searchParams = ctx.request.url.searchParams;
    const arq = searchParams.get("arq");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!arq || !startDate || !endDate) {
      return ResponseOak(ctx, 400, {
        msg: "Faltan parámetros: arq, startDate y endDate son requeridos.",
      }, {
        content: "Content-Type",
        app: "application/json",
      });
    }

    const result = await ProyTerminadoQuery(arq, startDate, endDate);
    return ResponseOak(ctx, result.std, {
      msg: result.msg || "Éxito",
      data: result.data,
    }, {
      content: "Content-Type",
      app: "application/json",
    });
  }

  public async avanceProyecto(ctx: Context) {
    const searchParams = ctx.request.url.searchParams;
    const arq = searchParams.get("arq");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!arq || !startDate || !endDate) {
      return ResponseOak(ctx, 400, {
        msg: "Faltan parámetros: arq, startDate y endDate son requeridos.",
      }, {
        content: "Content-Type",
        app: "application/json",
      });
    }

    const result = await AvanceProyectoQuery(arq, startDate, endDate);
    return ResponseOak(ctx, result.std, {
      msg: result.msg || "Éxito",
      data: result.data,
    }, {
      content: "Content-Type",
      app: "application/json",
    });
  }

  public async tipoProyecto(ctx: Context) {
    const searchParams = ctx.request.url.searchParams;
    const arq = searchParams.get("arq");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!arq || !startDate || !endDate) {
      return ResponseOak(ctx, 400, {
        msg: "Faltan parámetros: arq, startDate y endDate son requeridos.",
      }, {
        content: "Content-Type",
        app: "application/json",
      });
    }

    const result = await TipoProyectoQuery(arq, startDate, endDate);
    return ResponseOak(ctx, result.std, {
      msg: result.msg || "Éxito",
      data: result.data,
    }, {
      content: "Content-Type",
      app: "application/json",
    });
  }
}
