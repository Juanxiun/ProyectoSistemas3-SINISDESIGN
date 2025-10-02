import cli from "../../../database/connect.ts";
import ArquitectoModel from "../model.ts";

interface res {
  data?: ArquitectoModel[];
  std: number;
}


export const SelectQuery = async (codigo?: string): Promise<res> => {
  try {
    const query = `
      SELECT codigo, ci, nombre, apellido, telefono, correo, admin, estado
      FROM arquitectos
      WHERE estado = 1
      ${codigo ? "AND codigo = ?" : ""}
    `;

    
    const params = codigo ? [codigo] : [];

    
    const [rows] = await cli.query(query, params);
    const arquitectos = Array.isArray(rows) ? (rows as ArquitectoModel[]) : [];

    return {
      data: arquitectos,
      std: 200,
    };
  } catch (error) {
    console.error("Error en la query: Arquitectos > Select >", error);
    return {
      data: [],
      std: 500,
    };
  }
};


export const CreateQuery = async (data: ArquitectoModel): Promise<res> => {
  try {
    const query = `
      INSERT INTO arquitectos (codigo, ci, nombre, apellido, telefono, correo, admin, password, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      data.codigo,
      data.ci,
      data.nombre,
      data.apellido,
      data.telefono,
      data.correo,
      data.admin,
      data.password,
      1,
    ];

    await cli.query(query, params);

    return {
      std: 200,
    };
  } catch (error) {
    console.log("Error en la query: Arquitectos > Create >\n" + error);
    return {
      std: 500,
    };
  }
};


export const UpdateQuery = async (data: ArquitectoModel): Promise<res> => {
  try {

    const query = `
      UPDATE arquitectos
      SET 
        ci = ?, nombre = ?, apellido = ?, telefono = ?, correo = ?, admin = ?
      WHERE codigo = ?
    `;
    const params = [
      data.ci,
      data.nombre,
      data.apellido,
      data.telefono,
      data.correo,
      data.admin,
      data.codigo,
    ];

    await cli.query(query, params);

    return { std: 200 };
  } catch (error) {
    console.log("Error en la query: Arquitectos > Update >\n", error);
    return { std: 500 };
  }
};

export const DeleteQuery = async (codigo: string): Promise<res> => {
  try {
    await cli.query(
      `UPDATE
            arquitectos
        SET
            estado = 0
        WHERE
            codigo = ?`,
      [codigo]
    );
    return {
      std: 200,
    };
  } catch (error) {
    console.log("Error en la query: Arquitectos > Delete >\n" + error);
    return {
      std: 500,
    };
  }
};