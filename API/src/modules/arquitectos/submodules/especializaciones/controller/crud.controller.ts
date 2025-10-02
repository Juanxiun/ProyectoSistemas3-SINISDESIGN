import { Context } from "@oak/oak/context";
import { ResponseOak } from "../../../../../libs/response.ts";
import EspecializacionModel from "../model.ts";
import {
    CreateQuery,
    SelectQuery,
    UpdateQuery,
    DeleteQuery,
} from "../query/crud.query.ts";

export class CrudEspecializaciones {


    public async select(ctx: Context, arq: string, id?: number) {
        const res = await SelectQuery(arq, id);

        return ResponseOak(
            ctx,
            res.std,
            {
                msg: res.std === 200 ? "Éxito." : "Error al obtener especializaciones.",
                data: res.data,
            },
            { content: "Content-Type", app: "application/json" },
        );
    }

    public async create(ctx: Context, arq: string) {
        const form = await ctx.request.body.formData();

        const especializacion: EspecializacionModel = {
            arq: arq,
            especialidad: form.get("especialidad") as string,
        };

        if (!especializacion.arq || !especializacion.especialidad) {
            return ResponseOak(
                ctx,
                400,
                { msg: "Faltan campos obligatorios (Arq y Especialidad)." },
                { content: "Content-Type", app: "application/json" }
            );
        }

        const res = await CreateQuery(especializacion);

        return ResponseOak(
            ctx,
            res.std,
            {
                msg: res.std === 200 ? "Especialización creada exitosamente." : "Error al crear especialización.",
            },
            { content: "Content-Type", app: "application/json" },
        );
    }


    public async update(ctx: Context, arq: string, id: number) {
        const form = await ctx.request.body.formData();

        const especializacion: EspecializacionModel = {

            id: id,
            arq: arq,
            especialidad: form.get("especialidad") as string,
        };

        if (!especializacion.id || !especializacion.arq || !especializacion.especialidad) {
            return ResponseOak(
                ctx,
                400,
                { msg: "Faltan campos obligatorios (ID, Arq y Especialidad)." },
                { content: "Content-Type", app: "application/json" }
            );
        }

        const res = await UpdateQuery(especializacion);

        return ResponseOak(
            ctx,
            res.std,
            {
                msg: res.std === 200 ? "Especialización actualizada exitosamente." : "Error al actualizar especialización.",
            },
            { content: "Content-Type", app: "application/json" },
        );
    }


    public async delete(ctx: Context, id: number, arq: string) {
        if (!id || !arq) {
            return ResponseOak(
                ctx,
                400,
                { msg: "El ID y el código de arquitecto son obligatorios para la eliminación." },
                { content: "Content-Type", app: "application/json" },
            );
        }

        const res = await DeleteQuery(id, arq);

        return ResponseOak(
            ctx,
            res.std,
            {
                msg: res.std === 200 ? "Especialización eliminada exitosamente." : "Error al eliminar especialización.",
            },
            { content: "Content-Type", app: "application/json" },
        );
    }
}