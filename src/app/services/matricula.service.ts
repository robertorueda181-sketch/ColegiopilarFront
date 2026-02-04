import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Matricula } from '../models/matricula.model';
import { AppConfigService } from './app-config.service';

@Injectable({
  providedIn: 'root'
})
export class MatriculaService {
  private apiUrl = '';

  constructor(private http: HttpClient, private configService: AppConfigService) {
      this.apiUrl = `${this.configService.apiBaseUrl}/matriculas`;
  }

  getMatriculas(periodoId?: number): Observable<Matricula[]> {
    let params = new HttpParams();
    if (periodoId) {
      params = params.set('periodoId', periodoId.toString());
    }

    return this.http.get<Matricula[]>(this.apiUrl, { params }).pipe(
      map(response => {
        return response.map(matricula => ({
          ...matricula,
          fechaMatricula: new Date(matricula.fechaMatricula),
          student: matricula.student ? {
            ...matricula.student,
            fechaNacimiento: new Date(matricula.student.fechaNacimiento)
          } : undefined
        }));
      })
    );
  }
}
