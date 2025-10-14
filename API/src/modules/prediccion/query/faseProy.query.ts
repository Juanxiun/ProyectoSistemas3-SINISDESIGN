import cli from "../../../database/connect.ts";
import { FaseProyPreModel } from "../models.ts";

interface res {
  data?: FaseProyPreModel[];
  std: number;
}

export const FaseProyPre = async (gestion: number, global?: boolean): Promise<res> => {
  try {
    const query = `SELECT
            f.fase,
            COUNT(f.proy) AS proy,
            ROUND(AVG(TIMESTAMPDIFF(DAY, f.inicio, f.final)), 2) AS day,
            ROUND(AVG(TIMESTAMPDIFF(HOUR, f.inicio, f.final)), 2) AS hour
        FROM fases f
            INNER JOIN proyectos p ON f.proy = p.id
        WHERE
            YEAR(p.inicio) BETWEEN ? AND ? 
            OR YEAR(p.final) BETWEEN ? AND ?
        GROUP BY f.fase
        ORDER BY f.fase;`;
    const params = global ? [gestion, "YEAR(CURDATE())", gestion, "YEAR(CURDATE())"] : [gestion, gestion, gestion, gestion];

    const [rows] = await cli.query(query, params);
    const proyectos = Array.isArray(rows) ? (rows as FaseProyPreModel[]) : [];

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