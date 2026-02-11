import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tarifa, TarifaList } from '../../../../models/tarifa.model';
import { TarifaService } from '../../../../services/tarifa.service';
import { PeriodoService, PeriodoEscolar } from '../../../periodo/services/periodo.service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { FieldsetModule } from 'primeng/fieldset'; // Added for p-fieldset
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-tarifas-anuales',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, DialogModule, FormsModule, InputTextModule, InputNumberModule, SelectModule, FieldsetModule],
    template: `
    <div class="card">
      <div class="flex justify-content-between align-items-center mb-4">
        <h2>Tarifas Anuales</h2>
        <button pButton label="Generar Tarifas" icon="pi pi-plus" (click)="showDialog()"></button>
      </div>

      <p-table [value]="tarifas()">
        <ng-template pTemplate="header">
          <tr>
            <th>Order</th>
            <th>Concepto</th>
            <th>Tipo</th>
            <th>Año</th>
            <th>Monto Base</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-tarifa>
          <tr>
            <td>{{tarifa.order}}</td>
            <td>{{tarifa.descripcion}}</td>
            <td><span class="p-badge p-badge-info">{{tarifa.tipoTarifaDescripcion}}</span></td>
            <td>{{tarifa.anioDelPeriodo}}</td>
            <td>{{tarifa.monto | currency:'PEN'}}</td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog header="Gestión de Tarifas" [(visible)]="displayDialog" [modal]="true" [style]="{width: '900px'}">
        <div class="flex flex-column gap-4">
            <!-- Sección de Configuración General -->
             <div class="flex flex-column gap-2">
                <label class="font-bold">Período Escolar</label>
                <p-select [(ngModel)]="periodoSeleccionado" [options]="periodos()" optionLabel="nombre" class="w-full" [style]="{'width':'100%'}"></p-select>
            </div>

            <!-- Herramientas de Generación Masiva -->
            <p-fieldset legend="Generación Automática (Opcional)" [toggleable]="true" [collapsed]="true">
                <div class="formgrid grid flex gap-3 align-items-end">
                    <div class="field col flex flex-column gap-2 mb-0">
                        <label>Monto Matrícula</label>
                        <p-inputNumber [(ngModel)]="montoMatricula" mode="currency" currency="PEN" locale="es-PE" class="w-full"></p-inputNumber>
                    </div>
                    <div class="field col flex flex-column gap-2 mb-0">
                        <label>Monto Mensualidad</label>
                        <p-inputNumber [(ngModel)]="montoMensualidad" mode="currency" currency="PEN" locale="es-PE" class="w-full"></p-inputNumber>
                    </div>
                    <div class="field col-fixed mb-0">
                        <button pButton label="Generar Bloque" icon="pi pi-cog" class="p-button-outlined" (click)="generarPropuesta()"></button>
                    </div>
                </div>
            </p-fieldset>

            <!-- Lista de Tarifas -->
            <div>
                <div class="flex justify-content-between align-items-center mb-2">
                    <h3 class="m-0">Lista de items</h3>
                    <div class="flex gap-2">
                         <button pButton label="Limpiar" icon="pi pi-trash" class="p-button-danger p-button-text p-button-sm" (click)="limpiarLista()" [disabled]="tarifasGeneradas.length === 0"></button>
                         <button pButton label="Agregar Concepto" icon="pi pi-plus" (click)="agregarTarifaManual()"></button>
                    </div>
                </div>

                <p-table [value]="tarifasGeneradas" [scrollable]="true" scrollHeight="350px" styleClass="p-datatable-sm p-datatable-gridlines">
                    <ng-template pTemplate="header">
                        <tr>
                            <th style="width: 70px">Orden</th>
                            <th>Concepto</th>
                            <th>Tipo</th>
                            <th style="width: 120px">Monto</th>
                            <th style="width: 3rem"></th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-tarifa let-index="rowIndex">
                        <tr>
                            <td class="p-1">
                                <p-inputNumber [(ngModel)]="tarifa.order" [useGrouping]="false" class="w-full" [inputStyle]="{'padding':'0.5rem'}"></p-inputNumber>
                            </td>
                            <td class="p-1">
                                <input pInputText [(ngModel)]="tarifa.nombre" class="w-full p-inputtext-sm" placeholder="Ej. Cuota Ingreso" />
                            </td>
                            <td class="p-1">
                                <p-select [(ngModel)]="tarifa.tipoTarifaId" [options]="tiposTarifa()" optionLabel="nombre" optionValue="id" [style]="{'width':'100%'}" appendTo="body" placeholder="Seleccione"></p-select>
                            </td>
                            <td class="p-1">
                                <p-inputNumber [(ngModel)]="tarifa.monto" mode="currency" currency="PEN" locale="es-PE" class="w-full" [inputStyle]="{'padding':'0.5rem'}"></p-inputNumber>
                            </td>
                            <td class="text-center p-1">
                                <button pButton icon="pi pi-times" class="p-button-rounded p-button-danger p-button-text p-button-sm" (click)="eliminarDePropuesta(index)"></button>
                            </td>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="emptymessage">
                        <tr>
                            <td colspan="5" class="text-center p-4 text-gray-500">
                                No hay items agregados. Use "Agregar Concepto" o la generación automática.
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </div>
        <ng-template pTemplate="footer">
            <button pButton label="Cancelar" class="p-button-text" (click)="displayDialog = false"></button>
            <button pButton label="Guardar Todo" icon="pi pi-check" (click)="guardarTarifas()" [disabled]="tarifasGeneradas.length === 0"></button>
        </ng-template>
    </p-dialog>
  `,
    styles: [`
    :host ::ng-deep .p-inputnumber { width: 100%; }
    :host ::ng-deep .p-inputnumber-input { width: 100%; }
  `]
})
export class TarifasAnualesComponent implements OnInit {
    tarifas = signal<TarifaList[]>([]);
    periodos = signal<PeriodoEscolar[]>([]);
    tiposTarifa = signal<any[]>([]); // Tipos de tarifa loaded from API
    displayDialog = false;

