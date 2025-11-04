import { Router } from "@oak/oak";
import proyecto from "../modules/proyectos/router.ts";
import arquitecto from "../modules/arquitectos/router.ts";
import clientes from "../modules/clientes/router.ts";
import tipo from "../modules/proyectos/submodules/tipo/router.ts";
import reunion from "../modules/proyectos/submodules/reunion/router.ts";
import pago from "../modules/proyectos/submodules/pago/router.ts";
import direccion from "../modules/proyectos/submodules/direccion/router.ts";
import fase from "../modules/proyectos/submodules/fase/router.ts";
import documento from "../modules/proyectos/submodules/documento/router.ts";
import { notificaciones } from "../modules/notificaciones/router.ts";
import sesion from "../modules/sesion/router.ts";
import reportes from "../modules/reportes/router.ts";
import prediccion from "../modules/prediccion/router.ts";

const route = new Router();

//ruta main proy
route.use("/proyectos", proyecto.routes(), proyecto.allowedMethods());

route.use("/tipo-proyectos", tipo.routes(), tipo.allowedMethods());
route.use("/reunion-proyectos", reunion.routes(), reunion.allowedMethods());
route.use("/pago-proyectos", pago.routes(), pago.allowedMethods());
route.use("/direccion-proyectos", direccion.routes(), direccion.allowedMethods());
route.use("/fase-proyectos", fase.routes(), fase.allowedMethods());
route.use("/documento-proyectos", documento.routes(), documento.allowedMethods());

//arq
route.use("/arquitectos", arquitecto.routes(), arquitecto.allowedMethods());

//clientes
route.use("/clientes", clientes.routes(), clientes.allowedMethods());

//login
route.use("/sesion", sesion.routes(), sesion.allowedMethods());

//reportes
route.use("/reporte", reportes.routes(), reportes.allowedMethods());

//rutas adicionales 
route.use("/notificaciones", notificaciones.routes(), notificaciones.allowedMethods());

//aporte academico
route.use("/prediccion", prediccion.routes(), prediccion.allowedMethods());

export default route;