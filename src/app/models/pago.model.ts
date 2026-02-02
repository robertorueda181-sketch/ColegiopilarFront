export interface Pago {
    id: number;
    estudianteId: number;
    nombreEstudiante: string; // Helper for display
    monto: number;
    tipo: 'PARCIAL' | 'TOTAL';
    metodo: 'YAPE' | 'EFECTIVO' | 'TRANSFERENCIA';
    archivoUrl?: string; // URL for PDF or Image
    archivoTipo?: 'boucher' | 'pdf';
    fecha: Date;
    estado: 'PENDIENTE' | 'VERIFICADO';
}
