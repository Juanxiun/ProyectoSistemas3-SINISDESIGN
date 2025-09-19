import { Application } from "@oak/oak/application";
import {oakCors} from "cors";
import route from "./src/router/main.ts";

const app = new Application();

app.use(oakCors());

app.use(route.routes());
app.use(route.allowedMethods());

console.log("url: http://127.0.0.1:8080/")
app.listen({ hostname: "127.0.0.1", port: 8080 });


