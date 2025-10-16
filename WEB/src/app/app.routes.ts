import { Routes } from '@angular/router';
import { Proyectos } from './pages/proyectos/proyectos';
import { Presentation } from './pages/presentation/presentation';
import { PerfilArquitectos } from './pages/perfil-arquitectos/perfil-arquitectos';

import { RegistroArquitectos } from './pages/registro-arquitectos/registro-arquitectos';
import { CrearArquitecto } from './pages/registro-arquitectos/crear-arquitecto/crear-arquitecto';
import { DetalleArquitecto } from './pages/registro-arquitectos/detalle-arquitecto/detalle-arquitecto';
import { DocumentosCrudPage } from './pages/documentos/documentos';



export const routes: Routes = [
    { path: "", title: "SINISDESIGN", component: Presentation },
    { path: "equipo", title: "Equipo", component: PerfilArquitectos },
    { path: "proyectos/:usr", title: "Proyectos", component: Proyectos },

    // RUTAS DE REGISTRO DE ARQUITECTOS
    { path: "registro-arquitectos", title: "Lista Arquitectos", component: RegistroArquitectos },
    { path: "registro-arquitectos/crear", title: "Crear Arquitecto", component: CrearArquitecto },
    { path: "registro-arquitectos/detalle/:codigo", title: "Detalle Arquitecto", component: DetalleArquitecto },

    //RUTAS DE DOCUMENTO 

    {
        path: 'fases/:faseId/documentos',
        component: DocumentosCrudPage,
    }
];

