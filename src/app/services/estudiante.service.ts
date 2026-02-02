import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Estudiante } from '../models/estudiante.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EstudianteService {
  private apiUrl = 'https://localhost:53676/estudiantes';

  constructor(private http: HttpClient) { }

  getEstudiantes(): Observable<Estudiante[]> {
    return this.http.get<Estudiante[]>(this.apiUrl).pipe(
      map(response => {
        return response.map(estudiante => ({
          ...estudiante,
          fechaNacimiento: new Date(estudiante.fechaNacimiento)
        }));
      })
    );
  }
}
