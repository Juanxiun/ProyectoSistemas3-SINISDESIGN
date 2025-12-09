import { Router } from "@oak/oak";
import cli from "../../database/connect.ts";
import { ResponseOak } from "../../libs/response.ts";

const router = new Router();

router.get("/historial-pagos", async (ctx) => {
  try {
    const query = `
      SELECT id, accion, id_pago, proy, titulo_old, monto_old, fecha_old,
             titulo_new, monto_new, fecha_new, fecha_movimiento
      FROM historial_pagos
      ORDER BY fecha_movimiento DESC
    `;

    const [rows] = await cli.query(query);

    return ResponseOak(
      ctx,
      200,
      {
        status: 200,
        data: rows
      },
      {
        content: "Content-Type",
        app: "application/json"
      }
    );

  } catch (error) {
    console.log("ERROR > historial-pagos >", error);
    
    return ResponseOak(
      ctx,
      500,
      {
        status: 500,
        error: "Error interno."
      },
      {
        content: "Content-Type",
        app: "application/json"
      }
    );
  }
});

export default router;
