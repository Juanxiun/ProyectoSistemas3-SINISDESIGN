import cli from "../../../database/connect.ts";
import { ReqProyModel } from "../models.ts";

interface res {
  data?: ReqProyModel[];
  std: number;
}

export const ReqFasePre = async (idProy: string): Promise<res> => {
    try{

        const query = `select 
	            p.id,
                t.tipo, t.subtipo,
                p.inicio
            FROM 
	            proyectos p 
            INNER JOIN tipo_proyectos t ON p.id = t.proy
            WHERE
	            p.id = ?;`;
        
        const params = [idProy];

        const [rows] = await cli.query(query, params);
        const proyecto = Array.isArray(rows) ? (rows as ReqProyModel[]) : [];

        return {
            data: proyecto,
            std: 200,
        }

    }catch(e){
        console.log(e);
        return {
            data: [],
            std: 500
        }
    }
}