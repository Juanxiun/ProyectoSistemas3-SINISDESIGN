import { Context } from "@oak/oak/context";
import { ResponseOak } from "../../../libs/response.ts";
import { ListQueryArq, ListQueryArqFull } from "../query/list.query.ts";

export class ListArquitectos {

  public async ListArquitecto(ctx: Context, p: number) {
    const res = p === 1 ? await ListQueryArq() : await ListQueryArqFull();

    return ResponseOak(
      ctx,
      res.std,
      {
        msg: res.std === 200
          ? "proyectos listados"
          : "Error al recuperar los proyectos",
        data: res.data,
      },
      {
        content: "Content-Type",
        app: "application/json",
      },
    );
  }
}
