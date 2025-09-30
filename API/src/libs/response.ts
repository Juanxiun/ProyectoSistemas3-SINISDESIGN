import { Context } from "@oak/oak";

interface header {
  content: string;
  app: string;
}

export const ResponseOak =(
  ctx: Context,
  status: number,
  data: any | null,
  header: header,
) => {
  ctx.response.status = status;
  ctx.response.headers.set(header.content, header.app);
  ctx.response.body = {
    "status": status,
    "data": data,
  };
};
