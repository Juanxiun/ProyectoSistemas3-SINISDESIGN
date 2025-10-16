import { Router } from "@oak/oak";
import { ReporteController } from "./controller/reporte.controller.ts";

const reportes = new Router();
const reporteCtrl = new ReporteController();

reportes
    .get("/ganancia", (ctx) => reporteCtrl.ganancia(ctx))
    .get("/departamentos", (ctx) => reporteCtrl.departamentos(ctx))
    .get("/proy-terminado", (ctx) => reporteCtrl.proyTerminado(ctx))
    .get("/avance-proyecto", (ctx) => reporteCtrl.avanceProyecto(ctx))
    .get("/tipo-proyecto", (ctx) => reporteCtrl.tipoProyecto(ctx));

export default reportes;