    // Variables para la generación
    periodoSeleccionado: PeriodoEscolar | null = null;
    montoMatricula: number = 0;
    montoMensualidad: number = 0;

    // Lista temporal para previsualización
    tarifasGeneradas: Partial<Tarifa>[] = [];

    constructor(
        private tarifaService: TarifaService,
        private periodoService: PeriodoService
    ) { }

    ngOnInit() {
        this.cargarTarifas();
        this.cargarTiposTarifa();
        // Cargar periodos y seleccionar el activo por defecto
        this.periodoService.loadPeriodos();
        setTimeout(() => {
            console.log('Periodos cargados', this.periodoService.periodos());
            const periodos = this.periodoService.periodos();
            this.periodos.set(periodos);
            // Seleccionar el período activo por defecto
            const periodoActivo = periodos.find(p => p.activo);
            if (periodoActivo) {
                this.periodoSeleccionado = periodoActivo;
            }
        }, 100);
    }

    comparePeriodos = (p1: PeriodoEscolar | null, p2: PeriodoEscolar | null): boolean => {
        return p1 && p2 ? p1.id === p2.id : p1 === p2;
    }

    cargarTarifas() {

        this.tarifaService.getTarifas().subscribe(data => {
            this.tarifas.set(data); console.log('Tipos tarifa cargados', data);
        });
    }

    cargarTiposTarifa() {
        this.tarifaService.getTiposTarifa().subscribe(data => {

            this.tiposTarifa.set(data);
            console.log('Tipos tarifa cargados', data);
        });
    }

    showDialog() {
        this.montoMatricula = 0;
        this.montoMensualidad = 0;
        this.tarifasGeneradas = [];
        // Asegurar que hay un período seleccionado
        if (!this.periodoSeleccionado) {
            const periodos = this.periodoService.periodos();
            const periodoActivo = periodos.find(p => p.activo);
            if (periodoActivo) {
                this.periodoSeleccionado = periodoActivo;
            }
        }
        this.displayDialog = true;
    }

    agregarTarifaManual() {
        if (!this.periodoSeleccionado) {
            alert('Seleccione un período escolar primero');
            return;
        }

        // Calculate next order
        const maxOrder = this.tarifasGeneradas.length > 0
            ? Math.max(...this.tarifasGeneradas.map(t => t.order || 0))
            : 0;

        this.tarifasGeneradas.push({
            nombre: '',
            monto: 0,
            anio: this.periodoSeleccionado.anio,
            periodoEscolarId: this.periodoSeleccionado.id,
            order: maxOrder + 1,
            tipoTarifaId: undefined // Let user select
        });
    }

    limpiarLista() {
        this.tarifasGeneradas = [];
    }

    generarPropuesta() {
        if (!this.periodoSeleccionado) {
            alert('Por favor seleccione un período escolar');
            return;
        }

        const periodoEncontrado = this.periodoSeleccionado;

        // Smartly find next order
        let orderCounter = this.tarifasGeneradas.length > 0
            ? Math.max(...this.tarifasGeneradas.map(t => t.order || 0)) + 1
            : 1;

        // Find Tipo IDs
        const tipos = this.tiposTarifa();
        const matriculaType = tipos.find(t => t.nombre === 'MATRICULA');
        const mensualidadType = tipos.find(t => t.nombre === 'MENSUALIDAD');

        const matriculaTypeId = matriculaType ? matriculaType.id : 1;
        const mensualidadTypeId = mensualidadType ? mensualidadType.id : 2;

        // 1. Agregar Matrícula
        this.tarifasGeneradas.push({
            nombre: `Matrícula ${periodoEncontrado.anio}`,
            anio: periodoEncontrado.anio,
            monto: this.montoMatricula,
            order: orderCounter++,
            periodoEscolarId: periodoEncontrado.id,
            tipoTarifaId: matriculaTypeId
        });

        // 2. Agregar Mensualidades de Marzo a Diciembre
        const meses = ['Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

        meses.forEach(mes => {
            this.tarifasGeneradas.push({
                nombre: `Mensualidad ${mes} ${periodoEncontrado.anio}`,
                anio: periodoEncontrado.anio,
                monto: this.montoMensualidad,
                order: orderCounter++,
                periodoEscolarId: periodoEncontrado.id,
                tipoTarifaId: mensualidadTypeId
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
