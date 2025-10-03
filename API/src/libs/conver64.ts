// deno-lint-ignore-file no-explicit-any
import { Buffer } from "node:buffer";

export const conver64 = (type: string, data: any) => {
  const file = Buffer.isBuffer(data) ? data : Buffer.from(data as any);
  let file64 = file.toString("base64");
  file64 = `${type}, ${file64}`;
  return file64;
};

export const typeFile = {
  jpg: "data:image/jpg;base64",
  png: "data:image/png;base64",
  pdf: "data:application/pdf;base64",
  word:
    "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64",
  excel:
    "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64",
  zip: "data:application/zip;base64",
};
