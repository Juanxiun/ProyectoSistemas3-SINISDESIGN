import { Router, RouterContext } from "@oak/oak";
import { CrudInformaciones } from "./controller/crud.controller.ts";

type ArquitectoParams = { codigo: string; id?: string };
type ArquitectoRouterContext = RouterContext<string, ArquitectoParams>;

const Informaciones = new CrudInformaciones();
const router = new Router();

const extractCodigo = async (ctx: ArquitectoRouterContext, next: () => Promise<unknown>) => {
    const codigo = ctx.params.codigo;
    if (codigo) {
        ctx.state.arq = codigo;
    }
    await next();
};

router

    .get("/", extractCodigo, async (ctx: ArquitectoRouterContext) => {
        const arq = ctx.state.arq as string;
        await Informaciones.select(ctx, arq);
    })


    .get("/:id", extractCodigo, async (ctx: ArquitectoRouterContext) => {
        const arq = ctx.state.arq as string;
        const id = parseInt(ctx.params.id as string);
        await Informaciones.select(ctx, arq, id);
    })


    .post("/", extractCodigo, async (ctx: ArquitectoRouterContext) => {
        await Informaciones.create(ctx);
    })


    .put("/:id", extractCodigo, async (ctx: ArquitectoRouterContext) => {
        const arq = ctx.state.arq as string;
        const id = parseInt(ctx.params.id as string);
        await Informaciones.update(ctx, arq, id);
    })


    .delete("/:id", extractCodigo, async (ctx: ArquitectoRouterContext) => {
        const arq = ctx.state.arq as string;
        const id = parseInt(ctx.params.id as string);
        await Informaciones.delete(ctx, id, arq);
    });

export default router;