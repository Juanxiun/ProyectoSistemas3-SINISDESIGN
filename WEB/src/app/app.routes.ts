// deno-lint-ignore-file no-sloppy-imports
import { Routes } from "@angular/router";
import { Proyectos } from "./pages/proyectos/proyectos";
import { Presentation } from "./pages/presentation/presentation";
import { PerfilArquitectos } from "./pages/perfil-arquitectos/perfil-arquitectos";

import { RegistroArquitectos } from "./pages/registro-arquitectos/registro-arquitectos";
import { CrearArquitecto } from "./pages/registro-arquitectos/crear-arquitecto/crear-arquitecto";
import { DetalleArquitecto } from "./pages/registro-arquitectos/detalle-arquitecto/detalle-arquitecto";

import { Login } from "./pages/login/login";
import { DocumentosCrudPage } from "./pages/documentos/documentos";

import { CrearProyectos } from "./pages/proyectos/crear-proyectos/crear-proyectos";
import { Calendario } from "./pages/calendario/calendario";

import { ReportesPage } from "./pages/reportes/reportes";

export const routes: Routes = [
    { path: "", title: "SINISDESIGN", component: Presentation },
    { path: "equipo/:tamProy", title: "Equipo", component: PerfilArquitectos },
    { path: "proyectos", title: "Proyectos", component: Proyectos },

    // RUTAS DE REGISTRO DE ARQUITECTOS
    {
        path: "arquitectos",
        title: "Lista Arquitectos",
        component: RegistroArquitectos,
    },
    {
        path: "registro-arquitectos/crear",
        title: "Crear Arquitecto",
        component: CrearArquitecto,
    },
    {
        path: "registro-arquitectos/detalle/:codigo",
        title: "Detalle Arquitecto",
        component: DetalleArquitecto,
    },

    {
        path:"reportes", title: "Reportes", component: ReportesPage
    },

    // RUTA DE LOGIN
    { path: "login", component: Login },
    { path: "", redirectTo: "login", pathMatch: "full" },
    //RUTAS DE DOCUMENTO

    {
        path: "fases/:faseId/documentos",
        component: DocumentosCrudPage,
    },
    // RUTAS DE REGISTRO DE PROYECTOS
    {
        path: "registro-proyectos/crear/:arq",
        title: "Crear Proyecto",
        component: CrearProyectos,
    },
    { path: "agenda", title: "Agenda", component: Calendario },
];
