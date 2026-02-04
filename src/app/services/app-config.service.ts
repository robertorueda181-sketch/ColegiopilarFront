import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  private config: any;

  constructor(private http: HttpClient) {}

  loadConfig() {
    return firstValueFrom(this.http.get('/config.json'))
      .then(config => {
        this.config = config;
      })
      .catch(err => {
        console.error('Could not load configuration', err);
      });
  }

  get apiBaseUrl(): string {
    return this.config?.apiBaseUrl || '';
  }
}
