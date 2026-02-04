import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { EstudianteService } from '../../../../services/estudiante.service';
import { TarifaService } from '../../../../services/tarifa.service';
import { ReglaService } from '../../../../services/regla.service';
import { PeriodoService, PeriodoEscolar } from '../../../periodo/services/periodo.service';
import { Estudiante } from '../../../../models/estudiante.model';
import { Tarifa } from '../../../../models/tarifa.model';
import { Regla } from '../../../../models/regla.model';

import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { PanelModule } from 'primeng/panel';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-calculo-cuotas',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule, CardModule, PanelModule, DividerModule, TagModule],
  template: `
    <div class="card">
      <h2>Simulador de Tarifas por Estudiante</h2>
      
      <div class="grid">
        <div class="col-12">
            <div class="flex flex-column gap-2 mb-4">
                <label class="font-bold">Periodo Académico</label>
                <p-select [options]="periodosOptions()" [(ngModel)]="selectedPeriodo" optionLabel="label" optionValue="value" placeholder="Seleccione un periodo" styleClass="w-full"></p-select>
            </div>
        </div>
        <div class="col-12 md:col-6">
            <div class="flex flex-column gap-2 mb-4">
                <label class="font-bold">Seleccionar Estudiante</label>
                <p-select [options]="estudiantes()" [(ngModel)]="selectedStudent" optionLabel="label" placeholder="Buscar estudiante" [filter]="true"></p-select>
            </div>
        </div>
        <div class="col-12 md:col-6">
            <div class="flex flex-column gap-2 mb-4">
                <label class="font-bold">Seleccionar Tarifa Base</label>
                <p-select [options]="tarifas()" [(ngModel)]="selectedTarifa" optionLabel="nombre" placeholder="Seleccione concepto"></p-select>
            </div>
        </div>
      </div>

      <div *ngIf="selectedStudent && selectedTarifa" class="surface-card p-4 shadow-2 border-round">
        <div class="text-xl font-medium mb-3">Detalle del Cálculo</div>
        
        <div class="flex justify-content-between mb-3">
            <span>Monto Base ({{selectedTarifa.nombre}})</span>
            <span class="font-bold text-900">{{selectedTarifa.monto | currency:'PEN'}}</span>
        </div>

        <p-divider></p-divider>
        
        <div class="mb-3">
            <div class="text-lg font-medium mb-2">Reglas Aplicables</div>
            <div *ngIf="appliedRules().length === 0" class="text-gray-500 font-italic">No hay reglas aplicables o activas.</div>
            
            <div *ngFor="let rule of appliedRules()" class="flex justify-content-between align-items-center mb-2 p-2 border-round surface-50">
                <div class="flex align-items-center gap-2">
                    <i class="pi pi-tag text-blue-500"></i>
                    <span>{{rule.nombre}}</span>
                    <p-tag [value]="'Prioridad: ' + rule.prioridad" severity="info" class="text-xs"></p-tag>
                </div>
                <span class="text-green-600 font-medium">
                    - {{ rule.tipoDescuento === 'SOLES' ? (rule.valor | currency:'PEN') : (rule.valor + '%') }}
                </span>
            </div>
        </div>

        <p-divider></p-divider>

        <div class="flex justify-content-between align-items-center text-xl mt-3">
            <span class="font-bold">Total a Pagar</span>
            <span class="font-bold text-primary text-2xl">{{finalAmount() | currency:'PEN'}}</span>
        </div>
      </div>
    </div>
  `
})
export class CalculoCuotasComponent implements OnInit {
  private periodoService = inject(PeriodoService);
  
  estudiantes = signal<any[]>([]);
  tarifas = signal<Tarifa[]>([]);
  reglas = signal<Regla[]>([]);
  periodos = this.periodoService.periodos;

  periodosOptions = computed(() => {
    return this.periodos().map(p => ({
        label: p.nombre,
        value: p
    }));
  });

  selectedStudent: any | null = null;
  selectedTarifa: Tarifa | null = null;
  selectedPeriodo: any | null = null;

  constructor(
      private estudianteService: EstudianteService,
      private tarifaService: TarifaService,
      private reglaService: ReglaService
  ) {}

  ngOnInit() {
      this.cargarDatos();
      this.periodoService.loadPeriodos();
  }

  cargarDatos() {
      this.estudianteService.getEstudiantes().subscribe(data => {
          this.estudiantes.set(data.map(e => ({
              label: `${e.nombres} ${e.apellidos}`,
              value: e
          })));
      });

      this.tarifaService.getTarifas().subscribe(data => this.tarifas.set(data));
      this.reglaService.getReglas().subscribe(data => this.reglas.set(data));
  }

  // Logic to determine active rules for the student
  // In a real app, this might check student attributes against rule conditions.
  // Here we assume ALL active rules apply to demonstrate the calculation, 
  // or we could simulate random applicability.
  // Let's assume 'Hermanos' applies if last name matches another student (too complex for now),
  // So we will just list all ACTIVE rules sorted by priority.
  appliedRules = computed(() => {
      if (!this.selectedStudent || !this.selectedTarifa) return [];
      
      const reglasActivas = this.reglas().filter(r => r.activa);
      
      // Sort by Priority (Assuming Lower number = Higher Priority, or logic defined by backend)
      // Usually simple discount sum isn't affected by order, but if percentages stack, it matters.
      // Let's sort by priority DESC (Higher First)
      return reglasActivas.sort((a, b) => b.prioridad - a.prioridad);
  });

  finalAmount = computed(() => {
      if (!this.selectedTarifa) return 0;
      let total = this.selectedTarifa.monto;

      this.appliedRules().forEach(rule => {
          if (rule.tipoDescuento === 'SOLES') {
              total -= rule.valor;
          } else if (rule.tipoDescuento === 'PORCENTAJE') {
              const discount = total * (rule.valor / 100);
              total -= discount;
          }
      });

      return Math.max(0, total); // Ensure no negative payment
  });
}
