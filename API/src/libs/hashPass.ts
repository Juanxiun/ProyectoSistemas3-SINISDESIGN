import * as bcrypt from "bcrypt";
import { encrypt } from "../config/index.ts";

export const hashPass = (pass: string) => {
  bcrypt.genSalt(encrypt.rounds);
  return bcrypt.hash(pass);
};

export const hashCompare = (pass: string, compare: string) => {
  return bcrypt.compare(compare, pass);
};

export const hashPassARQ = async (pass: string): Promise<string> => {
  const salt = await bcrypt.genSalt(encrypt.rounds);
  return await bcrypt.hash(pass, salt);
};

export const hashCompareARQ = async (pass: string, compare: string): Promise<boolean> => {
  return await bcrypt.compare(compare, pass);
};

