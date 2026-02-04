import { Component, OnInit, signal, effect, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GrupoRegla, GrupoReglaListDTO } from '../../../../models/grupo-regla.model';
import { ReglaService } from '../../../../services/regla.service';
import { PeriodoService } from '../../../periodo/services/periodo.service';
import { MatriculaService } from '../../../../services/matricula.service';
import { Matricula } from '../../../../models/matricula.model';
import { Regla } from '../../../../models/regla.model';
import { PrimeNG } from 'primeng/config';

// PrimeNG Imports
import { TableModule, Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TagModule } from 'primeng/tag';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-grupo-regla',
  standalone: true,
  imports: [
      CommonModule, 
      FormsModule, 
      TableModule, 
      ButtonModule, 
      InputTextModule, 
      SelectModule,
      ToastModule,
      TagModule,
      MultiSelectModule
  ],
  providers: [MessageService],
  template: `
    <div class="card">
      <p-toast></p-toast>
      
      <!-- VIEW MODE: LIST -->
      <div *ngIf="viewMode() === 'list'">
          <div class="flex justify-content-between align-items-center mb-4">
              <h2>Grupos de Reglas Asignados</h2>
              <button pButton label="Agregar Grupo" icon="pi pi-plus" (click)="switchToCreate()"></button>
          </div>

          <p-table 
            #dtList
            [value]="gruposRegla()" 
            [tableStyle]="{'min-width': '50rem'}"
            [paginator]="true"
            [rows]="10"
            [globalFilterFields]="['grupoNombre', 'reglaNombre', 'reglaTipo', 'searchMeta']">
              
              <ng-template pTemplate="caption">
                  <div class="flex justify-content-between align-items-center">
                    <span>Lista de Grupos</span>
                    <span class="p-input-icon-left">
                        <i class="pi pi-search"></i>
                        <input pInputText type="text" (input)="onGlobalFilter(dtList, $event)" placeholder="Buscar grupo, regla..." />
                    </span>
                  </div>
              </ng-template>

              <ng-template pTemplate="header">
                  <tr>
                      <th>Grupo</th>
                      <th>Regla</th>
                      <th>Tipo</th>
                      <th>Matriculados</th>
                  </tr>
              </ng-template>
              <ng-template pTemplate="body" let-grupo>
                  <tr>
                      <td>{{grupo.grupoNombre || 'Sin Nombre'}}</td>
                      <td>{{grupo.reglaNombre}}</td>
                      <td><p-tag [value]="grupo.reglaTipo" severity="info"></p-tag></td>
                      <td>
                        <div *ngFor="let m of grupo.matriculados">
                            - [{{ m.dni }}] {{ m.nombres }} {{ m.apellidos }}
                        </div>
                        <span *ngIf="!grupo.matriculados || grupo.matriculados.length === 0" class="text-500 font-italic">No hay estudiantes</span>
                      </td>
                  </tr>
              </ng-template>
              <ng-template pTemplate="emptymessage">
                  <tr>
                      <td colspan="4">No hay grupos de reglas registrados via endpoint.</td>
                  </tr>
              </ng-template>
          </p-table>
      </div>

      <!-- VIEW MODE: FORM -->
      <div *ngIf="viewMode() === 'form'">
          <div class="flex align-items-center mb-4 gap-3">
              <button pButton icon="pi pi-arrow-left" class="p-button-text p-button-rounded" (click)="viewMode.set('list')"></button>
              <h2 class="m-0">Asignacion de Nuevo Grupo</h2>
          </div>
          
          <div class="formgrid grid">
              <div class="field col-12 md:col-4">
                  <label for="periodo">Periodo</label>
                  <p-select 
                      id="periodo"
                      [options]="periodoService.periodos()" 
                      [(ngModel)]="selectedPeriodoId" 
                      optionLabel="nombre" 
                      optionValue="id"
                      (onChange)="onPeriodoChange()"
                      placeholder="Seleccione Periodo"
                      [style]="{'width': '100%'}">
                  </p-select>
              </div>
              <div class="field col-12 md:col-4">
                  <label for="regla">Regla</label>
                  <p-select 
                      id="regla"
                      [options]="reglas()" 
                      [(ngModel)]="selectedReglaId" 
                      optionLabel="nombre" 
                      optionValue="id"
                      placeholder="Seleccione Regla"
                      [style]="{'width': '100%'}">
                  </p-select>
              </div>
               <div class="field col-12 md:col-4">
                  <label for="observacion">Observación</label>
                  <input pInputText id="observacion" [(ngModel)]="observacion" class="w-full" />
              </div>
          </div>

          <div class="mt-4">
              <h3>Seleccionar Estudiantes</h3>
              <p-multiSelect 
                  [options]="matriculas()" 
                  [(ngModel)]="selectedMatriculas" 
                  optionLabel="displayName" 
                  placeholder="Seleccione estudiantes..."
                  [filter]="true"
                  filterBy="displayName,student.dni,student.nombres,student.apellidos"
                  [style]="{'width': '100%'}"
                  display="chip">
                  <ng-template let-matricula pTemplate="item">
                      <div class="flex align-items-center gap-2">
                          <div>
                              <span class="font-bold">[{{matricula.student?.dni}}]</span>
                              {{matricula.student?.apellidos}} {{matricula.student?.nombres}}
                              <span class="text-500 text-sm">({{matricula.grado}}° {{matricula.seccion}})</span>
                          </div>
                      </div>
                  </ng-template>
              </p-multiSelect>
          </div>

          <div class="flex justify-content-end mt-4">
              <button pButton label="Guardar Grupo de Regla" icon="pi pi-save" (click)="guardar()" [disabled]="!isValid()"></button>
          </div>
      </div>
    </div>
  `
})
export class GrupoReglaComponent implements OnInit {
  viewMode = signal<'list' | 'form'>('list');
  
