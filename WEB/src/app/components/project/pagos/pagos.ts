import { Component, Input, OnInit, ChangeDetectorRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import PagoProps, { ProyPago } from "../../../api/proyectos/proyPago";
import { ConnectA } from "../../../../config/index";

@Component({
    selector: "app-pagos",
    templateUrl: "./pagos.html",
    styleUrls: ["./pagos.css"],
    standalone: true,
    imports: [CommonModule, FormsModule]
})
export class Pagos implements OnInit {

    @Input() idproy: number = 0;
    @Input() costoProyecto: number = 0;

    pagos: PagoProps[] = [];
    totalPagado: number = 0;
    deuda: number = 0;
    modalError: string | null = null;

    // estados
    loading = true;
    error: string | null = null;

    // modal
    showModal = false;
    editMode = false;
    editingId: number | null = null;

    // formulario
    titulo = "";
    monto: number = 0;
    fecha = "";

    //formEror7
    formErrors = {
    titulo: "",
    monto: "",
    fecha: ""
    };


    constructor(private cdr: ChangeDetectorRef) { }

    async ngOnInit() {
        await this.loadPagos();
        await this.loadDeuda();
    }

    // CARGAR PAGOS
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

    // CARGAR DEUDA DESDE LA API
    async loadDeuda() {
        try {
            const res = await fetch(ConnectA.api + "/pago-proyectos/p/deuda/" + this.idproy);

            if (!res.ok) return;

            const data = await res.json();

            if (data.status === 200 && Array.isArray(data.data.data) && data.data.data.length > 0) {
                const d = data.data.data[0]; // ← toma el primer elemento del array
                this.totalPagado = d.pago;
                this.deuda = d.deuda;
            } else {
                // Cálculo manual en caso de fallo
                this.deuda = this.costoProyecto - this.totalPagado;
            }
        } catch (e) {
            this.deuda = this.costoProyecto - this.totalPagado;
        }
        this.cdr.detectChanges();
    }

    // FORMATEAR FECHA
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

    // MODAL NUEVO PAGO
    openModal() {
        this.showModal = true;
        this.editMode = false;
        this.editingId = null;

        this.titulo = "";
        this.monto = 0;
        this.fecha = this.getToday();
    }

    // MODAL EDITAR
    openEditModal(p: PagoProps) {
        this.showModal = true;
        this.editMode = true;

        this.editingId = p.id ?? null;
        this.titulo = p.titulo;
        this.monto = p.monto;
        this.fecha = this.getToday();
    }

    closeModal() {
        this.showModal = false;
    }
    // GUARDAR PAGO
    async savePago() {
        this.formErrors = { titulo: "", monto: "", fecha: "" };
        if (!this.titulo || this.titulo.trim().length === 0) {// VALIDACIÓN: TÍTULO VACÍO
            this.formErrors.titulo = "El título no puede estar vacío.";
        }
        if (!this.monto || this.monto <= 0) {// VALIDACIÓN: MONTO
            this.formErrors.monto = "El monto debe ser mayor a 0.";
        }
        const totalPrevio = this.totalPagado - (this.editMode ? this.getMontoOriginal() : 0);// VALIDACIÓN: NO SUPERAR MONTO TOTAL DEL PROYECTO
        const totalFuturo = totalPrevio + this.monto;
        if (totalFuturo > this.costoProyecto) {
            this.formErrors.monto =
                `El pago excede el monto total del proyecto. Monto máximo permitido: Bs ${this.costoProyecto - totalPrevio}.`;
        }
        if (!this.fecha) {// VALIDACIÓN: FECHA (Siempre auto-hoy)
            this.formErrors.fecha = "Debe seleccionar una fecha.";
        }
        if (this.formErrors.titulo || this.formErrors.monto || this.formErrors.fecha) {
            return;
        }
        // GUARDAR (POST O PUT)
        const form = new FormData();
        form.append("proy", this.idproy.toString());
        form.append("titulo", this.titulo);
        form.append("monto", this.monto.toString());
        form.append("fecha", this.fecha);

        const isEdit = this.editMode && this.editingId;

        const url = isEdit
            ? `${ConnectA.api}/pago-proyectos/${this.editingId}`
            : `${ConnectA.api}/pago-proyectos/`;

        const method = isEdit ? "PUT" : "POST";

        await fetch(url, { method, body: form });

        this.closeModal();
        await this.loadPagos();
        await this.loadDeuda();
    }



    getMontoOriginal(): number {
        const pago = this.pagos.find(p => p.id === this.editingId);
        return pago ? pago.monto : 0;
    }

    //eliminar uso
    async deletePago(id: number | undefined) {
        if (!id) return;
        if (!confirm("¿Desea eliminar este pago?")) return;

        await fetch(`${ConnectA.api}/pago-proyectos/${id}`, {
            method: "DELETE"
        });

        await this.loadPagos();
        await this.loadDeuda();
    }

    private getToday(): string {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        return hoy.toISOString().split("T")[0];
    }

    validateForm(): boolean {
        this.formErrors = { titulo: "", monto: "", fecha: "" }; // limpiar errores

        // Título
        if (!this.titulo || this.titulo.trim().length === 0) {
            this.formErrors.titulo = "El título no puede estar vacío.";
        }

        // Monto
        if (!this.monto || this.monto <= 0) {
            this.formErrors.monto = "El monto debe ser mayor a 0.";
        }

        // Evitar superar monto total de proyecto
        const totalPrevio = this.totalPagado - (this.editMode ? this.getMontoOriginal() : 0);
        const totalFuturo = totalPrevio + this.monto;

        if (totalFuturo > this.costoProyecto) {
            this.formErrors.monto =
                `El pago excede el monto restante del proyecto. Debe ser menor o igual a Bs ${this.costoProyecto - totalPrevio}.`;
        }

        // Fecha
        if (!this.fecha) {
            this.formErrors.fecha = "Debe seleccionar una fecha.";
        }

        return (
            !this.formErrors.titulo &&
            !this.formErrors.monto &&
            !this.formErrors.fecha
        );
    }
}