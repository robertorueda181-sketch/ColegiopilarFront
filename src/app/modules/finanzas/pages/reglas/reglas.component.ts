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
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-reglas',
  standalone: true,
  imports: [
      CommonModule, 
      TableModule, 
      ButtonModule, 
      DialogModule, 
      FormsModule, 
      InputTextModule, 
      InputNumberModule, 
      SelectModule, 
      ToggleSwitchModule,
      ToastModule,
      ConfirmDialogModule
    ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="card">
      <p-toast></p-toast>
      <p-confirmDialog></p-confirmDialog>

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
            <th>Acciones</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-regla>
          <tr>
            <td>{{regla.nombre}}</td>
            <td>{{regla.tipoDescuento}}</td>
            <td>{{regla.valor}}</td>
            <td>{{regla.prioridad}}</td>
            <td><i [class]="regla.activa ? 'pi pi-check text-green-500' : 'pi pi-times text-red-500'"></i></td>
            <td>
                <button pButton icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-warning mr-2" (click)="editRegla(regla)"></button>
                <button pButton icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger" (click)="deleteRegla(regla)"></button>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog [header]="isEditMode ? 'Editar Regla' : 'Nueva Regla'" [(visible)]="displayDialog" [modal]="true" [style]="{width: '400px'}">
        <div class="flex flex-column gap-3">
            <div class="flex flex-column gap-2">
                <label>Nombre</label>
                <input pInputText [(ngModel)]="currentRegla.nombre" />
            </div>
            <div class="flex flex-column gap-2">
                <label>Tipo Descuento</label>
                <p-select [options]="tiposDescuento" [(ngModel)]="currentRegla.tipoDescuento" optionLabel="label" optionValue="value" [style]="{'width': '100%'}"></p-select>
            </div>
            <div class="flex flex-column gap-2">
                <label>Valor</label>
                <p-inputNumber [(ngModel)]="currentRegla.valor" class="w-full"></p-inputNumber>
            </div>
            <div class="flex flex-column gap-2">
                <label>Prioridad</label>
                <p-inputNumber [(ngModel)]="currentRegla.prioridad" class="w-full"></p-inputNumber>
            </div>
            <div class="flex align-items-center gap-2">
                <label>Activa</label>
                <p-toggleswitch [(ngModel)]="currentRegla.activa"></p-toggleswitch>
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
  isEditMode = false;
  
  currentRegla: Regla = {
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

  constructor(
      private reglaService: ReglaService,
      private messageService: MessageService,
      private confirmationService: ConfirmationService
    ) {}

  ngOnInit() {
    this.cargarReglas();
  }

  cargarReglas() {
      this.reglaService.getReglas().subscribe({
          next: (data) => this.reglas.set(data),
          error: (err) => console.error(err)
      });
  }

  showDialog() {
      this.isEditMode = false;
      this.currentRegla = {
          nombre: '',
          tipoDescuento: 'SOLES',
          valor: 0,
          prioridad: 0,
          activa: true
      };
      this.displayDialog = true;
  }

  editRegla(regla: Regla) {
      this.isEditMode = true;
      this.currentRegla = { ...regla };
      this.displayDialog = true;
  }

  deleteRegla(regla: Regla) {
      this.confirmationService.confirm({
          message: `¿Está seguro de eliminar la regla "${regla.nombre}"?`,
          header: 'Confirmación de Eliminación',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
              if (regla.id) {
                  this.reglaService.deleteRegla(regla.id).subscribe({
                      next: () => {
                          this.messageService.add({severity:'success', summary:'Eliminado', detail:'Regla eliminada'});
                          this.cargarReglas();
                      },
                      error: (err) => {
                           this.messageService.add({severity:'error', summary:'Error', detail:'No se pudo eliminar'});
                      }
                  });
              }
          }
      });
  }

  guardarRegla() {
      if (this.isEditMode && this.currentRegla.id) {
          this.reglaService.updateRegla(this.currentRegla.id, this.currentRegla).subscribe({
              next: () => {
                  this.messageService.add({severity:'success', summary:'Éxito', detail:'Regla actualizada'});
                  this.displayDialog = false;
                  this.cargarReglas();
              },
              error: () => this.messageService.add({severity:'error', summary:'Error', detail:'No se pudo actualizar'})
          });
      } else {
          this.reglaService.addRegla(this.currentRegla).subscribe({
              next: () => {
                  this.messageService.add({severity:'success', summary:'Éxito', detail:'Regla creada'});
                  this.displayDialog = false;
                  this.cargarReglas();
              },
              error: () => this.messageService.add({severity:'error', summary:'Error', detail:'No se pudo crear'})
          });
      }
  }
}
