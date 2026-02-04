export interface Tarifa {
    id?: string;
    nombre: string;
    monto: number;
    periodoEscolarId: string;
    anio?: number; // Propiedad auxiliar para la UI, si el backend no la devuelve habrá que mapearla
}
