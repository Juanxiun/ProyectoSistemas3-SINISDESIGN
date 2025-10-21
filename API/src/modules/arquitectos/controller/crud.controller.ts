import { Context } from "@oak/oak/context";
import { ResponseOak } from "../../../libs/response.ts";
import ArquitectoModel from "../model.ts";
import {
  CreateQuery,
  SelectQuery,
  UpdateQuery,
  DeleteQuery,
} from "../query/crud.query.ts";


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


    if (!arquitecto.ci || !arquitecto.nombre) {
      return ResponseOak(
        ctx,
        400,
        { msg: "Faltan campos obligatorios " },
        { content: "Content-Type", app: "application/json" }
      );
    }

    const res = await CreateQuery(arquitecto);

    return ResponseOak(
      ctx,
      res.std,
      {
        msg: res.std === 200
          ? "Arquitecto creado exitosamente."
          : "Error al crear el arquitecto.",
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


    try {
      const form = await ctx.request.body.formData();


      const estadoRaw = form.get("estado");
      if (estadoRaw !== null && !form.get("ci") && !form.get("nombre")) {
        const estNum = Number(estadoRaw);
        if (!Number.isNaN(estNum)) {
          const res = await UpdateQuery(codigo, { estado: estNum });
          return ResponseOak(ctx, 200, { msg: "Arquitecto actualizado.", data: res }, { content: "Content-Type", app: "application/json" });
        }
      }


      const updateData: Record<string, string | number> = {};

      const ci = form.get("ci");
      if (ci) updateData.ci = parseInt(ci as string);

      const nombre = form.get("nombre");
      if (nombre) updateData.nombre = nombre as string;

      const apellido = form.get("apellido");
      if (apellido) updateData.apellido = apellido as string;

      const telefono = form.get("telefono");
      if (telefono) updateData.telefono = parseInt(telefono as string);

      const correo = form.get("correo");
      if (correo) updateData.correo = correo as string;

      const admin = form.get("admin");
      if (admin) updateData.admin = parseInt(admin as string);

      const estado = form.get("estado");
      if (estado) updateData.estado = parseInt(estado as string);

      // Validar campos obligatorios
      if (!updateData.ci || !updateData.nombre) {
        return ResponseOak(
          ctx,
          400,
          { msg: "Faltan campos obligatorios" },
          { content: "Content-Type", app: "application/json" }
        );
      }

      const res = await UpdateQuery(codigo, updateData);
      return ResponseOak(ctx, 200, { msg: "Arquitecto actualizado.", data: res }, { content: "Content-Type", app: "application/json" });
    } catch (e) {
      console.error("Error leyendo form-data en update:", e);

    }

    // leer JSON
    try {
      const bodyAny = ctx.request.body as any;
      const jsonBody = await bodyAny.value as Record<string, any> | undefined;
      if (jsonBody) {
        const updateData: Record<string, string | number> = {};

        if (jsonBody.ci !== undefined) updateData.ci = Number(jsonBody.ci);
        if (jsonBody.nombre !== undefined) updateData.nombre = String(jsonBody.nombre);
        if (jsonBody.apellido !== undefined) updateData.apellido = String(jsonBody.apellido);
        if (jsonBody.telefono !== undefined) updateData.telefono = Number(jsonBody.telefono);
        if (jsonBody.correo !== undefined) updateData.correo = String(jsonBody.correo);
        if (jsonBody.admin !== undefined) updateData.admin = Number(jsonBody.admin);
        if (jsonBody.estado !== undefined) updateData.estado = Number(jsonBody.estado);

        // Validar campos obligatorios
        if (!updateData.ci || !updateData.nombre) {
          return ResponseOak(
            ctx,
            400,
            { msg: "Faltan campos obligatorios" },
            { content: "Content-Type", app: "application/json" }
          );
        }

        const res = await UpdateQuery(codigo, updateData);
        return ResponseOak(ctx, 200, { msg: "Arquitecto actualizado.", data: res }, { content: "Content-Type", app: "application/json" });
      }
    } catch (e) {
      console.error("Error parseando JSON en update:", e);
    }

    return ResponseOak(ctx, 400, { msg: "Envíe los campos necesarios para actualizar." }, { content: "Content-Type", app: "application/json" });
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