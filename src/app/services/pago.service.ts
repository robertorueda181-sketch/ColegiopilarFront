import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Pago } from '../models/pago.model';

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  // Mock data
  private pagos: Pago[] = [
    
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
