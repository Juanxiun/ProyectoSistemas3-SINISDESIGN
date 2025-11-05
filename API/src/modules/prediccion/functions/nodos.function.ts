import { ReqFasePre } from "../query/reqProy.query.ts";
import { TipoProyPre } from "../query/tipoProy.query.ts";
import { FaseProyPre } from "../query/faseProy.query.ts";
import { FaseProyPreModel, ReqProyModel, TipoProyPreModel } from "../models.ts";
import cli from "../../../database/connect.ts";

class Nodo {
  private grafo: Array<any> = [];
  private edges: Array<{ from: string; to: string }> = [];

  public async processProject(idProy: string): Promise<any> {
    try {
      const reqRes = await ReqFasePre(idProy);
      if (reqRes.std !== 200 || !reqRes.data?.length) {
        throw new Error("Sin proyectos");
      }

      const proyData: ReqProyModel = reqRes.data[0];
      const { tipo, subtipo } = proyData;

      this.grafo.push({ node: "proy", data: { id: idProy, tipo, subtipo } });
      this.edges.push({ from: "start", to: "proy" });

      const tipoRes = await TipoProyPre(tipo, subtipo);
      if (tipoRes.std !== 200 || !tipoRes.data) {
        throw new Error("Sin proyectos");
      }
      const tipoProy: TipoProyPreModel[] = tipoRes.data;

      const grupoGestion: { [gestion: number]: TipoProyPreModel[] } = {};
      tipoProy.forEach((project) => {
        const gestionA = project.inicio;
        if (gestionA) {
          if (!grupoGestion[gestionA]) {
            grupoGestion[gestionA] = [];
          }
          grupoGestion[gestionA].push(project);
        }
      });

      this.grafo.push({ node: "gestion", data: grupoGestion });
      this.edges.push({ from: "proy", to: "gestion" });

      const faseEstimada: { [gestion: number]: FaseProyPreModel[] } = {};
      for (const gestion in grupoGestion) {
        const year = parseInt(gestion);
        if (!isNaN(year)) {
          const faseRes = await FaseProyPre(year);
          if (faseRes.std === 200 && faseRes.data) {
            faseEstimada[year] = faseRes.data;
          }
        }
      }

      this.grafo.push({ node: "estimado", data: faseEstimada });
      this.edges.push({ from: "gestion", to: "estimado" });

      const finalC = this.calculatePredictions(faseEstimada);

      this.grafo.push({ node: "calculo", data: finalC });
      this.edges.push({ from: "estimado", to: "calculo" });

      await this.savePhasesToDatabase(idProy, finalC.phasePredictions, proyData.inicio);

      return finalC;
    } catch (error) {
      return { error: "Error en el procesamiento", details: "Error Interno" };
    }
  }

  private calculatePredictions(
    phaseEstimates: { [gestion: number]: FaseProyPreModel[] },
  ): any {
    const allPhases: { [fase: string]: { durations: number[] } } = {};

    for (const gestion in phaseEstimates) {
      phaseEstimates[parseInt(gestion)].forEach((phaseData) => {
        if (!allPhases[phaseData.fase]) {
          allPhases[phaseData.fase] = { durations: [] };
        }
        allPhases[phaseData.fase].durations.push(phaseData.day);
      });
    }

    const phasePredictions: {
      [fase: string]: {
        fastest: number;
        slowest: number;
        average: number;
        predicted: number;
      };
    } = {};

    let totalProyTime = 0;

    for (const fase in allPhases) {
      const durations = allPhases[fase].durations;
      if (durations.length > 0) {
        const fastest = Math.min(...durations);
        const slowest = Math.max(...durations);
        const average = durations.reduce((a, b) => a + b, 0) / durations.length;
        const predicted = average;

        phasePredictions[fase] = { fastest, slowest, average, predicted };
        totalProyTime += predicted;
      }
    }

    return {
      projectPredictedTime: totalProyTime,
      phasePredictions,
    };
  }

