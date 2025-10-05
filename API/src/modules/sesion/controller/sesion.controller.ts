import { Context } from "@oak/oak";
import { SesionQuery } from "../query/sesion.query.ts";
import sesionModel from "../model.ts";
import { ResponseOak } from "../../../libs/response.ts";

export class SesionController {
  public async login(ctx: Context, usr: string, pass: string) {
    const sesion = await SesionQuery(usr, pass);
    const login: sesionModel[] = sesion.data ?? [];

    if (sesion.std === 500) {
      return ResponseOak(ctx, 500, {
        error: "Error interno del servidor.",
        data: login,
      }, {
        content: "Content-Type",
        app: "application/json",
      });
    } else {
      return ResponseOak(ctx, sesion.std, {
        msg: sesion.msg,
        data: login,
      }, {
        content: "Content-Type",
        app: "application/json",
      });
    }
  }
}
