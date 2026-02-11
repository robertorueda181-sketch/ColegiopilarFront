import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Regla } from '../models/regla.model';
import { GrupoRegla, GrupoReglaListDTO } from '../models/grupo-regla.model';
import { AppConfigService } from './app-config.service';

@Injectable({
  providedIn: 'root'
})
export class ReglaService {
  private apiUrl = '';
  private grupoReglaUrl = '';
  private grupoReglaListUrl = '';

  constructor(private http: HttpClient, private configService: AppConfigService) {
    this.apiUrl = `${this.configService.apiBaseUrl}/reglas`;
    this.grupoReglaUrl = `${this.configService.apiBaseUrl}/gruporegla`;
    this.grupoReglaListUrl = `${this.configService.apiBaseUrl}/gruporegla-with-matriculas`;
  }

  getReglas(): Observable<Regla[]> {
    return this.http.get<Regla[]>(this.apiUrl).pipe(
      catchError((error) => {
        console.warn('API Rules unreachable, using mock data', error);
        return of([]);
      })
    );
  }

  addRegla(regla: Regla): Observable<Regla> {
    return this.http.post<Regla>(this.apiUrl, regla);
  }

  updateRegla(id: number | string, regla: Regla): Observable<Regla> {
    return this.http.put<Regla>(`${this.apiUrl}/${id}`, regla);
  }

  deleteRegla(id: number | string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  upsertGrupoRegla(grupo: GrupoRegla): Observable<any> {
    return this.http.post(`${this.grupoReglaUrl}/upsert`, grupo);
  }

  getGrupoReglaById(id: number): Observable<GrupoRegla> {
    return this.http.get<GrupoRegla>(`${this.grupoReglaUrl}/${id}`);
  }

  deleteGrupoRegla(id: number): Observable<any> {
    return this.http.delete(`${this.grupoReglaUrl}/${id}`);
  }

  getGruposReglaWithMatriculas(): Observable<GrupoReglaListDTO[]> {
    return this.http.get<GrupoReglaListDTO[]>(this.grupoReglaListUrl);
  }
}
