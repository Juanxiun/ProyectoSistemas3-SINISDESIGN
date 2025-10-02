export default interface DocumentoModel{
    id?: number;
    fase: number;
    nombre: string;
    documento: string | File;
    fecha: string;
}