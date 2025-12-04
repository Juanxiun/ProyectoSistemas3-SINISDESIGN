import { Component, Input, OnInit, ChangeDetectorRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import PagoProps, { ProyPago } from "../../../api/proyectos/proyPago";

@Component({
    selector: "app-pagos",
    templateUrl: "./pagos.html",
    styleUrls: ["./pagos.css"],
    standalone: true,
    imports: [CommonModule]
})
export class Pagos implements OnInit {

    @Input() idproy: number = 0;
    pagos: PagoProps[] = [];
    totalPagado: number = 0;

    loading = true;
    error: string | null = null;

    constructor(private cdr: ChangeDetectorRef) { }

    async ngOnInit() {
        await this.loadPagos();
    }

    async loadPagos() {
        try {
            const data = await ProyPago(this.idproy.toString());
            this.pagos = data || [];
            this.totalPagado = this.pagos.reduce((sum, p) => sum + p.monto, 0);
        } catch (e) {
            this.error = "Error al cargar los pagos.";
        } finally {
            this.loading = false;
            this.cdr.detectChanges();
        }
    }

    formatDate(dateString: string): string {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric"
            });
        } catch {
            return dateString;
        }
    }
}
