import cli from "../../../database/connect.ts";
import { ProyectoList } from "../model.ts";
import { conver64, typeFile } from "../../../libs/conver64.ts";

interface res {
  data?: ProyectoList[];
  std: number;
}

export const ProyecectoList = async (usr?: string): Promise<res> => {
  try {
    const user = usr && parseInt(usr) ? "p.cli = ?" : "p.arq = ?";

    const query = `select 
	    p.id, p.arq, p.nombre, p.costo, p.imagen,
	    concat(UPPER(d.departamento),' - ', UPPER(d.pais)) as direccion, p.est
    FROM
	    proyectos p 
    LEFT JOIN 
	    direccion_proyectos d ON p.id = d.proy
    WHERE
	    p.est = 1  ${usr ? `AND ${user}` : ""};`;
    const params = usr ? [usr] : [];

    const [rows] = await cli.query(query, params);

    const proyectos = Array.isArray(rows) ? (rows as ProyectoList[]) : [];

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
    console.log("Error en la query: Proyectos > list >\n" + error);
    return {
      data: [],
      std: 500,
    };
  }
};
