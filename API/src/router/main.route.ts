import { Router } from "@oak/oak";
import proyecto from "../modules/proyectos/router.ts";
import arquitecto from "../modules/arquitectos/router.ts";
const route = new Router();

route.use("/proyectos", proyecto.routes(), proyecto.allowedMethods());
//arq
route.use("/arquitectos", arquitecto.routes(), arquitecto.allowedMethods());

export default route;
