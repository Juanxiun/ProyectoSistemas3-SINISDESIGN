import cli from "../../../database/connect.ts";
import ArquitectoModel from "../model.ts";
import pool from '../../../database/connect.ts';
import { hashPassARQ } from "../../../libs/hashPass.ts";
import { fileBlob } from "../../../libs/converFile.ts";

interface InformacionData {
  universidad: string;
  titulacion: string;
  descripcion: string;
  fotoFile: File | null;
}
interface res {
  data?: any;
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

export const CreateQuery = async (
  arquitecto: ArquitectoModel,
  info: InformacionData,
  especialidades: string[]
): Promise<res> => {

  if (!arquitecto.codigo || typeof arquitecto.codigo !== 'string') {
    return { std: 400, error: "El código de arquitecto es obligatorio y debe ser una cadena." };
  }


  try {

    const arqQuery = `
          INSERT INTO arquitectos (codigo, ci, nombre, apellido, telefono, correo, admin, password, estado)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
    const hashedPassword = await hashPassARQ(arquitecto.password || "12345678");

    const arqParams = [
      arquitecto.codigo,
      arquitecto.ci,
      arquitecto.nombre,
      arquitecto.apellido,
      arquitecto.telefono,
      arquitecto.correo,
      arquitecto.admin,
      hashedPassword,
      arquitecto.estado,
    ];

    await cli.execute(arqQuery, arqParams);


    try {
      let fotoBlob: Uint8Array | null = null;
      if (info.fotoFile) {

        fotoBlob = await fileBlob(info.fotoFile);
      }

      const infoQuery = `
                INSERT INTO informaciones (arq, foto, universidad, titulacion, descripcion)
                VALUES (?, ?, ?, ?, ?)
            `;
      const infoParams = [
        arquitecto.codigo,
        fotoBlob,
        info.universidad,
        info.titulacion,
        info.descripcion,
      ];

      await cli.execute(infoQuery, infoParams);

    } catch (infoError) {


      console.warn("ADVERTENCIA: Falló la inserción de información profesional. Se insertarán datos por defecto para mantener la integridad: " + (infoError as Error).message);

      const defaultInfoQuery = `
                INSERT INTO informaciones (arq, foto, universidad, titulacion, descripcion)
                VALUES (?, ?, ?, ?, ?)
            `;

      const defaultInfoParams = [
        arquitecto.codigo,
        new Uint8Array(0),
        "Sin especificar",
        "2000-01-01",
        "Sin información profesional registrada. Por favor, edite al ingresar a detalles.",
      ];
      await cli.execute(defaultInfoQuery, defaultInfoParams);
    }



    if (especialidades.length > 0) {
      const valuesPlaceholder = especialidades.map(() => "(?, ?)").join(", ");
      const espQuery = `
                INSERT INTO especializaciones (arq, especialidad) VALUES ${valuesPlaceholder}
            `;

      const espParams: (string | number)[] = [];
      especialidades.forEach(esp => {
        if (esp && typeof esp === 'string') {
          espParams.push(arquitecto.codigo?.toString() ?? "");
          espParams.push(esp);
        }
      });

      if (espParams.length > 0) {
        await cli.execute(espQuery, espParams);
      }
    }


    return { std: 200 };

  } catch (error) {

    console.error("Error en la query: Arquitectos > Create >\n", error);

    const errorMessage = (error as Error).message || "Error de base de datos desconocido.";

    return {
      std: 500,
      error: "Error al crear el registro del arquitecto. Revise el código/CI para duplicados. Motivo: " + errorMessage,
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
    return { std: 200, data: result };
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

export const checkAssignedProjects = async (codigo: string): Promise<{ count: number, std: number }> => {
  try {
    const query = `
          SELECT COUNT(*) AS count
          FROM proyectos
          WHERE arq = ? AND est = 1
        `;

    const [rows] = await cli.query(query, [codigo]);


    const firstRow = Array.isArray(rows) && rows.length > 0 ? (rows as any[])[0] : null;
    const count = firstRow ? Number(firstRow.count ?? firstRow['COUNT(*)'] ?? 0) : 0;

    return { count, std: 200 };
  } catch (error) {
    console.error("Error en la query: Arquitectos > checkAssignedProjects >", error);
    return { count: -1, std: 500 };
  }
};
