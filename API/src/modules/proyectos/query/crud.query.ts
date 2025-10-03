import cli from "../../../database/connect.ts";
import { datetime } from "../../../libs/datetimeFormat.ts";
import ProyectoModel from "../model.ts";
import { fileBlob } from "../../../libs/converFile.ts";
import { conver64, typeFile } from "../../../libs/conver64.ts";

interface res {
  data?: ProyectoModel[];
  std: number;
}

export const SelectQuery = async (usr: string, id?: number): Promise<res> => {
  try {
    const usuario = parseInt(usr) ? "cli" : "arq";

    console.log("ingreso como: ", usuario);

    const query = `
      SELECT id, arq, cli, nombre, inicio, final, costo, imagen, est
      FROM proyectos
      WHERE est = 1
      ${id ? "AND id = ?" : ""}
      AND ${usuario} = ?
    `;

    const params = id ? [id, usr] : [usr];
    const [rows] = await cli.query(query, params);

    const proyectos = Array.isArray(rows) ? (rows as ProyectoModel[]) : [];

    const initProy = proyectos.map((p) => {
      let imagenBase64 = "";
      if (p.imagen) {
        imagenBase64 = conver64(typeFile.jpg, p.imagen);
      }
      return { ...p, imagen: imagenBase64 };
    });

    return {
      data: initProy,
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
    const query =
      `INSERT INTO proyectos (arq, cli, nombre, inicio, costo, imagen, est)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      data.arq,
      data.cli,
      data.nombre,
      datetime(data.inicio ?? ""),
      data.costo,
      typeof data.imagen === "string" ? null : await fileBlob(data.imagen),
      1,
    ];

    await cli.execute(query, params);

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
        arq = ?, cli = ?, nombre = ?, inicio = ?, costo = ?, imagen = ?
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
      [datetime(fecha), id],
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
