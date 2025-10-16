import cli from "../../../database/connect.ts";
import ClienteModel from "../model.ts";

interface res {
  data?: ClienteModel[];
  std: number;
}

export const SelectQuery = async (ci?: string): Promise<res> => {
  try {
    const query = `
      SELECT ci, nombre, apellido, telefono, correo, estado
      FROM clientes
      WHERE estado = 1
      ${ci ? "AND ci = ?" : ""}
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
      data.password,
      1,
    ];

    await cli.query(query, params);

    return {
      std: 200,
    };
  } catch (error) {
    console.log("Error en la query: Clientes > Create >\n" + error);
    return {
      std: 500,
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

    await cli.query(query, params);

    return { std: 200 };
  } catch (error) {
    console.log("Error en la query: Clientes > Update >\n", error);
    return { std: 500 };
  }
};

export const DeleteQuery = async (ci: string): Promise<res> => {
  try {
    await cli.query(
      `UPDATE clientes SET estado = 0 WHERE ci = ?`,
      [ci]
    );
    return {
      std: 200,
    };
  } catch (error) {
    console.log("Error en la query: Clientes > Delete >\n" + error);
    return {
      std: 500,
    };
  }
};