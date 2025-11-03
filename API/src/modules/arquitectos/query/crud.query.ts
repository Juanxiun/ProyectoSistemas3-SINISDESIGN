import cli from "../../../database/connect.ts";
import ArquitectoModel from "../model.ts";
import pool from '../../../database/connect.ts';
import { hashPass } from "../../../libs/hashPass.ts";

interface res {
  data?: ArquitectoModel[];
  std: number;
  error?: string;
}


export const SelectQuery = async (codigo?: string): Promise<res> => {
  try {
    const query = `
      SELECT codigo, ci, nombre, apellido, telefono, correo, admin, estado
      FROM arquitectos
      ${codigo ? "WHERE codigo = ?" : ""}
    `;


    const params = codigo ? [codigo] : [];


    const [rows] = await cli.query(query, params);
    const arquitectos = Array.isArray(rows) ? (rows as ArquitectoModel[]) : [];

    return {
      data: arquitectos,
      std: 200,
    };
  } catch (error) {
    console.error("Error en la query: Arquitectos > Select >", error);
    return {
      data: [],
      std: 500,
    };
  }
};

export const CreateQuery = async (data: ArquitectoModel): Promise<res> => {
  try {
    const [existingCI] = await cli.query('SELECT ci FROM arquitectos WHERE ci = ?', [data.ci]);
    if (Array.isArray(existingCI) && existingCI.length > 0) {
      return {
        std: 400,
        error: 'Ya existe un arquitecto con este C.I.'
      };
    }

    // Verificar código duplicado
    const [existingCodigo] = await cli.query('SELECT codigo FROM arquitectos WHERE codigo = ?', [data.codigo]);
    if (Array.isArray(existingCodigo) && existingCodigo.length > 0) {
      return {
        std: 400,
        error: 'Ya existe un arquitecto con este código'
      };
    }

    // Verificar teléfono duplicado
    const [existingTelefono] = await cli.query('SELECT telefono FROM arquitectos WHERE telefono = ?', [data.telefono]);
    if (Array.isArray(existingTelefono) && existingTelefono.length > 0) {
      return {
        std: 400,
        error: 'Ya existe un arquitecto con este teléfono'
      };
    }
    const query = `
      INSERT INTO arquitectos (codigo, ci, nombre, apellido, telefono, correo, admin, password, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    //por defecto (TODO: quitarlo despues cuando ya se cambie)
    const passwordHashed = await hashPass("12345678");

    const params = [
      data.codigo,
      data.ci,
      data.nombre,
      data.apellido,
      data.telefono,
      data.correo,
      data.admin,
      passwordHashed,
      1,
    ];

    await cli.query(query, params);

    return {
      std: 200,
    };
  } catch (error) {
    console.log("Error en la query: Arquitectos > Create >\n", error);
    return {
      std: 500,
      error: 'Error al crear el arquitecto'
    };
  }
};


export async function UpdateQuery(codigo: string, data: Record<string, string | number>): Promise<any> {
  if (!codigo) throw new Error('Código requerido');
  const keys = Object.keys(data);
  if (keys.length === 0) return { std: 200, data: { affectedRows: 0 } };

  const ci = data['ci']
  const telefono = data['telefono']
  const newCodigo = data['codigo']

  if (ci) {
    const [existingCI] = await cli.query('SELECT ci FROM arquitectos WHERE ci = ? AND codigo != ?', [ci, codigo]);
    if (Array.isArray(existingCI) && existingCI.length > 0) {
      return {
        std: 400,
        error: 'Ya existe un arquitecto con este C.I.'
      };
    }
  }


  if (newCodigo) {

    const [existingCodigo] = await cli.query('SELECT codigo FROM arquitectos WHERE codigo = ? AND codigo != ?', [newCodigo, codigo]);
    if (Array.isArray(existingCodigo) && existingCodigo.length > 0) {
      return {
        std: 400,
        error: 'Ya existe un arquitecto con este código'
      };
    }
  }


  if (telefono) {

    const [existingTelefono] = await cli.query('SELECT telefono FROM arquitectos WHERE telefono = ? AND codigo != ?', [telefono, codigo]);
    if (Array.isArray(existingTelefono) && existingTelefono.length > 0) {
      return {
        std: 400,
        error: 'Ya existe un arquitecto con este teléfono'
      };
    }
  }

  try {
    const setClause = keys.map(k => `\`${k}\` = ?`).join(', ');
    const values = keys.map(k => data[k]);
    const sql = `UPDATE arquitectos SET ${setClause} WHERE codigo = ?`;

    values.push(codigo);

    const [result] = await pool.query(sql, values);
    return { std: 200, data: result };//exito
  } catch (error) {
    console.error("Error en la query: Arquitectos > Update >", error);
    return {
      std: 500,
      error: 'Error interno al actualizar el arquitecto.'
    };
  }
}

export const DeleteQuery = async (codigo: string): Promise<res> => {
  try {
    await cli.query(
      `UPDATE
            arquitectos
        SET
            estado = 0
        WHERE
            codigo = ?`,
      [codigo],
    );
    return {
      std: 200,
    };
  } catch (error) {
    console.log("Error en la query: Arquitectos > Delete >\n" + error);
    return {
      std: 500,
    };
  }
};
