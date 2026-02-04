import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tarifa } from '../../../../models/tarifa.model';
import { TarifaService } from '../../../../services/tarifa.service';
import { PeriodoService } from '../../../periodo/services/periodo.service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-tarifas-anuales',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, DialogModule, FormsModule, InputTextModule, InputNumberModule],
  template: `
    <div class="card">
      <div class="flex justify-content-between align-items-center mb-4">
        <h2>Tarifas Anuales</h2>
        <button pButton label="Generar Tarifas" icon="pi pi-plus" (click)="showDialog()"></button>
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
            <td>{{tarifa.monto | currency:'PEN'}}</td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog header="Generación de Tarifas" [(visible)]="displayDialog" [modal]="true" [style]="{width: '800px'}">
        <div class="flex flex-column gap-3">
            <div class="formgrid grid flex gap-3">
                <div class="field col flex flex-column gap-2">
                    <label>Año Académico</label>
                    <p-inputNumber [(ngModel)]="anioGeneracion" [useGrouping]="false" class="w-full"></p-inputNumber>
                </div>
                <div class="field col flex flex-column gap-2">
                    <label>Monto Matrícula</label>
                    <p-inputNumber [(ngModel)]="montoMatricula" mode="currency" currency="PEN" locale="es-PE" class="w-full"></p-inputNumber>
                </div>
                <div class="field col flex flex-column gap-2">
                    <label>Monto Mensualidad</label>
                    <p-inputNumber [(ngModel)]="montoMensualidad" mode="currency" currency="PEN" locale="es-PE" class="w-full"></p-inputNumber>
                </div>
                <div class="field col flex align-items-end">
                    <button pButton label="Generar Propuesta" icon="pi pi-cog" (click)="generarPropuesta()"></button>
                </div>
            </div>

            <div *ngIf="tarifasGeneradas.length > 0">
                <h3>Previsualización (Editar si es necesario)</h3>
                <p-table [value]="tarifasGeneradas" [scrollable]="true" scrollHeight="300px" styleClass="p-datatable-sm">
                    <ng-template pTemplate="header">
                        <tr>
                            <th>Concepto</th>
                            <th style="width: 150px">Monto</th>
                            <th style="width: 4rem"></th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-tarifa let-index="rowIndex">
                        <tr>
                            <td>
                                <input pInputText [(ngModel)]="tarifa.nombre" class="w-full" />
                            </td>
                            <td>
                                <p-inputNumber [(ngModel)]="tarifa.monto" mode="currency" currency="PEN" locale="es-PE" class="w-full"></p-inputNumber>
                            </td>
                            <td>
                                <button pButton icon="pi pi-trash" class="p-button-danger p-button-text p-button-sm" (click)="eliminarDePropuesta(index)"></button>
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </div>
        <ng-template pTemplate="footer">
            <button pButton label="Cancelar" class="p-button-text" (click)="displayDialog = false"></button>
            <button pButton label="Guardar Todo" (click)="guardarTarifas()" [disabled]="tarifasGeneradas.length === 0"></button>
        </ng-template>
    </p-dialog>
  `,
  styles: [`
    :host ::ng-deep .p-inputnumber { width: 100%; }
    :host ::ng-deep .p-inputnumber-input { width: 100%; }
  `]
})
export class TarifasAnualesComponent implements OnInit {
  tarifas = signal<Tarifa[]>([]);
  displayDialog = false;

  // Variables para la generación
  anioGeneracion: number = new Date().getFullYear();
  montoMatricula: number = 0;
  montoMensualidad: number = 0;
  
  // Lista temporal para previsualización
  tarifasGeneradas: Partial<Tarifa>[] = [];

  constructor(
      private tarifaService: TarifaService,
      private periodoService: PeriodoService
  ) {}

  ngOnInit() {
      this.cargarTarifas();
      // Asegurarse de cargar periodos si no están en el servicio
      this.periodoService.loadPeriodos(); 
  }

  cargarTarifas() {
      this.tarifaService.getTarifas().subscribe(data => this.tarifas.set(data));
  }

  showDialog() {
      this.anioGeneracion = new Date().getFullYear();
      this.montoMatricula = 0;
      this.montoMensualidad = 0;
      this.tarifasGeneradas = [];
      this.displayDialog = true;
  }

  generarPropuesta() {
      this.tarifasGeneradas = [];
      
      const periodos = this.periodoService.periodos();
      const periodoEncontrado = periodos.find(p => p.anio === this.anioGeneracion);

      if (!periodoEncontrado) {
          alert(`No se encontró un periodo escolar registrado para el año ${this.anioGeneracion}. Por favor registre el periodo primero.`);
          return;
      }

      // 1. Agregar Matrícula
      this.tarifasGeneradas.push({
          nombre: `Matrícula ${this.anioGeneracion}`,
          anio: this.anioGeneracion,
          monto: this.montoMatricula,
          periodoEscolarId: periodoEncontrado.id
      });

      // 2. Agregar Mensualidades de Marzo a Diciembre
      const meses = ['Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      
      meses.forEach(mes => {
          this.tarifasGeneradas.push({
              nombre: `Mensualidad ${mes} ${this.anioGeneracion}`,
              anio: this.anioGeneracion,
              monto: this.montoMensualidad,
              periodoEscolarId: periodoEncontrado.id
          });
      });
  }

  eliminarDePropuesta(index: number) {
      this.tarifasGeneradas.splice(index, 1);
  }

  guardarTarifas() {
      if (this.tarifasGeneradas.length === 0) return;

      const peticiones = this.tarifasGeneradas.map(t => this.tarifaService.addTarifa(t as Tarifa));
      
      forkJoin(peticiones).subscribe({
          next: () => {
              this.cargarTarifas();
              this.displayDialog = false;
              this.tarifasGeneradas = [];
          },
          error: (err) => {
              console.error('Error al guardar tarifas', err);
          }
      });
  }
}
