import { Context } from "@oak/oak/context";
import { ResponseOak } from "../../../libs/response.ts";
import ClienteModel from "../model.ts";
import {
  CreateQuery,
  SelectQuery,
  UpdateQuery,
  DeleteQuery,
} from "../query/crud.query.ts";

export class CrudClientes {
  public async select(ctx: Context, ci?: string) {
    const res = await SelectQuery(ci);

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

    const cliente: ClienteModel = {
      ci: parseInt(form.get("ci") as string),
      nombre: form.get("nombre") as string,
      apellido: form.get("apellido") as string,
      telefono: parseInt(form.get("telefono") as string),
      correo: form.get("correo") as string,
      password: form.get("password") as string,
      estado: 1,
    };

    if (!cliente.ci || !cliente.nombre) {
      return ResponseOak(
        ctx,
        400,
        { msg: "Faltan campos obligatorios" },
        { content: "Content-Type", app: "application/json" }
      );
    }

    const res = await CreateQuery(cliente);

    return ResponseOak(
      ctx,
      res.std,
      {
        msg: res.std === 200
          ? "Cliente creado exitosamente."
          : "Error al crear el cliente.",
      },
      {
        content: "Content-Type",
        app: "application/json",
      },
    );
  }

  public async update(ctx: Context, ci: string) {
    const form = await ctx.request.body.formData();

    const cliente: ClienteModel = {
      ci: parseInt(ci),
      nombre: form.get("nombre") as string,
      apellido: form.get("apellido") as string,
      telefono: parseInt(form.get("telefono") as string),
      correo: form.get("correo") as string,
      password: "",
      estado: parseInt(form.get("estado") as string) ?? 1,
    };

    if (!cliente.ci) {
      return ResponseOak(
        ctx,
        400,
        { msg: "El CI del cliente es obligatorio para la actualización." },
        { content: "Content-Type", app: "application/json" }
      );
    }

    const res = await UpdateQuery(cliente);

    return ResponseOak(
      ctx,
      res.std,
      {
        msg: res.std === 200
          ? "Cliente actualizado exitosamente."
          : "Error al actualizar el cliente.",
      },
      {
        content: "Content-Type",
        app: "application/json",
      },
    );
  }

  public async delete(ctx: Context, ci: string) {
    if (!ci) {
      return ResponseOak(
        ctx,
        400,
        { msg: "El CI del cliente es obligatorio para la eliminación." },
        { content: "Content-Type", app: "application/json" },
      );
    }

    const res = await DeleteQuery(ci);

    return ResponseOak(
      ctx,
      res.std,
      {
        msg: res.std === 200
          ? "Cliente eliminado exitosamente."
          : "Error al eliminar el cliente.",
      },
      {
        content: "Content-Type",
        app: "application/json",
      },
    );
  }
}