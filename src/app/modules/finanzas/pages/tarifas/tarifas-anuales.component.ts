import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tarifa } from '../../../../models/tarifa.model';
import { TarifaService } from '../../../../services/tarifa.service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-tarifas-anuales',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, DialogModule, FormsModule, InputTextModule, InputNumberModule],
  template: `
    <div class="card">
      <div class="flex justify-content-between align-items-center mb-4">
        <h2>Tarifas Anuales</h2>
        <button pButton label="Nueva Tarifa" icon="pi pi-plus" (click)="showDialog()"></button>
      </div>

      <p-table [value]="tarifas()">
        <ng-template pTemplate="header">
          <tr>
            <th>Concepto</th>
            <th>Año</th>
            <th>Monto Base</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-tarifa>
          <tr>
            <td>{{tarifa.nombre}}</td>
            <td>{{tarifa.anio}}</td>
            <td>{{tarifa.montoBase | currency:'PEN'}}</td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog header="Nueva Tarifa" [(visible)]="displayDialog" [modal]="true" [style]="{width: '400px'}">
        <div class="flex flex-column gap-3">
            <div class="flex flex-column gap-2">
                <label>Nombre / Concepto</label>
                <input pInputText [(ngModel)]="nuevaTarifa.nombre" />
            </div>
            <div class="flex flex-column gap-2">
                <label>Año</label>
                <p-inputNumber [(ngModel)]="nuevaTarifa.anio" [useGrouping]="false"></p-inputNumber>
            </div>
            <div class="flex flex-column gap-2">
                <label>Monto Base</label>
                <p-inputNumber [(ngModel)]="nuevaTarifa.montoBase" mode="currency" currency="PEN" locale="es-PE"></p-inputNumber>
            </div>
        </div>
        <ng-template pTemplate="footer">
            <button pButton label="Cancelar" class="p-button-text" (click)="displayDialog = false"></button>
            <button pButton label="Guardar" (click)="guardarTarifa()"></button>
        </ng-template>
    </p-dialog>
  `
})
export class TarifasAnualesComponent implements OnInit {
  tarifas = signal<Tarifa[]>([]);
  displayDialog = false;

  nuevaTarifa: any = {
      nombre: '',
      anio: new Date().getFullYear(),
      montoBase: 0
  };

  constructor(private tarifaService: TarifaService) {}

  ngOnInit() {
      this.cargarTarifas();
  }

  cargarTarifas() {
      this.tarifaService.getTarifas().subscribe(data => this.tarifas.set(data));
  }

  showDialog() {
      this.nuevaTarifa = { nombre: '', anio: new Date().getFullYear(), montoBase: 0 };
      this.displayDialog = true;
  }

  guardarTarifa() {
      this.tarifaService.addTarifa(this.nuevaTarifa).subscribe(() => {
          this.cargarTarifas();
          this.displayDialog = false;
      });
  }
}
