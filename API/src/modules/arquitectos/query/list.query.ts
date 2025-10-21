// deno-lint-ignore-file no-explicit-any
import { ListArqFullData, ListArquitecto } from "../model.ts";
import cli from "../../../database/connect.ts";
import { conver64, typeFile } from "../../../libs/conver64.ts";

interface res {
  data?: ListArquitecto[] | ListArqFullData[];
  std: number;
}

export const ListQueryArqFull = async (): Promise<res> => {
  try {
    const query = `SELECT 
            aq.codigo,
            CONCAT('Arq. ', aq.nombre, ' ', aq.apellido) AS nombres,
            i.titulacion,
            TIMESTAMPDIFF(YEAR, i.titulacion, CURDATE()) AS xp,
            aq.admin, i.foto, i.universidad, i.descripcion
        FROM
            arquitectos aq 
        INNER JOIN informaciones i ON i.arq = aq.codigo
        WHERE 
            aq.estado = 1;`;
    const [rows] = await cli.query(query);
    const listArq = Array.isArray(rows) ? (rows as ListArqFullData[]) : [];

    const queryEsp = `SELECT especialidad FROM especializaciones WHERE arq = ?`;

    for (let i = 0; i < listArq.length; i++) {
      const params = [listArq[i].codigo];
      const [rowsEsp] = await cli.query(queryEsp, params);
      const especializacion = Array.isArray(rowsEsp) ? (rowsEsp as any[]) : [];
      listArq[i].especializacion = especializacion.map((e) => e.especialidad);
    }

    const initArqList = listArq.map((p) => {
      let imagenBase64 = "";

      if (p.foto) {
        imagenBase64 = conver64(typeFile.jpg, p.foto);
      }
      return { ...p, foto: imagenBase64 };
    });

    return {
      data: initArqList,
      std: 200,
    };
  } catch (e) {
    console.log(e);
    return {
      data: [],
      std: 500,
    };
  }
};

export const ListQueryArq = async (): Promise<res> => {
  try {
    const queryArq = `
      SELECT 
        aq.codigo, 
        CONCAT(aq.nombre, " ", aq.apellido) AS nombres, 
        aq.correo, 
        aq.telefono, 
        i.foto
      FROM arquitectos aq 
      INNER JOIN informaciones i ON i.arq = aq.codigo
    `;
    const [rows] = await cli.query(queryArq);
    const listArq = Array.isArray(rows) ? (rows as ListArquitecto[]) : [];

    const queryEsp = `SELECT especialidad FROM especializaciones WHERE arq = ?`;

    for (let i = 0; i < listArq.length; i++) {
      const params = [listArq[i].codigo];
      const [rowsEsp] = await cli.query(queryEsp, params);
      const especializacion = Array.isArray(rowsEsp) ? (rowsEsp as any[]) : [];
      listArq[i].especializacion = especializacion.map((e) => e.especialidad);
    }

    const initArqList = listArq.map((p) => {
      let imagenBase64 = "";

      if (p.foto) {
        imagenBase64 = conver64(typeFile.jpg, p.foto);
      }
      return { ...p, foto: imagenBase64 };
    });

    return {
      data: initArqList,
      std: 200,
    };
  } catch (e) {
    console.log(e);
    return {
      data: [],
      std: 500,
    };
  }
};
