import cli from "../../../database/connect.ts";
import { TipoProyPreModel } from "../models.ts";

interface res {
  data?: TipoProyPreModel[];
  std: number;
}

export const TipoProyPre = async (tipo: string, sub: string): Promise<res> => {
  try {
    const query = `SELECT 
	        p.id AS proyecto,
            YEAR(p.inicio) AS inicio,
            YEAR(p.final) AS  final,
            TIMESTAMPDIFF(DAY, p.inicio, p.final) AS day
        FROM proyectos p 
        LEFT JOIN tipo_proyectos t ON p.id = t.proy
        WHERE t.tipo = ? || t.subtipo = ?;`;
    const params = [tipo, sub];

    const [rows] = await cli.query(query, params);
    const proyectos = Array.isArray(rows) ? (rows as TipoProyPreModel[]) : [];

    return {
        data: proyectos,
        std: 200
    }

  } catch (e) {
    console.log(e);

    return{
        data: [],
        std: 500
    }
  }
};






