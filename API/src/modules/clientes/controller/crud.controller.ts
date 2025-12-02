import { Context } from "@oak/oak/context";
import { ResponseOak } from "../../../libs/response.ts";
import ClienteModel from "../model.ts";
import {
  CreateQuery,
  SelectQuery,
  UpdateQuery,
  DeleteQuery,
} from "../query/crud.query.ts";
import client from "../../../database/connect.ts";

export class CrudClientes {
  public async select(ctx: Context, ci?: string) {
    const res = await SelectQuery(ci);

    return ResponseOak(
      ctx,
      res.std,
      res.data,  // Cambiado: enviar directamente el array
      {
        content: "Content-Type",
        app: "application/json",
      },
    );
  }

  public async create(ctx: Context) {
  try {
    const form = await ctx.request.body.formData();

    // Validar campos obligatorios
    const ci = form.get("ci") as string;
    const nombre = form.get("nombre") as string;
    const apellido = form.get("apellido") as string;
    const telefono = form.get("telefono") as string;
    const correo = form.get("correo") as string;
    const password = form.get("password") as string;

    console.log("Datos recibidos en backend:", { ci, nombre, apellido, telefono, correo, password });

    if (!ci || !nombre || !apellido || !telefono || !correo || !password) {
      console.log("ERROR: Campos faltantes detectados");
      return ResponseOak(
        ctx,
        400,
        { 
          msg: "Faltan campos obligatorios. Todos los campos son requeridos: CI, nombre, apellido, teléfono, correo, contraseña.",
          detalles: {
            ci: ci || "FALTANTE",
            nombre: nombre || "FALTANTE", 
            apellido: apellido || "FALTANTE",
            telefono: telefono || "FALTANTE",
            correo: correo || "FALTANTE",
            password: password ? "PRESENTE" : "FALTANTE"
          }
        },
        { content: "Content-Type", app: "application/json" }
      );
    }

    const cliente: ClienteModel = {
      ci: parseInt(ci),
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      telefono: parseInt(telefono),
      correo: correo.trim(),
      password: password,
      estado: 1,
    };

    // Validar que los números sean válidos
    if (isNaN(cliente.ci) || isNaN(cliente.telefono)) {
      return ResponseOak(
        ctx,
        400,
        { msg: "CI y teléfono deben ser números válidos." },
        { content: "Content-Type", app: "application/json" }
      );
    }

    const res = await CreateQuery(cliente);

    console.log("Resultado de CreateQuery:", res);

    return ResponseOak(
      ctx,
      res.std,
      {
        msg: res.std === 200
          ? "Cliente creado exitosamente."
          : res.msg || "Error al crear el cliente.",
        success: res.std === 200
      },
      {
        content: "Content-Type",
        app: "application/json",
      },
    );
  } catch (error) {
    console.error("Error en create cliente:", error);
    return ResponseOak(
      ctx,
      500,
      { 
        msg: "Error interno del servidor al crear el cliente.",
        
      },
      { content: "Content-Type", app: "application/json" }
    );
  }
}

  public async update(ctx: Context, ci: string) {
  try {
    const form = await ctx.request.body.formData();
    
    // Obtener solo los campos que se envían
    const nombre = form.get("nombre") as string;
    const apellido = form.get("apellido") as string;
    const telefono = form.get("telefono") as string;
    const correo = form.get("correo") as string;
    const estado = form.get("estado") as string;
    
    // Primero obtener el cliente existente
    const [existingRows] = await client.query(
      'SELECT * FROM clientes WHERE ci = ?',
      [ci]
    );
    
    if (!Array.isArray(existingRows) || existingRows.length === 0) {
      return ResponseOak(
        ctx,
        404,
        { msg: "Cliente no encontrado." },
        { content: "Content-Type", app: "application/json" }
      );
    }
    
    const clienteExistente = existingRows[0] as ClienteModel;
    
    // Usar los valores existentes si no se proporcionan nuevos
    const clienteActualizado: ClienteModel = {
      ci: parseInt(ci),
      nombre: nombre ? nombre.trim() : clienteExistente.nombre,
      apellido: apellido ? apellido.trim() : clienteExistente.apellido,
      telefono: telefono ? parseInt(telefono) : clienteExistente.telefono,
      correo: correo ? correo.trim() : clienteExistente.correo,
      password: clienteExistente.password, // Mantener la contraseña existente
      estado: estado !== null ? parseInt(estado) : clienteExistente.estado,
    };
    
    // Validar que el teléfono sea un número si se proporciona
    if (telefono && isNaN(parseInt(telefono))) {
      return ResponseOak(
        ctx,
        400,
        { msg: "Teléfono debe ser un número válido." },
        { content: "Content-Type", app: "application/json" }
      );
    }
    
    const res = await UpdateQuery(clienteActualizado);
    
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
  } catch (error) {
    console.error("Error en update cliente:", error);
    return ResponseOak(
      ctx,
      500,
      { msg: "Error interno del servidor al actualizar el cliente." },
      { content: "Content-Type", app: "application/json" }
    );
  }
}

  public async delete(ctx: Context, ci: string) {
    try {
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
    } catch (error) {
      console.error("Error en delete cliente:", error);
      return ResponseOak(
        ctx,
        500,
        { msg: "Error interno del servidor al eliminar el cliente." },
        { content: "Content-Type", app: "application/json" }
      );
    }
  }
}