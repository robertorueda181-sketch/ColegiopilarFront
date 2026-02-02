import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface PeriodoEscolar {
  id: string;        // UUID from API
  anio: number;      // Computed property
  nombre: string;    // Computed property
  fechaInicio: Date; 
  fechaFin: Date;
  activo: boolean;
  estado: 'Planificacion' | 'Abierto' | 'Cerrado'; // Computed property
}

interface PeriodoResponse {
  id: string;
  fechaInicio: string; 
  fechaFin: string;
  activo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PeriodoService {
  private http = inject(HttpClient);
  private apiUrl = 'https://localhost:53676/periodosescolares';

  periodos = signal<PeriodoEscolar[]>([]);

  constructor() {
    this.loadPeriodos();
  }

  loadPeriodos() {
    this.http.get<PeriodoResponse[]>(this.apiUrl).pipe(
      map(responses => responses.map(r => this.mapToModel(r))),
      tap(data => this.periodos.set(data)),
      catchError(err => {
        console.error('Error fetching periodos', err);
        return of([]);
      })
    ).subscribe();
  }

  private mapToModel(res: PeriodoResponse): PeriodoEscolar {
    console.log(res)
    const inicio = new Date(res.fechaInicio);
    const fin = new Date(res.fechaFin);
    const anio = inicio.getFullYear();

    let estado: 'Planificacion' | 'Abierto' | 'Cerrado' = 'Cerrado';
    if (res.activo) {
      estado = 'Abierto';
    } else {
      const today = new Date();
      if (inicio > today) {
        estado = 'Planificacion';
      }
    }

    return {
      id: res.id,
      anio: anio,
      nombre: `Año Académico ${anio}`,
      fechaInicio: inicio,
      fechaFin: fin,
      activo: res.activo,
      estado: estado
    };
  }

  abrirNuevoPeriodo(data:any) {
    const payload = {
      anio: data.Anio,
      nombre: data.Nombre,
      fechaInicio: this.formatDate(data.fechaInicio),
      fechaFin: this.formatDate(data.fechaFin),
      activo: false
    };

    this.http.post(this.apiUrl, payload).pipe(
      tap(() => this.loadPeriodos())
    ).subscribe();
  }

  activarPeriodo(id: string) {
    const periodo = this.periodos().find(p => p.id === id);
    if (!periodo) return;

    const payload = {
      id: periodo.id,
      anio: periodo.anio,
      fechaInicio: this.formatDate(periodo.fechaInicio),
      fechaFin: this.formatDate(periodo.fechaFin),
      activo: true
    };

    this.http.put(`${this.apiUrl}/${id}`, payload).pipe(
      tap(() => this.loadPeriodos())
    ).subscribe();
  }

  private formatDate(date: Date): string {
    // Ensures YYYY-MM-DD
    return date.toISOString().split('T')[0]; 
  }
}
