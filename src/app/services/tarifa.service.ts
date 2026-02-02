import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Tarifa } from '../models/tarifa.model';

@Injectable({
  providedIn: 'root'
})
export class TarifaService {
  private tarifas: Tarifa[] = [
    { id: 1, nombre: 'Matrícula 2026', anio: 2026, montoBase: 400 },
    { id: 2, nombre: 'Mensualidad Marzo 2026', anio: 2026, montoBase: 550 },
    { id: 3, nombre: 'Mensualidad Abril 2026', anio: 2026, montoBase: 550 },
  ];

  constructor() { }

  getTarifas(): Observable<Tarifa[]> {
    return of(this.tarifas);
  }

  addTarifa(tarifa: Tarifa): Observable<Tarifa> {
    tarifa.id = this.tarifas.length + 1;
    this.tarifas.push(tarifa);
    return of(tarifa);
  }
}
