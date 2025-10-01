import { Routes } from '@angular/router';
import {Proyectos} from './pages/proyectos/proyectos';

export const routes: Routes = [
    {path:"proyectos/:usr", title:"Proyectos", component: Proyectos},
];
