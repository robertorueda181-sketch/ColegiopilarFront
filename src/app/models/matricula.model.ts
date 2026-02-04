import { Estudiante } from './estudiante.model';

export interface Matricula {
    id: string; // GUID
    estudianteId: number;
    periodoId: number;
    grado: number;
    seccion: string;
    nivel: string;
    fechaMatricula: string | Date;
    estado: string;
    student?: Estudiante;
}
