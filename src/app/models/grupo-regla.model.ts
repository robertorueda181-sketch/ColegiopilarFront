export interface GrupoRegla {
    id?: number;
    reglaId: string | number;
    periodoId: number | string;
    observacion: string;
    matriculaIds: string[];
}

export interface GrupoReglaMatriculado {
    matriculaId: string;
    estudianteId: number;
    dni: string;
    nombres: string;
    apellidos: string;
}

export interface GrupoReglaListDTO {
    grupoReglaId: number;
    grupoNombre: string;
    reglaNombre: string;
    reglaTipo: string;
    matriculados: GrupoReglaMatriculado[];
    searchMeta?: string;
}
