export default interface HistorialPago {
  id?: number;
  accion: string;
  id_pago: number | null;
  proy: number | null;

  titulo_old?: string | null;
  monto_old?: number | null;
  fecha_old?: string | null;

  titulo_new?: string | null;
  monto_new?: number | null;
  fecha_new?: string | null;

  fecha_movimiento: string;
}
