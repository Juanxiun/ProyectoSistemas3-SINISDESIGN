import { Routes } from '@angular/router';
import {Proyectos} from './pages/proyectos/proyectos';
import {Presentation} from './pages/presentation/presentation';

export const routes: Routes = [
    {path:"", title:"SINISDESIGN", component: Presentation},
    {path:"proyectos", title:"Proyectos", component: Proyectos},
];

