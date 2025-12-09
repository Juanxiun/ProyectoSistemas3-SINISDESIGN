import cli from "../../../database/connect.ts";
import {
    GananciaModel,
    SolicitadoModel,
    ProyTerminadoModel,
    AvanceProyectoModel,
    TipoProyectoModel,
} from "../model.ts";

interface QueryResult {
    data?: any[];
    std: number;
    msg?: string;
}

// 1. Ganancia y deuda por arquitecto
export const GananciaQuery = async (arq: string, startDate: string, endDate: string): Promise<QueryResult> => {
    try {
        const query = `
            SELECT 
                COUNT(*) AS proy,
                SUM(pr.costo) AS total,
                IFNULL(SUM(p.total_pagos), 0) AS pago,
                (SUM(pr.costo) - IFNULL(SUM(p.total_pagos), 0)) AS deuda
            FROM proyectos pr
            LEFT JOIN (
                SELECT proy, SUM(monto) AS total_pagos
                FROM pagos
                GROUP BY proy
            ) p ON p.proy = pr.id
            WHERE 
                pr.arq = ?
                AND (
                    (DATE(pr.inicio) BETWEEN ? AND ?)
                    OR (DATE(pr.final) BETWEEN ? AND ?)
                )
            GROUP BY pr.arq;
        `;
        const params = [arq, startDate, endDate, startDate, endDate];
        const [rows] = await cli.query(query, params);        
        const data: GananciaModel[] = Array.isArray(rows) ? (rows as GananciaModel[]) : [];
        return { data, std: 200 };
    } catch (error) {
        console.error("Error en la query: Reportes > Ganancia >", error);
        return { data: [], std: 500, msg: "Error interno al ejecutar la consulta." };
    }
};

// 2. Departamentos que más pidieron los servicios
export const DepartamentosQuery = async (arq: string, pais: string): Promise<QueryResult> => {
    try {
        const query = `
            SELECT 
                d.departamento, 
                COUNT(DISTINCT d.proy) AS cantidad
            FROM direccion_proyectos d 
            INNER JOIN proyectos pr ON pr.id = d.proy 
            WHERE 
                d.pais = ? 
                AND pr.arq = ?
            GROUP BY d.departamento 
            ORDER BY cantidad DESC;
        `;
        const params = [pais, arq];
        const [rows] = await cli.query(query, params);        
        const data: SolicitadoModel[] = Array.isArray(rows) ? (rows as SolicitadoModel[]) : [];
        return { data, std: 200 };
    } catch (error) {
        console.error("Error en la query: Reportes > Departamentos >", error);
        return { data: [], std: 500, msg: "Error interno al ejecutar la consulta." };
    }
};

// 3. Proyectos que ya terminaron y los que no
export const ProyTerminadoQuery = async (arq: string, startDate: string, endDate: string): Promise<QueryResult> => {
    try {
        const query = `
            SELECT
                COUNT(pr.id) AS proy,
                SUM(CASE WHEN pr.est = 0 THEN 1 ELSE 0 END) AS terminado,
                SUM(CASE WHEN pr.est = 1 THEN 1 ELSE 0 END) AS pendiente
            FROM
                proyectos pr 
            WHERE
                pr.arq = ?
                AND (
                    (DATE(pr.inicio) BETWEEN ? AND ?)
                    OR (DATE(pr.final) BETWEEN ? AND ?)
                );
        `;
        const params = [arq, startDate, endDate, startDate, endDate];
        const [rows] = await cli.query(query, params);
        const data: ProyTerminadoModel[] = Array.isArray(rows) ? (rows as ProyTerminadoModel[]) : [];
        return { data, std: 200 };
    } catch (error) {
        console.error("Error en la query: Reportes > ProyTerminado >", error);
        return { data: [], std: 500, msg: "Error interno al ejecutar la consulta." };
    }
};

// 4. Avance del proyecto por fases
export const AvanceProyectoQuery = async (arq: string, startDate: string, endDate: string): Promise<QueryResult> => {
    try {
        const query = `
            SELECT
                f.fase,
                COUNT(DISTINCT pr.id) AS terminado
            FROM
                proyectos pr
            INNER JOIN
                fases f ON pr.id = f.proy
            WHERE
                pr.arq = ?
                AND (
                    (DATE(pr.inicio) BETWEEN ? AND ?)
                    OR (DATE(pr.final) BETWEEN ? AND ?)
                )
            GROUP BY
                f.fase 
            ORDER BY
                terminado DESC;
        `;
        const params = [arq, startDate, endDate, startDate, endDate];
        const [rows] = await cli.query(query, params);
        const data: AvanceProyectoModel[] = Array.isArray(rows) ? (rows as AvanceProyectoModel[]) : [];
        return { data, std: 200 };
    } catch (error) {
        console.error("Error en la query: Reportes > AvanceProyecto >", error);
        return { data: [], std: 500, msg: "Error interno al ejecutar la consulta." };
    }
};

// 5. Tipos de proyectos más solicitados
export const TipoProyectoQuery = async (arq: string, startDate: string, endDate: string): Promise<QueryResult> => {
    try {
        const query = `
            SELECT
                tp.tipo AS tipo,
                tp.subtipo AS subtipo,
                COUNT(pr.id) AS cantidad_proyectos
            FROM
                proyectos pr
            INNER JOIN
                tipo_proyectos tp ON pr.id = tp.proy
            WHERE
                pr.arq = ?
                AND (
                    (DATE(pr.inicio) BETWEEN ? AND ?)
                    OR (DATE(pr.final) BETWEEN ? AND ?)
                )
            GROUP BY
                tp.tipo,
                tp.subtipo 
            ORDER BY
                tp.tipo,
                cantidad_proyectos DESC;
        `;
        const params = [arq, startDate, endDate, startDate, endDate];        
        const [rows] = await cli.query(query, params);        
        const data: TipoProyectoModel[] = Array.isArray(rows) ? (rows as TipoProyectoModel[]) : [];
        return { data, std: 200 };
    } catch (error) {
        console.error("Error en la query: Reportes > TipoProyecto >", error);
        return { data: [], std: 500, msg: "Error interno al ejecutar la consulta." };
    }
};