import { Router } from "@oak/oak";
import proyecto from "../modules/proyectos/router.ts";

const route = new Router();

route.use("/proyectos", proyecto.routes(), proyecto.allowedMethods());

export default route;