  // List Mode Data
  gruposRegla = signal<GrupoReglaListDTO[]>([]);
  
  // Form Mode Data
  reglas = signal<Regla[]>([]);
  matriculas = signal<any[]>([]); // Changed to any[] to support dynamic property displayName
  loading = signal<boolean>(false);

  selectedPeriodoId: string | number | null = null;
  selectedReglaId: string | number | null = null;
  observacion: string = '';
  selectedMatriculas: any[] = []; // Changed to any[]

  constructor(
      public periodoService: PeriodoService,
      private reglaService: ReglaService,
      private matriculaService: MatriculaService,
      private messageService: MessageService
  ) {
       effect(() => {
          // Auto select active period when entering form mode or when periods load
          if (this.viewMode() === 'form') {
               const periodos = this.periodoService.periodos();
               if (periodos.length > 0 && !this.selectedPeriodoId) {
                   const activePeriod = periodos.find(p => p.activo);
                   if (activePeriod) {
                       this.selectedPeriodoId = activePeriod.id;
                   } else {
                       this.selectedPeriodoId = periodos[0].id;
                   }
                   setTimeout(() => this.loadMatriculas(), 0);
               }
          }
      });
  }

  ngOnInit() {
      this.loadGrupos();
      this.reglaService.getReglas().subscribe(data => this.reglas.set(data));
  }

  loadGrupos() {
      this.reglaService.getGruposReglaWithMatriculas().subscribe({
          next: (data) => {
             // Preprocess for filtering
             const processed = data.map(g => ({
                 ...g,
                 searchMeta: g.matriculados.map(m => `${m.dni} ${m.nombres} ${m.apellidos}`).join(' ')
             }));
             this.gruposRegla.set(processed);
          },
          error: (err) => console.error('Error loading grupos', err)
      });
  }

  switchToCreate() {
      this.viewMode.set('form');
      this.selectedMatriculas = [];
      this.observacion = '';
      this.selectedReglaId = null;
      // Trigger effect to select period if needed
  }

  loadMatriculas() {
      if (this.selectedPeriodoId) {
          this.loading.set(true);
          const periodos = this.periodoService.periodos();
          const selectedPeriod = periodos.find(p => p.id === this.selectedPeriodoId);
          
          if (selectedPeriod) {
               // Use 'anio' for matricula fetching assuming endpoint needs it
               this.matriculaService.getMatriculas(selectedPeriod.anio).subscribe({
                  next: (data) => {
                      const processed = data.map(m => ({
                          ...m,
                          displayName: `[${m.student?.dni}] ${m.student?.apellidos} ${m.student?.nombres}`
                      }));
                      this.matriculas.set(processed);
                      this.loading.set(false);
                  },
                  error: () => this.loading.set(false)
              });
          }
      }
  }

  onPeriodoChange() {
      this.selectedMatriculas = [];
      this.loadMatriculas();
  }
  
  onGlobalFilter(table: Table, event: Event) {
      table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  isValid(): boolean {
      return !!this.selectedPeriodoId && !!this.selectedReglaId && this.selectedMatriculas.length > 0;
  }

  guardar() {
      if (!this.isValid()) return;

      const payload: GrupoRegla = {
          // Backend might treat 0 as new
          id: 0, 
          reglaId: this.selectedReglaId!,
          periodoId: this.selectedPeriodoId!, // Using the ID (UUID/String)
          observacion: this.observacion,
          matriculaIds: this.selectedMatriculas.map(m => m.id)
      };

      this.reglaService.upsertGrupoRegla(payload).subscribe({
          next: (res) => {
              this.messageService.add({severity:'success', summary:'Éxito', detail:'Grupo de regla guardado'});
              this.viewMode.set('list');
              this.loadGrupos(); // Refresh list
          },
          error: (err) => {
              this.messageService.add({severity:'error', summary:'Error', detail:'No se pudo guardar'});
              console.error(err);
          }
      });
  }
}
