import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tarifa, TarifaList } from '../models/tarifa.model';
import { AppConfigService } from './app-config.service';

@Injectable({
  providedIn: 'root'
})
export class TarifaService {
  private http = inject(HttpClient);
  private configService = inject(AppConfigService);
  private apiUrl = `${this.configService.apiBaseUrl}/tarifas`;

  constructor() { }

  getTarifas(): Observable<TarifaList[]> {
    return this.http.get<TarifaList[]>(this.apiUrl);
  }

  getTiposTarifa(): Observable<any[]> {
    return this.http.get<any[]>(`${this.configService.apiBaseUrl}/tipos-tarifa`);
  }

  addTarifa(tarifa: Tarifa): Observable<Tarifa> {
    return this.http.post<Tarifa>(this.apiUrl, tarifa);
  }
}
