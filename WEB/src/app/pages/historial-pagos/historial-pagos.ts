import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { ObtenerHistorialPagos } from "../../api/historial/historialPagos";

import { Navbar } from "../../components/navbar/navbar";
import { Siderbar } from "../../components/siderbar/siderbar";

@Component({
  selector: "app-historial-pagos",
  standalone: true,
  imports: [CommonModule, FormsModule, Navbar, Siderbar],
  templateUrl: "./historial-pagos.html",
  styleUrls: ["./historial-pagos.css"]
})
export class HistorialPagosPage implements OnInit {

  historial: any[] = [];

  constructor() {}

  async ngOnInit() {
    console.log("Cargando historial...");
    this.historial = await ObtenerHistorialPagos();
    console.log("Historial cargado:", this.historial);
  }
}
