import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Regla } from '../../../../models/regla.model';
import { ReglaService } from '../../../../services/regla.service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'app-reglas',
  standalone: true,
  imports: [CommonModule, TableModule, ButtonModule, DialogModule, FormsModule, InputTextModule, InputNumberModule, SelectModule, ToggleSwitchModule],
  template: `
    <div class="card">
      <div class="flex justify-content-between align-items-center mb-4">
        <h2>Reglas de Descuento</h2>
        <button pButton label="Nueva Regla" icon="pi pi-plus" (click)="showDialog()"></button>
      </div>

      <p-table [value]="reglas()">
        <ng-template pTemplate="header">
          <tr>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Valor</th>
            <th>Prioridad</th>
            <th>Activa</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-regla>
          <tr>
            <td>{{regla.nombre}}</td>
            <td>{{regla.tipoDescuento}}</td>
            <td>{{regla.valor}}</td>
            <td>{{regla.prioridad}}</td>
            <td><i [class]="regla.activa ? 'pi pi-check text-green-500' : 'pi pi-times text-red-500'"></i></td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog header="Nueva Regla" [(visible)]="displayDialog" [modal]="true" [style]="{width: '400px'}">
        <div class="flex flex-column gap-3">
            <div class="flex flex-column gap-2">
                <label>Nombre</label>
                <input pInputText [(ngModel)]="nuevaRegla.nombre" />
            </div>
            <div class="flex flex-column gap-2">
                <label>Tipo Descuento</label>
                <p-select [options]="tiposDescuento" [(ngModel)]="nuevaRegla.tipoDescuento" optionLabel="label" optionValue="value"></p-select>
            </div>
            <div class="flex flex-column gap-2">
                <label>Valor</label>
                <p-inputNumber [(ngModel)]="nuevaRegla.valor"></p-inputNumber>
            </div>
            <div class="flex flex-column gap-2">
                <label>Prioridad</label>
                <p-inputNumber [(ngModel)]="nuevaRegla.prioridad"></p-inputNumber>
            </div>
            <div class="flex align-items-center gap-2">
                <label>Activa</label>
                <p-toggleswitch [(ngModel)]="nuevaRegla.activa"></p-toggleswitch>
            </div>
        </div>
        <ng-template pTemplate="footer">
            <button pButton label="Cancelar" class="p-button-text" (click)="displayDialog = false"></button>
            <button pButton label="Guardar" (click)="guardarRegla()"></button>
        </ng-template>
    </p-dialog>
  `
})
export class ReglasComponent implements OnInit {
  reglas = signal<Regla[]>([]);
  displayDialog = false;
  
  nuevaRegla: any = {
      nombre: '',
      tipoDescuento: 'SOLES',
      valor: 0,
      prioridad: 0,
      activa: true
  };

  tiposDescuento = [
      { label: 'Soles (Monto Fijo)', value: 'SOLES' },
      { label: 'Porcentaje', value: 'PORCENTAJE' }
  ];

  constructor(private reglaService: ReglaService) {}

  ngOnInit() {
    this.cargarReglas();
  }

  cargarReglas() {
    this.reglaService.getReglas().subscribe(data => this.reglas.set(data));
  }

  showDialog() {
      this.nuevaRegla = { nombre: '', tipoDescuento: 'SOLES', valor: 0, prioridad: 0, activa: true };
      this.displayDialog = true;
  }

  guardarRegla() {
      this.reglaService.addRegla(this.nuevaRegla).subscribe(() => {
          this.cargarReglas();
          this.displayDialog = false;
      });
  }
}
