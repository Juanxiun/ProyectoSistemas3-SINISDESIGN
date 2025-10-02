import { Router, RouterContext } from "@oak/oak";
import { CrudEspecializaciones } from "./controller/crud.controller.ts";

type ArquitectoParams = { codigo: string; id?: string };
type ArquitectoRouterContext = RouterContext<string, ArquitectoParams>;

const Especializaciones = new CrudEspecializaciones();
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
        await Especializaciones.select(ctx, arq);
    })


    .get("/:id", extractCodigo, async (ctx: ArquitectoRouterContext) => {
        const arq = ctx.state.arq as string;
        const id = parseInt(ctx.params.id as string);
        await Especializaciones.select(ctx, arq, id);
    })

    .post("/", extractCodigo, async (ctx: ArquitectoRouterContext) => {
        const arq = ctx.state.arq as string;
        await Especializaciones.create(ctx, arq);
    })

    .put("/:id", extractCodigo, async (ctx: ArquitectoRouterContext) => {
        const arq = ctx.state.arq as string;
        const id = parseInt(ctx.params.id as string);
        await Especializaciones.update(ctx, arq, id);
    })

    .delete("/:id", extractCodigo, async (ctx: ArquitectoRouterContext) => {
        const arq = ctx.state.arq as string;
        const id = parseInt(ctx.params.id as string);
        await Especializaciones.delete(ctx, id, arq);
    });

export default router;