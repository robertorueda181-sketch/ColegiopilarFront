import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Regla } from '../models/regla.model';

@Injectable({
  providedIn: 'root'
})
export class ReglaService {
  private apiUrl = 'https://localhost:53676/reglas';

  // Mock data as fallback if API fails (since localhost might not be running)
  private mockReglas: Regla[] = [
    {
      id: "d40330c9-a728-46e2-9f59-187721a3e1b0",
      nombre: "Primos",
      tipoDescuento: "SOLES",
      valor: 5,
      prioridad: 2,
      activa: true
    },
    {
      id: "babfb4be-19eb-4d0e-8f96-1a8f9c2dd43a",
      nombre: "Hijo de Profesor",
      tipoDescuento: "SOLES",
      valor: 30,
      prioridad: 0,
      activa: true
    },
    {
      id: "3cfdf44a-8554-47d6-b7aa-46a0feba8881",
      nombre: "Hermanos",
      tipoDescuento: "SOLES",
      valor: 10,
      prioridad: 1,
      activa: true
    }
  ];

  constructor(private http: HttpClient) { }

  getReglas(): Observable<Regla[]> {
    return this.http.get<Regla[]>(this.apiUrl).pipe(
        catchError((error) => {
            console.warn('API Rules unreachable, using mock data', error);
            return of(this.mockReglas);
        })
    );
  }

  addRegla(regla: Regla): Observable<Regla> {
    // In a real scenario: return this.http.post<Regla>(this.apiUrl, regla);
    this.mockReglas.push({ ...regla, id: crypto.randomUUID() });
    return of(regla);
  }
}
