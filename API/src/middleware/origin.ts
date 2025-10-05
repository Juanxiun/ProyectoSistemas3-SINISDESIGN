import { Context } from "node:vm";

export const restrinccion = async (ctx: Context) => {
    const origen  = ctx.request.headers.get("origin") ?? "";

    console.log(origen);

    if(origen != "http://localhost:4200"){

        ctx.response.status = 403;
        ctx.response.body = {
            error: "Acceso no valido..."
        }
        return;
    }

    return;
}