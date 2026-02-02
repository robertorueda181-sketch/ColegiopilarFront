import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Pago } from '../models/pago.model';

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  // Mock data
  private pagos: Pago[] = [
    {
      id: 1,
      estudianteId: 1,
      nombreEstudiante: 'Juan Perez',
      monto: 150.00,
      tipo: 'PARCIAL',
      metodo: 'YAPE',
      fecha: new Date(),
      estado: 'VERIFICADO',
      archivoUrl: 'assets/mock-yape.png'
    },
    {
        id: 2,
        estudianteId: 2,
        nombreEstudiante: 'Maria Garcia',
        monto: 300.00,
        tipo: 'TOTAL',
        metodo: 'TRANSFERENCIA',
        fecha: new Date(),
        estado: 'PENDIENTE',
        archivoUrl: 'assets/comprobante.pdf'
      }
  ];

  constructor() { }

  getPagos(): Observable<Pago[]> {
    return of(this.pagos).pipe(delay(500));
  }

  addPago(pago: Pago): Observable<Pago> {
    pago.id = this.pagos.length + 1;
    this.pagos.push(pago);
    return of(pago).pipe(delay(500));
  }
}
