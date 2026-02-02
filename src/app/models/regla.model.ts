export interface Regla {
    id: string;
    nombre: string;
    tipoDescuento: 'SOLES' | 'PORCENTAJE';
    valor: number;
    prioridad: number;
    activa: boolean;
}
