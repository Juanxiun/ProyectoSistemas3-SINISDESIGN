import { Router } from "@oak/oak";
import { SesionController } from "./controller/sesion.controller.ts";

const sesion = new Router();
const ses = new SesionController();

sesion
    .post("/", async(ctx) => {
        const form = await ctx.request.body.formData();

        const sesion = {
            usr: form.get("usr") as string,
            pass: form.get("password") as string,
        }
        await ses.login(ctx, sesion.usr, sesion.pass);
    });

export default sesion;