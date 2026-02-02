export interface Estudiante {
    id: number;
    dni: string;
    nombres: string;
    apellidos: string;
    fechaNacimiento: string | Date;
    grado: string;
    seccion: string;
}
