export interface Regla {
    id?: string;
    nombre: string;
    tipoDescuento: 'SOLES' | 'PORCENTAJE';
    valor: number;
    prioridad: number;
    tipoTarifaId?: number;
    tipoTarifaDescripcion?: string;
    activa: boolean;
    esEscalonado?: boolean;
}
