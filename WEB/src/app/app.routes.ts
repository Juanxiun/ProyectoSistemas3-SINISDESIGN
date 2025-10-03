import { Routes } from '@angular/router';
import {Proyectos} from './pages/proyectos/proyectos';
import {Presentation} from './pages/presentation/presentation';
import {PerfilArquitectos} from './pages/perfil-arquitectos/perfil-arquitectos';

export const routes: Routes = [
    {path:"", title:"SINISDESIGN", component: Presentation},
    {path:"equipo", title:"Equipo", component: PerfilArquitectos},
    {path:"proyectos/:usr", title:"Proyectos", component: Proyectos},
];

