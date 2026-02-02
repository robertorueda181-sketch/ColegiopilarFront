import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { PeriodoService, PeriodoEscolar } from '../../services/periodo.service';

@Component({
  selector: 'app-gestion-periodo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    DatePickerModule,
    TagModule,
    CardModule
  ],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">Periodos Escolares</h1>
          <p class="text-gray-600">Gestión de aperturas y cierres de años académicos</p>
        </div>
        <button pButton label="Abrir Nuevo Periodo" icon="pi pi-plus" (click)="showDialog = true"></button>
      </div>

      <div class="grid grid-cols-1 mb-6">
        <p-card header="Periodo Activo" styleClass="shadow-sm">
          <div *ngIf="periodoActivo() as activo; else noActivo">
            <div class="flex items-center gap-4">
              <i class="pi pi-calendar-clock text-4xl text-blue-500"></i>
              <div>
                <h3 class="text-xl font-bold">{{ activo.nombre }}</h3>
                <p class="text-gray-500">
                  {{ activo.fechaInicio | date:'dd/MM/yyyy' }} - {{ activo.fechaFin | date:'dd/MM/yyyy' }}
                </p>
                <p-tag [value]="activo.estado" severity="success"></p-tag>
              </div>
            </div>
          </div>
          <ng-template #noActivo>
            <p class="text-red-500 italic">No hay un periodo escolar activo actualmente.</p>
          </ng-template>
        </p-card>
      </div>

      <p-table [value]="service.periodos()" styleClass="p-datatable-sm shadow-sm rounded-lg overflow-hidden border">
        <ng-template pTemplate="header">
          <tr class="bg-gray-50">
            <th>Año</th>
            <th>Nombre</th>
            <th>Fechas</th>
            <th>Estado</th>
            <th class="text-right">Acciones</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-p>
          <tr>
            <td class="font-bold">{{ p.anio }}</td>
            <td>{{ p.nombre }}</td>
            <td>
              {{ p.fechaInicio | date:'shortDate' }} - {{ p.fechaFin | date:'shortDate' }}
            </td>
            <td>
              <p-tag [value]="p.estado" [severity]="getSeverity(p.estado)"></p-tag>
              <p-tag *ngIf="p.activo" value="ACTIVO" severity="info" class="ml-2"></p-tag>
            </td>
            <td class="text-right">
              <button 
                *ngIf="!p.activo" 
                pButton 
                label="Activar" 
                class="p-button-text p-button-sm" 
                icon="pi pi-check-circle"
                (click)="activar(p)">
              </button>
            </td>
          </tr>
        </ng-template>
      </p-table>

      <!-- Modal Crear Nuevo -->
      <p-dialog [(visible)]="showDialog" header="Abrir Nuevo Periodo" [modal]="true" [style]="{width: '450px'}">
        <div class="flex flex-col gap-4 pt-4">
          <div class="flex flex-col gap-2">
            <label class="font-bold">Año</label>
            <input pInputText type="number" [(ngModel)]="nuevoAnio" placeholder="2026" />
          </div>
          <div class="flex flex-col gap-2">
            <label class="font-bold">Nombre</label>
            <input pInputText type="text" [(ngModel)]="nuevoNombre" placeholder="Año Académico 2026" />
          </div>
          <div class="flex flex-col gap-2">
            <label class="font-bold">Fecha Inicio</label>
            <p-datepicker [(ngModel)]="fechaInicio" dateFormat="dd/mm/yy" [showIcon]="true" appendTo="body"></p-datepicker>
          </div>
          <div class="flex flex-col gap-2">
            <label class="font-bold">Fecha Fin</label>
            <p-datepicker [(ngModel)]="fechaFin" dateFormat="dd/mm/yy" [showIcon]="true" appendTo="body"></p-datepicker>
          </div>
        </div>
        <ng-template pTemplate="footer">
          <button pButton label="Cancelar" class="p-button-text" (click)="showDialog = false"></button>
          <button pButton label="Guardar" (click)="guardar()"></button>
        </ng-template>
      </p-dialog>
    </div>
  `
})
export class GestionPeriodoComponent {
  service = inject(PeriodoService);
  
  showDialog = false;

  // Form fields
  nuevoAnio: number = new Date().getFullYear() + 1;
  nuevoNombre: string = `Año Académico ${new Date().getFullYear() + 1}`;
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;

  periodoActivo = computed(() => this.service.periodos().find(p => p.activo));

  getSeverity(estado: string): "success" | "info" | "warn" | "danger" | undefined {
    switch (estado) {
      case 'Abierto': return 'success';
      case 'Planificacion': return 'warn';
      case 'Cerrado': return 'danger';
      default: return 'info';
    }
  }

  guardar() {
    if (this.fechaInicio && this.fechaFin) {
      this.service.abrirNuevoPeriodo({
        Anio: this.nuevoAnio,
        Nombre: this.nuevoNombre,
        fechaInicio: this.fechaInicio,
        fechaFin: this.fechaFin
      });
      this.showDialog = false;
    }
  }

  activar(p: PeriodoEscolar) {
    this.service.activarPeriodo(p.id);
  }
}
