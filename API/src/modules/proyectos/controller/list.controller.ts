import { Context } from "@oak/oak";
import { ResponseOak } from "../../../libs/response.ts";
import { ProyectoList } from "../model.ts";
import { ProyecectoList } from "../query/list.query.ts";

export class ListProyecto {
  public async List(ctx: Context, usr: string) {
    const proyectos = await ProyecectoList(usr);
    const proy: ProyectoList[] = proyectos.data ?? [];

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
}
