export interface Tarifa {
    id?: string;
    nombre: string;
    monto: number;
    periodoEscolarId: string;
    anio?: number; // Propiedad auxiliar para la UI, si el backend no la devuelve habrá que mapearla
    order?: number; // Orden de la tarifa
    tipoTarifaId?: number;
    tipoTarifa?: { id: number; nombre: string; descripcion?: string };
}
export interface TarifaList {
    id?: string;
    descripcion: string;
    monto: number;
    anioDelPeriodo: string;// Propiedad auxiliar para la UI, si el backend no la devuelve habrá que mapearla
    order?: number; // Orden de la tarifa
    tipoTarifaDescripcion?: string;
}
