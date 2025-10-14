import { ReqFasePre } from "../query/reqProy.query.ts";
import { TipoProyPre } from "../query/tipoProy.query.ts";
import { FaseProyPre } from "../query/faseProy.query.ts";
import { FaseProyPreModel, ReqProyModel, TipoProyPreModel } from "../models.ts";

class Nodo {
  private grafo: Array<any> = [];
  private edges: Array<{ from: string; to: string }> = [];

  /**
   * Proceso: obtener proy > separar por tipo proyecto y gestion >  calcular estimados de cada fase.
   */
  public async processProject(idProy: string): Promise<any> {
    try {

      const reqRes = await ReqFasePre(idProy);
      if (reqRes.std !== 200 || !reqRes.data?.length) {
        throw new Error("No se pudieron obtener los datos del proyecto.");
      }

      const proyData: ReqProyModel = reqRes.data[0];
      const { tipo, subtipo } = proyData;

      this.grafo.push({ node: "proy", data: { id: idProy, tipo, subtipo } });
      this.edges.push({ from: "start", to: "proy" });

      //Obtener proyectos del mismo tipo y subtipo
      const tipoRes = await TipoProyPre(tipo, subtipo);
      if (tipoRes.std !== 200 || !tipoRes.data) {
        throw new Error("No se pudieron obtener los proyectos relacionados.");
      }
      const tipoProy: TipoProyPreModel[] = tipoRes.data;

      // agrupar por gestion
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


      //grupos de nodos separados por gestion 

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
        } else {
          console.warn(`Año invalido: ${gestion}`);
        }
      }

      //console.log(faseEstimada);

      this.grafo.push({ node: "estimado", data: faseEstimada });
      this.edges.push({ from: "gestion", to: "estimado" });

      const finalC = this.calculatePredictions(faseEstimada);

      this.grafo.push({ node: "calculo", data: finalC });
      this.edges.push({ from: "estimado", to: "calculo" });

      return finalC;
    } catch (error) {
      console.error("Error > prediccio > ", error);
      return { error: "Error en el procesamiento", details: "Error Interno" };
    }
  }

  /**
   * Calcula tiempos promedio
   */
  private calculatePredictions(
    phaseEstimates: { [gestion: number]: FaseProyPreModel[] },
  ): any {
    const allPhases: { [fase: string]: { durations: number[] } } = {};

    //Unir todas las fases y sus duraciones
    for (const gestion in phaseEstimates) {
      phaseEstimates[parseInt(gestion)].forEach((phaseData) => {
        if (!allPhases[phaseData.fase]) {
          allPhases[phaseData.fase] = { durations: [] };
        }
        allPhases[phaseData.fase].durations.push(phaseData.day);
      });
    }

    //Calcular estadísticas por fase
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
}

export default Nodo;
