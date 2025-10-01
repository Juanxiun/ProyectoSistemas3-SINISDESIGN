import { Component, OnInit } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { Siderbar } from '../../components/siderbar/siderbar';
import { CardProy } from "../../components/card-proy/card-proy";

@Component({
  selector: 'app-proyectos',
  imports: [Navbar, Siderbar, CardProy],
  templateUrl: './proyectos.html',
  styleUrl: './proyectos.css'
})
export class Proyectos {

  usr: string | null = null;

}
