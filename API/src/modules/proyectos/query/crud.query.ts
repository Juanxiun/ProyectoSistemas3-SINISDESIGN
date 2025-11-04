import cli from "../../../database/connect.ts";
import { datetime, formatDateTime } from "../../../libs/datetimeFormat.ts";
import ProyectoModel from "../model.ts";
import { fileBlob } from "../../../libs/converFile.ts";
import { conver64, typeFile } from "../../../libs/conver64.ts";

interface res {
  data?: ProyectoModel[];
  std: number;
  id?: number;
}

export const SelectQuery = async (usr: string, id?: number): Promise<res> => {
  try {
    const usuario = parseInt(usr) ? "cli" : "arq";
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
      let timeInit = "";
      let timeEnd = "";

      if (p.imagen) {
        imagenBase64 = conver64(typeFile.jpg, p.imagen);
      }
      timeInit = formatDateTime(p.inicio);
      
      if(p.final){
        timeEnd = formatDateTime(p.final ?? "");
      }

      return { ...p, imagen: imagenBase64, inicio: timeInit, final: timeEnd ?? undefined};
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
      typeof data.imagen === "string" ? null : await fileBlob(data.imagen!),
      1,
    ];

    const result = await cli.execute(query, params);
        
    const insertId = 
      (result as any).insertId || 
      (result as any)[0]?.insertId || 
      (result as any)[1]?.insertId;

    if (!insertId) {
      console.error("No se pudo obtener el ID insertado");
      return {
        std: 500,
      };
    }

    return {
      std: 200,
      id: insertId,
    };
  } catch (error) {
    return {
      std: 500,
    };
  }
};

export const UpdateQuery = async (data: ProyectoModel): Promise<res> => {
  try {
    if (!data.id || data.id <= 0) {
      throw new Error("ID de proyecto inválido");
    }

    let query = `UPDATE proyectos SET arq = ?, cli = ?, nombre = ?, inicio = ?, costo = ?, est = ?`;
    let params: any[] = [
      data.arq,
      data.cli,
      data.nombre,
      datetime(data.inicio ?? ""),
      data.costo,
      data.est ?? 1
    ];

    if (data.imagen && data.imagen instanceof File && data.imagen.size > 0) {
      try {
        const buffer = await fileBlob(data.imagen);
        query += `, imagen = ?`;
        params.push(buffer);
      } catch (error) {
        throw new Error("Error al procesar la imagen: " + (error instanceof Error ? error.message : String(error)));
      }
    }

    if (data.final && data.final.trim() !== "") {
      const fechaFinalFormateada = datetime(data.final);
      query += `, final = ?`;
      params.push(fechaFinalFormateada);
    }

    query += ` WHERE id = ?`;
    params.push(data.id);

    const result = await cli.execute(query, params);
    
    return { std: 200 };
    
  } catch (error) {
    console.error("Error en UpdateQuery:", error);
    return { 
      std: 500
    };
  }
};

export const DeleteQuery = async (id: number): Promise<res> => {
  try {
    await cli.execute(
      `UPDATE proyectos SET est = 0 WHERE id = ?`,
      [id],
    );
    return {
      std: 200,
    };
  } catch (error) {
    console.error("Error en la query: Proyectos > Delete >", error);
    return {
      std: 500,
    };
  }
};