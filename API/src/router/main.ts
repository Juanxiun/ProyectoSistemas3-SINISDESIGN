import { Router } from "@oak/oak";

const route = new Router();

route
  .get("/", (ctx) => {
    ctx.response.status = 200;
    ctx.response.body = {
      "msg": "INGRSO A LA API",
      "status": 200,
    };
  });

export default route;
