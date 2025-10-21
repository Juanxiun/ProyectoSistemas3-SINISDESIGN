import cli from "../../../database/connect.ts";
import { hashCompare } from "../../../libs/hashPass.ts";

interface res {
  data?: any[];
  std: number;
  msg?: string;
}

export const SesionQuery = async (usr: string, pass: string): Promise<res> => {
  try {
    const isCliente = !!parseInt(usr);

    const usuario = {
      table: isCliente ? "clientes x" : "arquitectos x",
      campos: isCliente
        ? "x.ci AS id, x.password"
        : "x.codigo AS id, x.admin, x.password",
      where: isCliente ? "x.ci = ?" : "x.codigo = ?",
    };

    const query = `
      SELECT ${usuario.campos}
      FROM ${usuario.table}
      WHERE x.estado = 1 AND ${usuario.where}
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

    delete user.password;

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
