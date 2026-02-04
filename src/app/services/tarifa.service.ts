import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tarifa } from '../models/tarifa.model';
import { AppConfigService } from './app-config.service';

@Injectable({
  providedIn: 'root'
})
export class TarifaService {
  private http = inject(HttpClient);
  private configService = inject(AppConfigService);
  private apiUrl = `${this.configService.apiBaseUrl}/tarifas`;

  constructor() { }

  getTarifas(): Observable<Tarifa[]> {
    return this.http.get<Tarifa[]>(this.apiUrl);
  }

  addTarifa(tarifa: Tarifa): Observable<Tarifa> {
    return this.http.post<Tarifa>(this.apiUrl, tarifa);
  }
}
