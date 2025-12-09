import client from "../../../database/connect.ts";
import HistorialPago from "../model.ts";

export interface HistorialResponse {
  data?: HistorialPago[];
  std: number;
}

export const GetHistorial = async (filters: any): Promise<HistorialResponse> => {
  try {
    let query = `
      SELECT *
      FROM historial_pagos
      WHERE 1 = 1
    `;
    const params: any[] = [];

    // ───── Filtros opcionales ──────────────────────
    if (filters.proy) {
      query += ` AND proy = ?`;
      params.push(filters.proy);
    }

    if (filters.accion) {
      query += ` AND accion = ?`;
      params.push(filters.accion);
    }

    if (filters.fechaInicio) {
      query += ` AND fecha_movimiento >= ?`;
      params.push(filters.fechaInicio);
    }

    if (filters.fechaFin) {
      query += ` AND fecha_movimiento <= ?`;
      params.push(filters.fechaFin + " 23:59:59");
    }

    if (filters.texto) {
      query += `
        AND (
          titulo_old LIKE ? OR titulo_new LIKE ? OR
          monto_old LIKE ? OR monto_new LIKE ?
        )
      `;
      params.push(`%${filters.texto}%`);
      params.push(`%${filters.texto}%`);
      params.push(`%${filters.texto}%`);
      params.push(`%${filters.texto}%`);
    }

    query += ` ORDER BY fecha_movimiento DESC`;

    const [rows] = await client.query(query, params);

    return {
      data: rows as HistorialPago[],
      std: 200,
    };
  } catch (err) {
    console.error("Error: GetHistorial >", err);
    return { std: 500, data: [] };
  }
};
