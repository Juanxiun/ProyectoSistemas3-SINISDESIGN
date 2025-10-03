export default interface DocumentoModel{
    id?: number;
    fase: number;
    nombre: string;
    tipo: string;
    documento: string | File;
    fecha: string;
}