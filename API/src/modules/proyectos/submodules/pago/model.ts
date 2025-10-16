export default interface PagoModel{
    id?: number;
    proy: number;
    titulo: string;
    monto: number;
    fecha: string;
}

export interface DeudaModel{
    costo: number;
    pago: number;
    deuda: number;
}