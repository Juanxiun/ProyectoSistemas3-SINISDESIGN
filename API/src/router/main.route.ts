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

const route = new Router();

//ruta main proy
route.use("/proyectos", proyecto.routes(), proyecto.allowedMethods());
route.use("/tipo", tipo.routes(), tipo.allowedMethods());
route.use("/reunion", reunion.routes(), reunion.allowedMethods());
route.use("/pago", pago.routes(), pago.allowedMethods());
route.use("/direccion", direccion.routes(), direccion.allowedMethods());
route.use("/fase", fase.routes(), fase.allowedMethods());
route.use("/documento", documento.routes(), documento.allowedMethods());

//arq
route.use("/arquitectos", arquitecto.routes(), arquitecto.allowedMethods());

//clientes
route.use("/clientes", clientes.routes(), clientes.allowedMethods());

//login
route.use("/sesion", sesion.routes(), sesion.allowedMethods());

//rutas adicionales 
route.use("/notificaciones", notificaciones.routes(), notificaciones.allowedMethods());

export default route;