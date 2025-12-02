import cli from "../../../database/connect.ts";
import ClienteModel from "../model.ts";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

interface res {
  data?: ClienteModel[];
  std: number;
  msg?: string; 
}

export const SelectQuery = async (ci?: string): Promise<res> => {
  try {
    const query = `
      SELECT ci, nombre, apellido, telefono, correo, estado
      FROM clientes
      ${ci ? "WHERE ci = ?" : ""}
    `;

    const params = ci ? [ci] : [];

    const [rows] = await cli.query(query, params);
    const clientes = Array.isArray(rows) ? (rows as ClienteModel[]) : [];

    return {
      data: clientes,
      std: 200,
    };
  } catch (error) {
    console.error("Error en la query: Clientes > Select >", error);
    return {
      data: [],
      std: 500,
    };
  }
};

export const CreateQuery = async (data: ClienteModel): Promise<res> => {
  try {
    const [existingRows] = await cli.query(
      'SELECT ci FROM clientes WHERE ci = ?',
      [data.ci]
    );
    
    if (Array.isArray(existingRows) && existingRows.length > 0) {
      return {
        std: 400,
        msg: "El CI ya está registrado en el sistema" 
      };
    }

    const [existingEmail] = await cli.query(
      'SELECT correo FROM clientes WHERE correo = ?',
      [data.correo]
    );
    
    if (Array.isArray(existingEmail) && existingEmail.length > 0) {
      return {
        std: 400,
        msg: "El correo electrónico ya está registrado" 
      };
    }

    const hashedPassword = await bcrypt.hash(data.password);

    const query = `
      INSERT INTO clientes (ci, nombre, apellido, telefono, correo, password, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      data.ci,
      data.nombre,
      data.apellido,
      data.telefono,
      data.correo,
      hashedPassword, 
      1,
    ];

    await cli.query(query, params);

    return {
      std: 200,
    };
  } catch (error) {
    console.error("Error en la query: Clientes > Create >", error);
    return {
      std: 500,
      msg: "Error interno del servidor"
    };
  }
};

export const UpdateQuery = async (data: ClienteModel): Promise<res> => {
  try {
    const query = `
      UPDATE clientes
      SET 
        nombre = ?, apellido = ?, telefono = ?, correo = ?, estado = ?
      WHERE ci = ?
    `;
    const params = [
      data.nombre,
      data.apellido,
      data.telefono,
      data.correo,
      data.estado,
      data.ci,
    ];

    const [result] = await cli.query(query, params);
    
    // Verificar si se actualizó alguna fila
    if (result && (result as any).affectedRows === 0) {
      console.error("No se encontró cliente con CI:", data.ci);
      return { std: 404 };
    }

    return { std: 200 };
  } catch (error) {
    console.error("Error en la query: Clientes > Update >", error);
    return { std: 500 };
  }
};

export const DeleteQuery = async (ci: string): Promise<res> => {
  try {
    const [result] = await cli.query(
      `UPDATE clientes SET estado = 0 WHERE ci = ?`,
      [ci]
    );
    
    // Verificar si se actualizó alguna fila
    if (result && (result as any).affectedRows === 0) {
      console.error("No se encontró cliente con CI:", ci);
      return { std: 404 };
    }
    
    return {
      std: 200,
    };
  } catch (error) {
    console.error("Error en la query: Clientes > Delete >", error);
    return {
      std: 500,
    };
  }
};