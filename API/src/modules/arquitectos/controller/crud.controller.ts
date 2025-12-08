import { Context } from "@oak/oak/context";
import { ResponseOak } from "../../../libs/response.ts";
import ArquitectoModel from "../model.ts";
import {
  CreateQuery,
  SelectQuery,
  UpdateQuery,
  DeleteQuery,
  checkAssignedProjects,
} from "../query/crud.query.ts";

import { hashPassARQ } from "../../../libs/hashPass.ts";

export class CrudArquitectos {


  public async select(ctx: Context, codigo?: string) {

    const res = await SelectQuery(codigo);


    return ResponseOak(
      ctx,
      res.std,
      {
        msg: res.std === 200 ? "Exito." : "Error al obtener datos.",
        data: res.data,
      },
      {
        content: "Content-Type",
        app: "application/json",
      },
    );
  }


  public async create(ctx: Context) {

    const form = await ctx.request.body.formData();


    const arquitecto: ArquitectoModel = {
      codigo: form.get("codigo") as string,
      ci: parseInt(form.get("ci") as string),
      nombre: form.get("nombre") as string,
      apellido: form.get("apellido") as string,
      telefono: parseInt(form.get("telefono") as string),
      correo: form.get("correo") as string,
      admin: parseInt(form.get("admin") as string),
      password: form.get("password") as string,
      estado: 1,
    };


    const infoData = {
      universidad: form.get("universidad") as string,
      titulacion: form.get("titulacion") as string,
      descripcion: form.get("descripcion") as string,
      fotoFile: form.get("foto") as File | null,
    };


    const especializacionesRaw = form.get("especializaciones") as string;
    let especializaciones: string[] = [];
    try {

      especializaciones = JSON.parse(especializacionesRaw || '[]');
    } catch (e) {
      console.error("Error al parsear especializaciones JSON:", e);
    }


    if (!arquitecto.ci || !arquitecto.nombre || !infoData.universidad || !infoData.titulacion || !infoData.descripcion) {
      return ResponseOak(
        ctx,
        400,
        { msg: "Faltan campos obligatorios para Arquitecto y/o Información Profesional." },
        { content: "Content-Type", app: "application/json" }
      );
    }



    const res = await CreateQuery(arquitecto, infoData, especializaciones);

    return ResponseOak(
      ctx,
      res.std,
      {
        msg: res.std === 200
          ? "Arquitecto y su información profesional creados exitosamente."
          : res.error || "Error al crear el arquitecto.",
      },
      {
        content: "Content-Type",
        app: "application/json",
      },
    );
  }


  public async update(ctx: Context) {
    const codigo = ((ctx as any).params as Record<string, string> | undefined)?.codigo;
    if (!codigo) {
      return ResponseOak(
        ctx,
        400,
        { msg: "Código requerido" },
        { content: "Content-Type", app: "application/json" },
      );
    }

    const updateBody = async (data: Record<string, string | number>) => {
      if ((data.hasOwnProperty('ci') && !data.ci) || (data.hasOwnProperty('nombre') && !data.nombre)) {
        return ResponseOak(
          ctx,
          400,
          { msg: "Faltan campos obligatorios" },
          { content: "Content-Type", app: "application/json" }
        );
      }

      const res = await UpdateQuery(codigo, data);

      if (res.std !== 200) {
        return ResponseOak(ctx, res.std, { msg: res.error || "Error al actualizar el arquitecto." }, { content: "Content-Type", app: "application/json" });
      }

      return ResponseOak(ctx, 200, { msg: "Arquitecto actualizado exitosamente.", data: res.data }, { content: "Content-Type", app: "application/json" });
    }

    try {
      let sourceData: Record<string, any> = {};
      const contentType = ctx.request.headers.get("content-type") || "";

      // 1. Detectar y Parsear según el Content-Type
      if (contentType.includes("application/json")) {
        // Para JSON usamos .json()
        sourceData = await (ctx.request.body as any).json();
      } else if (contentType.includes("multipart/form-data")) {
        // Para FormData usamos .formData() y convertimos a objeto simple
        const form = await ctx.request.body.formData();
        form.forEach((value, key) => {
          sourceData[key] = value;
        });
      } else {
        // Intento fallback genérico si no hay header específico
        try {
          sourceData = await (ctx.request.body as any).json();
        } catch {
          return ResponseOak(ctx, 400, { msg: "Formato de cuerpo no soportado (use JSON o FormData)." }, { content: "Content-Type", app: "application/json" });
        }
      }

      // 2. Lógica de validación de estado (Desactivación segura)
      if (sourceData.estado !== undefined && sourceData.estado !== null) {
        const estNum = Number(sourceData.estado);

        // Si intenta desactivar (0) y NO está enviando datos de identificación (es solo un toggle de estado)
        if (estNum === 0 && !sourceData.ci && !sourceData.nombre && !sourceData.codigo) {
          const checkRes = await checkAssignedProjects(codigo);
          if (checkRes.std !== 200) {
            return ResponseOak(ctx, 500, { msg: "Error de servidor al verificar proyectos." }, { content: "Content-Type", app: "application/json" });
          }
          if (checkRes.count > 0) {
            return ResponseOak(
              ctx,
              400,
              { msg: `No se puede desactivar el arquitecto: tiene ${checkRes.count} proyectos activos asignados.` },
              { content: "Content-Type", app: "application/json" }
            );
          }
        }
      }

      // 3. Construir objeto de actualización final
      const updateData: Record<string, string | number> = {};

      if (sourceData.ci) updateData.ci = parseInt(String(sourceData.ci));
      if (sourceData.nombre) updateData.nombre = String(sourceData.nombre);
      if (sourceData.apellido) updateData.apellido = String(sourceData.apellido);
      if (sourceData.telefono) updateData.telefono = parseInt(String(sourceData.telefono));
      if (sourceData.correo) updateData.correo = String(sourceData.correo);
      if (sourceData.admin !== undefined) updateData.admin = parseInt(String(sourceData.admin));
      if (sourceData.estado !== undefined) updateData.estado = parseInt(String(sourceData.estado));

      const newCodigo = String(sourceData.codigo || "");
      if (newCodigo && newCodigo !== "undefined" && newCodigo !== codigo) {
        updateData.codigo = newCodigo;
      }

      // LÓGICA DE CONTRASEÑA
      if (sourceData.password && String(sourceData.password).trim() !== "") {
        updateData.password = await hashPassARQ(String(sourceData.password));
      }

      if (Object.keys(updateData).length === 0) {
        return ResponseOak(ctx, 400, { msg: "No se enviaron datos para actualizar." }, { content: "Content-Type", app: "application/json" });
      }

      return await updateBody(updateData);

    } catch (e) {
      console.error("Error en update:", e);
      return ResponseOak(ctx, 500, { msg: "Error interno al procesar la solicitud." }, { content: "Content-Type", app: "application/json" });
    }
  }


  public async delete(ctx: Context, codigo: string) {

    if (!codigo) {
      return ResponseOak(
        ctx,
        400,
        { msg: "El codigo del arquitecto es obligatorio para la eliminacion." },
        { content: "Content-Type", app: "application/json" },
      );
    }


    const res = await DeleteQuery(codigo);


    return ResponseOak(
      ctx,
      res.std,
      {
        msg: res.std === 200
          ? "Arquitecto eliminado exitosamente."
          : "Error al eliminar el arquitecto.",
      },
      {
        content: "Content-Type",
        app: "application/json",
      },
    );
  }
}