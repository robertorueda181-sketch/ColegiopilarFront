import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Pago } from '../../../../models/pago.model';
import { PagoService } from '../../../../services/pago.service';
import { EstudianteService } from '../../../../services/estudiante.service';
import { Estudiante } from '../../../../models/estudiante.model';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FileUploadModule } from 'primeng/fileupload';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-control-pagos',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    TableModule, 
    ButtonModule, 
    DialogModule, 
    SelectModule, 
    InputNumberModule, 
    RadioButtonModule,
    FileUploadModule,
    TagModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './control-pagos.component.html',
  styleUrls: ['./control-pagos.component.css']
})
export class ControlPagosComponent implements OnInit {
  pagos = signal<Pago[]>([]);
  estudiantes = signal<{label: string, value: number}[]>([]);
  
  displayDialog = false;
  
  // Form Model
  selectedEstudiante: number | null = null;
  monto: number | null = null;
  tipoPago: 'PARCIAL' | 'TOTAL' = 'PARCIAL';
  uploadedFile: any = null;

  constructor(
    private pagoService: PagoService,
    private estudianteService: EstudianteService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.cargarPagos();
    this.cargarEstudiantes();
  }

  cargarPagos() {
    this.pagoService.getPagos().subscribe(data => this.pagos.set(data));
  }

  cargarEstudiantes() {
    this.estudianteService.getEstudiantes().subscribe(data => {
      const options = data.map(e => ({
        label: `${e.nombres} ${e.apellidos} - ${e.grado} ${e.seccion ? e.seccion : ''}`,
        value: e.id,
        // Almacenamos el objeto completo temporalmente si necesitáramos más datos, 
        // pero para el select p-select, structure {label, value} es lo estándar.
      }));
      this.estudiantes.set(options);
    });
  }

  showDialog() {
    this.resetForm();
    this.displayDialog = true;
  }

  hideDialog() {
    this.displayDialog = false;
  }

  onUpload(event: any) {
    // En un caso real, el backend devolvería la URL.
    // Aquí simulamos que obtenemos el archivo.
    for(let file of event.files) {
        this.uploadedFile = file;
    }
    this.messageService.add({severity: 'info', summary: 'Archivo Cargado', detail: 'Imagen/PDF listo para guardar'});
  }

  guardarPago() {
    if (!this.selectedEstudiante || !this.monto) {
        this.messageService.add({severity: 'error', summary: 'Error', detail: 'Complete los campos obligatorios'});
        return;
    }

    const estudianteLabel = this.estudiantes().find(e => e.value === this.selectedEstudiante)?.label || 'Desconocido';
    const nombreSimple = estudianteLabel.split('-')[0].trim();

    const nuevoPago: Pago = {
        id: 0, // Mock ID set in service
        estudianteId: this.selectedEstudiante,
        nombreEstudiante: nombreSimple,
        monto: this.monto,
        tipo: this.tipoPago,
        metodo: 'YAPE', // Default por ahora, podriamos agregar selector
        fecha: new Date(),
        estado: 'PENDIENTE',
        archivoUrl: this.uploadedFile ? URL.createObjectURL(this.uploadedFile) : undefined
    };

    this.pagoService.addPago(nuevoPago).subscribe(() => {
        this.messageService.add({severity: 'success', summary: 'Éxito', detail: 'Pago registrado correctamente'});
        this.cargarPagos();
        this.hideDialog();
    });
  }

  resetForm() {
    this.selectedEstudiante = null;
    this.monto = null;
    this.tipoPago = 'PARCIAL';
    this.uploadedFile = null;
  }

  getSeverity(estado: string) {
      switch (estado) {
          case 'VERIFICADO':
              return 'success';
          case 'PENDIENTE':
              return 'warn';
          default:
              return 'info';
      }
  }
}
