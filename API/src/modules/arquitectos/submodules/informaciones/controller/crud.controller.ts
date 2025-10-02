import { Context } from "@oak/oak/context";
import { ResponseOak } from "../../../../../libs/response.ts";
import InformacionModel from "../model.ts";
import {
    CreateQuery,
    SelectQuery,
    UpdateQuery,
    DeleteQuery,
} from "../query/crud.query.ts";

export class CrudInformaciones {


    public async select(ctx: Context, arq: string, id?: number) {
        const res = await SelectQuery(arq, id);

        return ResponseOak(
            ctx,
            res.std,
            {
                msg: res.std === 200 ? "Éxito." : "Error al obtener información.",
                data: res.data,
            },
            { content: "Content-Type", app: "application/json" },
        );
    }



    public async create(ctx: Context) {
        try {
            const form = await ctx.request.body.formData();

            const fotoFile = form.get("foto") as File | null;

            const data: InformacionModel = {
                arq: form.get("arq") as string,
                foto: fotoFile ?? "",
                universidad: form.get("universidad") as string,
                titulacion: form.get("titulacion") as string,
                descripcion: form.get("descripcion") as string,
            };

            const result = await CreateQuery(data);

            if (result.std === 500) {
                return ResponseOak(
                    ctx,
                    500,
                    {
                        error: "Error interno del servidor al crear información.",
                    },
                    {
                        content: "Content-Type",
                        app: "application/json",
                    }
                );
            } else {
                return ResponseOak(
                    ctx,
                    200,
                    {
                        msg: "Creación exitosa!.",
                    },
                    {
                        content: "Content-Type",
                        app: "application/json",
                    }
                );
            }
        } catch (error) {
            console.error("Error en el controller: Informaciones > Create >", error);
            return ResponseOak(
                ctx,
                500,
                {
                    error: "Error en el servidor al procesar la solicitud.",
                },
                {
                    content: "Content-Type",
                    app: "application/json",
                }
            );
        }
    }


    public async update(ctx: Context, arq: string, id: number) {
        const form = await ctx.request.body.formData();

        const fotoFile = form.get("foto") as File | null;

        const informacion: InformacionModel = {
            id: id,
            arq: arq,
            foto: fotoFile ?? "",
            universidad: form.get("universidad") as string,
            titulacion: form.get("titulacion") as string,
            descripcion: form.get("descripcion") as string,
        };

        if (!informacion.id || !informacion.arq || !informacion.universidad) {
            return ResponseOak(
                ctx,
                400,
                { msg: "Faltan campos obligatorios ." },
                { content: "Content-Type", app: "application/json" }
            );
        }

        const res = await UpdateQuery(informacion);

        return ResponseOak(
            ctx,
            res.std,
            {
                msg: res.std === 200 ? "Información actualizada exitosamente." : "Error al actualizar información.",
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
                msg: res.std === 200 ? "Información eliminada exitosamente." : "Error al eliminar información.",
            },
            { content: "Content-Type", app: "application/json" },
        );
    }
}