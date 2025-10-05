import cli from "../../../database/connect.ts";
import { hashCompare } from "../../../libs/hashPass.ts";

interface res {
  data?: any[];
  std: number;
  msg?: string;
}

export const SesionQuery = async (usr: string, pass: string): Promise<res> => {
  try {
    const usuario = {
      table: parseInt(usr) ? "clientes" : "arquitectos",
      campos: parseInt(usr) ? "ci, " : "codigo, admin, ",
      where: parseInt(usr) ? "ci = ?" : "codigo = ?",
    };

    const query = `
      SELECT ${usuario.campos} nombre, apellido, password
      FROM ${usuario.table}
      WHERE estado = 1 AND ${usuario.where}
    `;

    const params = [usr];
    const [rows] = await cli.query(query, params);
    const sesion = Array.isArray(rows) ? (rows as any[]) : [];

    if (sesion.length === 0) {
      return {
        data: [],
        std: 404,
        msg: "Usuario o contraseña incorrectos",
      };
    }

    const user = sesion[0];
    const valid = await hashCompare(user.password, pass);

    if (!valid) {
      return {
        data: [],
        std: 401,
        msg: "Usuario o contraseña incorrectos",
      };
    }

    delete (user as any).password;

    return {
      data: [user],
      std: 200,
      msg: "Inicio de sesión exitoso",
    };
  } catch (error) {
    console.error("Error en la QUERY > SESION >", error);
    return {
      data: [],
      std: 500,
      msg: "Error interno del servidor",
    };
  }
};
