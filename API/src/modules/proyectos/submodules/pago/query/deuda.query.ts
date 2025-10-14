import cli from "../../../../../database/connect.ts";
import { DeudaModel } from "../model.ts";

interface res {
  data?: DeudaModel[];
  std: number;
}

export const DeudaQuery = async (proy: number): Promise<res> => {
  try {
    const query = `SELECT  
                p.costo,
                SUM(ps.monto) AS pago,
                (p.costo - IFNULL(SUM(ps.monto), 0)) AS deuda
            FROM proyectos p 
                LEFT JOIN pagos ps ON p.id = ps.proy
            WHERE p.id = ?;`;
    const params = [proy];

    const [rows] = await cli.query(query, params);
    const deuda = Array.isArray(rows) ? (rows as DeudaModel[]) : [];
    return { data: deuda, std: 200 };
  } catch (e) {
    console.log("Error > Pagos > Deuda > \n", e);
    return {
      data: [],
      std: 500,
    };
  }
};
