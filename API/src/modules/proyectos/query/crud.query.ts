import cli from "../../../database/connect.ts";
import { datetime } from "../../../libs/datetimeFormat.ts";
import ProyectoModel from "../model.ts";

interface res {
  data?: ProyectoModel[];
  std: number;
}

export const SelectQuery = async (arq: string, id?: number): Promise<res> => {
  try {
    const query = `
      SELECT id, arq, cli, nombre, inicio, final, costo, imagen, est
      FROM proyectos
      WHERE est = 1
      ${id ? "AND id = ?" : ""}
      AND arq = ?
    `;

    const params = id ? [id, arq] : [arq];

    const [rows] = await cli.query(query, params);
    const proyectos = Array.isArray(rows) ? (rows as ProyectoModel[]) : [];

    return {
      data: proyectos,
      std: 200,
    };
  } catch (error) {
    console.error("Error en la query: Proyectos > select >", error);
    return {
      data: [],
      std: 500,
    };
  }
};

export const CreateQuery = async (data: ProyectoModel): Promise<res> => {
  try {

    const query = `
      INSERT INTO proyectos (arq, cli, nombre, inicio, precio, foto, est)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      data.arq,
      data.cli,
      data.nombre,
      datetime(data.inicio ?? ""),
      data.costo,
      data.imagen,
      1,
    ];

    await cli.query(query, params);

    return {
      std: 200,
    };
  } catch (error) {
    console.log("Error en la query: Proyectos > Create >\n" + error);
    return {
      std: 500,
    };
  }
};

export const UpdateQuery = async (data: ProyectoModel): Promise<res> => {
  try {

    const query = `
      UPDATE proyectos
      SET 
        arq = ?, cli = ?, nombre = ?, inicio = ?, precio = ?, foto = ?
      WHERE id = ?
    `;
    const params = [
      data.arq,
      data.cli,
      data.nombre,
      datetime(data.inicio ?? ""),
      data.costo,
      data.imagen,
      data.id ?? 0,
    ];

    await cli.query(query, params);

    return { std: 200 };
  } catch (error) {
    console.log("Error en la query: Proyectos > Update >\n", error);
    return { std: 500 };
  }
};


export const DeleteQuery = async (id: number, fecha: string): Promise<res> => {
  try {
    await cli.query(
      `UPDATE
            proyectos
        SET
            est = 0
            final = ?
        WHERE
            id = ?`,
      [datetime(fecha), id]
    );
    return {
      std: 200,
    };
  } catch (error) {
    console.log("Error en la query: Proyectos > Delete >\n" + error);
    return {
      std: 500,
    };
  }
};
