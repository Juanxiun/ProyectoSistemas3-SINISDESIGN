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


    if (!arquitecto.ci || !arquitecto.nombre || !arquitecto.password) {
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


  public async update(ctx: Context, codigo: string) {
    const form = await ctx.request.body.formData();

    const arquitecto: ArquitectoModel = {
      codigo: codigo,
      ci: parseInt(form.get("ci") as string),
      nombre: form.get("nombre") as string,
      apellido: form.get("apellido") as string,
      telefono: parseInt(form.get("telefono") as string),
      correo: form.get("correo") as string,
      admin: parseInt(form.get("admin") as string),

      password: "",
      estado: parseInt(form.get("estado") as string) ?? 1,
    };


    if (!arquitecto.codigo) {
      return ResponseOak(
        ctx,
        400,
        { msg: "El código del arquitecto es obligatorio para la actualizacion." },
        { content: "Content-Type", app: "application/json" }
      );
    }


    const res = await UpdateQuery(arquitecto);


    return ResponseOak(
      ctx,
      res.std,
      {
        msg: res.std === 200
          ? "Arquitecto actualizado exitosamente."
          : "Error al actualizar el arquitecto.",
      },
      {
        content: "Content-Type",
        app: "application/json",
      },
    );
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