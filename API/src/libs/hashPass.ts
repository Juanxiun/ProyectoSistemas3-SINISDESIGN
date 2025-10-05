import * as bcrypt from "bcrypt";
import { encrypt } from "../config/index.ts";

export const hashPass = (pass: string) => {
  bcrypt.genSalt(encrypt.rounds);
  return bcrypt.hash(pass);
};

export const hashCompare = (pass: string, compare: string) => {
  return bcrypt.compare(compare, pass);
};

