import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Estudiante } from '../models/estudiante.model';
import { map } from 'rxjs/operators';
import { AppConfigService } from './app-config.service';

@Injectable({
  providedIn: 'root'
})
export class EstudianteService {
  private apiUrl = '';

  constructor(private http: HttpClient, private configService: AppConfigService) { 
      this.apiUrl = `${this.configService.apiBaseUrl}/estudiantes`;
  }

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