  /**
   * Obtiene la descripción específica para cada fase
   */
  private getDescripcionFase(nombreFase: string): string {
    const descripciones: { [key: string]: string } = {
      'inicial': 'Coordinación inicial y establecimiento de requisitos del proyecto. Incluye reuniones de planificación, definición de alcance y asignación de recursos.',
      'inspeccion/diseño': 'Inspección del sitio y diseño arquitectónico. Comprende análisis topográfico, estudios de suelo y desarrollo de planos y especificaciones técnicas.',
      'desarrollo': 'Ejecución de la construcción y desarrollo del proyecto. Abarca trabajos de cimentación, estructura, instalaciones y acabados.',
      'legalizacion': 'Tramitación y legalización de permisos y documentación. Incluye presentación ante municipalidades, obtención de licencias y cumplimiento normativo.',
      'finalizacion': 'Entrega final y cierre del proyecto. Comprende inspecciones finales, corrección de observaciones y formalización de la entrega al cliente.'
    };

    return descripciones[nombreFase] || `Fase de ${nombreFase} - Desarrollo de actividades específicas según el plan del proyecto.`;
  }

  /**
 * Guarda las fases predichas en la base de datos y actualiza la fecha final del proyecto
 */
private async savePhasesToDatabase(
  proyId: string,
  phasePredictions: {
    [fase: string]: {
      fastest: number;
      slowest: number;
      average: number;
      predicted: number;
    };
  },
  fechaInicio: string
): Promise<void> {
  try {
    if (!phasePredictions || Object.keys(phasePredictions).length === 0) {
      return;
    }

    let fechaActual = new Date(fechaInicio);
    let fechaFinalProyecto: Date | null = null;

    if (isNaN(fechaActual.getTime())) {
      return;
    }

    // DEFINIR EL ORDEN CORRECTO DE LAS FASES
    const ordenFases = [
      'inicial',
      'inspeccion/diseño', 
      'desarrollo',
      'legalizacion',
      'finalizacion'
    ];

    // Mapeo de nombres alternativos a nombres estándar
    const mapeoNombres: { [key: string]: string } = {
      'inspeccion/disenio': 'inspeccion/diseño',
      'inspeccion disenio': 'inspeccion/diseño',
      'inspeccion-disenio': 'inspeccion/diseño'
    };

    // Normalizar nombres de fases
    const phasePredictionsNormalizado: typeof phasePredictions = {};
    for (const [nombreFase, datos] of Object.entries(phasePredictions)) {
      const nombreNormalizado = mapeoNombres[nombreFase] || nombreFase;
      phasePredictionsNormalizado[nombreNormalizado] = datos;
    }

    // Ordenar las fases según el orden predefinido
    const fasesOrdenadas = ordenFases.filter(fase => phasePredictionsNormalizado[fase]);

    // Si hay fases que no están en el orden predefinido, agregarlas al final
    const fasesRestantes = Object.keys(phasePredictionsNormalizado).filter(fase => !ordenFases.includes(fase));
    const todasLasFases = [...fasesOrdenadas, ...fasesRestantes];

    for (const nombreFase of todasLasFases) {
      const datos = phasePredictionsNormalizado[nombreFase];
      const diasEstimados = Math.round(datos.predicted);
      
      const fechaFinalFase = new Date(fechaActual);
      fechaFinalFase.setDate(fechaFinalFase.getDate() + diasEstimados);

      fechaFinalProyecto = fechaFinalFase;

      const descripcionFase = this.getDescripcionFase(nombreFase);

      const queryFase = `
        INSERT INTO fases (proy, fase, detalle, inicio, final, estado)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      const paramsFase = [
        parseInt(proyId),
        nombreFase,
        descripcionFase,
        fechaActual.toISOString().slice(0, 19).replace('T', ' '),
        fechaFinalFase.toISOString().slice(0, 19).replace('T', ' '),
        1
      ];

      try {
        await cli.query(queryFase, paramsFase);
      } catch (insertError) {
      }

      fechaActual = new Date(fechaFinalFase);
      fechaActual.setDate(fechaActual.getDate() + 1); 
    }

    if (fechaFinalProyecto) {
      await this.updateProjectFinalDate(proyId, fechaFinalProyecto);
    }

  } catch (error) {
  }
}

  private async updateProjectFinalDate(proyId: string, fechaFinal: Date): Promise<void> {
    try {
      const queryUpdateProyecto = `
        UPDATE proyectos 
        SET final = ? 
        WHERE id = ?
      `;

      const paramsUpdate = [
        fechaFinal.toISOString().slice(0, 19).replace('T', ' '),
        parseInt(proyId)
      ];

      await cli.query(queryUpdateProyecto, paramsUpdate);
    } catch (error) {
    }
  }
}

export default Nodo;