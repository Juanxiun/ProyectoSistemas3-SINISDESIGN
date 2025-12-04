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

    //formEror

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
        this.fecha = "";
    }

    // MODAL EDITAR
    openEditModal(p: PagoProps) {
        this.showModal = true;
        this.editMode = true;

        this.editingId = p.id ?? null;
        this.titulo = p.titulo;
        this.monto = p.monto;
        this.fecha = p.fecha;
    }

    closeModal() {
        this.showModal = false;
    }

    // =====================================
    // GUARDAR PAGO (POST O PUT)
    async savePago() {
    this.modalError = null;

    // ============================
    // VALIDACIÓN: TÍTULO VACÍO
    // ============================
    if (!this.titulo || this.titulo.trim().length === 0) {
        this.modalError = "El título no puede estar vacío.";
        return;
    }

    // ============================
    // VALIDACIÓN: MONTO
    // ============================
    if (!this.monto || this.monto <= 0) {
        this.modalError = "El monto debe ser mayor a 0.";
        return;
    }

    // ============================
    // VALIDACIÓN: FECHA VACÍA
    // ============================
    if (!this.fecha) {
        this.modalError = "Debe seleccionar una fecha.";
        return;
    }

    const hoy = new Date();
    hoy.setHours(0,0,0,0);

    const fechaPago = new Date(this.fecha);
    fechaPago.setHours(0,0,0,0);

    // Si es edición → permitir fechas pasadas pero NO futuras
    if (this.editMode) {
        if (fechaPago > hoy) {
            this.modalError = "La fecha del pago no puede ser futura.";
            return;
        }
    } 
    // Si es nuevo pago → NO permitir fechas pasadas ni futuras
    else {
        if (fechaPago < hoy) {
            this.modalError = "La fecha no puede ser anterior a hoy.";
            return;
        }
        if (fechaPago > hoy) {
            this.modalError = "La fecha del pago no puede ser futura.";
            return;
        }
    }

    // ============================
    // VALIDACIÓN: NO SUPERAR MONTO TOTAL
    // ============================
    const montoOriginal = this.editMode ? this.getMontoOriginal() : 0;

    const totalPrevio = this.totalPagado - montoOriginal; 
    const totalFuturo = totalPrevio + this.monto;

    if (totalFuturo > this.costoProyecto) {
        this.modalError =
            `El pago excede el monto total del proyecto.\n\n` +
            `Monto total: Bs ${this.costoProyecto}\n` +
            `Pagado anteriormente: Bs ${totalPrevio}\n` +
            `Pago ingresado: Bs ${this.monto}`;
        return;
    }

    // ============================
    // SI TODO ES VÁLIDO, GUARDAR
    // ============================
    const form = new FormData();
    form.append("proy", this.idproy.toString());
    form.append("titulo", this.titulo);
    form.append("monto", this.monto.toString());
    form.append("fecha", this.fecha);

    const url = this.editMode
        ? `${ConnectA.api}/pago-proyectos/${this.editingId}`
        : `${ConnectA.api}/pago-proyectos/`;

    const method = this.editMode ? "PUT" : "POST";

    await fetch(url, { method, body: form });

    this.closeModal();
    await this.loadPagos();
    await this.loadDeuda();
}


    getMontoOriginal(): number {
        const pago = this.pagos.find(p => p.id === this.editingId);
        return pago ? pago.monto : 0;
    }



    // =====================================
    // ELIMINAR
    // =====================================
    async deletePago(id: number | undefined) {
        if (!id) return;
        if (!confirm("¿Desea eliminar este pago?")) return;

        await fetch(`${ConnectA.api}/pago-proyectos/${id}`, {
            method: "DELETE"
        });

        await this.loadPagos();
        await this.loadDeuda();
    }

    isFechaInvalida(): boolean {
        if (!this.fecha) return false;

        const fechaPago = new Date(this.fecha);
        const hoy = new Date();

        // Normalizar ambas fechas a medianoche
        fechaPago.setHours(0, 0, 0, 0);
        hoy.setHours(0, 0, 0, 0);

        // La fecha es inválida SOLO si es estrictamente menor que hoy
        return fechaPago < hoy;
    }
}
