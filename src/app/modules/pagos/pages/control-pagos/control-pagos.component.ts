import { Component, OnInit, signal, ViewChild } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Pago } from '../../../../models/pago.model';
import { PagoService } from '../../../../services/pago.service';
import { EstudianteService } from '../../../../services/estudiante.service';
import { MatriculaService } from '../../../../services/matricula.service';
import { TarifaService } from '../../../../services/tarifa.service';
import { Tarifa, TarifaList } from '../../../../models/tarifa.model';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FileUploadModule, FileUpload } from 'primeng/fileupload';

import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-control-pagos',
  standalone: true,
  imports: [
    CommonModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    SelectModule,
    InputNumberModule,
    RadioButtonModule,
    FileUploadModule,
    TagModule,
    ToastModule,
    InputTextModule
  ],
  providers: [MessageService],
  templateUrl: './control-pagos.component.html',
  styleUrls: ['./control-pagos.component.css']
})
export class ControlPagosComponent implements OnInit {
  @ViewChild('fileUpload') fileUpload!: FileUpload;

  pagos = signal<Pago[]>([]);
  estudiantes = signal<{ label: string, value: number }[]>([]);
  tiposPago = signal<any[]>([]);
  matriculas = signal<any[]>([]);
  tarifasOptions = signal<{ label: string, value: string | undefined }[]>([]);
  selectedTarifaId: string | null = null;
  // Raw and filtered matriculas for filtering by nivel/grado
  rawMatriculas = signal<any[]>([]);
  filteredMatriculas = signal<any[]>([]);
  nivelesOptions = signal<{ label: string, value: string }[]>([]);
  gradosOptions = signal<{ label: string, value: string }[]>([]);
  seccionesOptions = signal<{ label: string, value: string }[]>([]);
  filtroGrado = signal<string | null>(null);
  filtroNivel = signal<string | null>(null);
  filtroSeccion = signal<string | null>(null);
  showFilterGrado = signal<boolean>(false);
  showFilterSeccion = signal<boolean>(false);
  showFilterNivel = signal<boolean>(false);
  displayDialog = false;

  // Form Model
  pagoForm!: FormGroup;
  uploadedFile: any = null;

  searchText: string = '';
  selectedMatricula = signal<any>(null);


  // Historial
  historialPagos = signal<any[]>([]);
  displayHistoryDialog = false;

  constructor(
    private estudianteService: EstudianteService,
    private messageService: MessageService
    , private matriculaService: MatriculaService
    , private tarifaService: TarifaService
    , private http: HttpClient
    , private fb: FormBuilder
  ) {
    this.initForm();
  }

  ngOnInit() {

    this.cargarEstudiantes();
    this.cargarTiposPago();
    // Cargar tarifas para filtro
    this.tarifaService.getTarifas().subscribe((tars: TarifaList[]) => {
      console.log('Tarifas cargadas', tars);
      // Ordenar tarifas por el campo 'order' en forma ascendente
      const tarifasOrdenadas = tars.sort((a, b) => (a.order || 0) - (b.order || 0));
      const opts = tarifasOrdenadas.map(t => ({ label: `${t.descripcion}`, value: t.id }));
      this.tarifasOptions.set(opts);
      if (opts.length > 0 && opts[0].value) {
        this.selectedTarifaId = opts[0].value as string;
        this.cargarMatriculasPorTarifa(this.selectedTarifaId);
      }
    });
  }

  initForm() {
    this.pagoForm = this.fb.group({
      matriculaId: [null, Validators.required],
      estudianteId: [null],
      tipoPagoId: [null, Validators.required],
      monto: [null, [Validators.required, Validators.min(0)]],
      observacion: ['']
    });
  }

  cargarTiposPago() {
    this.http.get<any[]>('https://localhost:53676/tipospago').subscribe(data => {
      this.tiposPago.set(data);
    });
  }

  onTarifaChange(id: string | null) {
    this.selectedTarifaId = id;
    if (id != null) this.cargarMatriculasPorTarifa(id);
    else this.matriculas.set([]);
  }

  cargarMatriculasPorTarifa(tarifaId: string) {
    this.matriculaService.getByPeriodoWithTarifas(tarifaId).subscribe(response => {
      console.log('Matriculas response raw:', response);
      let items: any[] = [];
      if (Array.isArray(response)) {
        // API sometimes returns an array with a single object that contains 'matriculas'
        if (response.length > 0 && response[0] && Array.isArray((response[0] as any).matriculas)) {
          items = (response[0] as any).matriculas;
        } else {
          items = response;
        }
      } else if (response && Array.isArray(response.matriculas)) {
        items = response.matriculas;
      } else if (response && Array.isArray(response.data)) {
        items = response.data;
      } else if (response && Array.isArray(response.result)) {
        items = response.result;
      } else {
        // Fallback: try to find the first array property
        for (const key of Object.keys(response || {})) {
          if (Array.isArray((response as any)[key])) {
            items = (response as any)[key];
            break;
          }
        }
      }

      const processed = (items || []).map((i: any) => {
        const pagoMonto = i.pagoMonto != null ? Number(i.pagoMonto) : 0;
        const montoFinal = i.montoFinal != null ? Number(i.montoFinal) : 0;
        return {
          ...i,
          pagoMonto,
          montoFinal,
          estadoPago: pagoMonto >= montoFinal ? 'Pagado' : 'Falta Pago'
        };
      });

      this.rawMatriculas.set(processed);
      this.buildFilterOptions(processed);
      this.applyFilters();
      console.log('Matriculas cargadas por tarifa', items);
    }, err => {
      console.error('Error cargando matriculas por tarifa', err);
      this.rawMatriculas.set([]);
      this.filteredMatriculas.set([]);
    });
  }

  buildFilterOptions(items: any[]) {
    const niveles = Array.from(new Set(items.map(i => i.nivel).filter(Boolean)));
    const grados = Array.from(new Set(items.map(i => i.grado).filter(Boolean)));
    const secciones = Array.from(new Set(items.map(i => i.seccion).filter(Boolean)));
    this.nivelesOptions.set(niveles.map(n => ({ label: n, value: n })));
    this.gradosOptions.set(grados.map(g => ({ label: g, value: g })));
    this.seccionesOptions.set(secciones.map(s => ({ label: s, value: s })));
  }

  aplicarFiltroSelect(dt: any, field: string, valor: any) {
    // Extract the value from PrimeNG select (which is a {label, value} object)
    const filterValue = valor?.value !== undefined ? valor.value : valor;

    // Update the signal
    if (field === 'grado') {
      this.filtroGrado.set(filterValue);
    } else if (field === 'nivel') {
      this.filtroNivel.set(filterValue);
    } else if (field === 'seccion') {
      this.filtroSeccion.set(filterValue);
    }

    // Apply all filters
    this.applyFilters();
  }

  resetFilters() {
    this.filtroGrado.set(null);
    this.filtroSeccion.set(null);
    this.filtroNivel.set(null);
    this.searchText = '';
    this.showFilterGrado.set(false);
    this.showFilterSeccion.set(false);
    this.showFilterNivel.set(false);
    this.applyFilters();
  }

  toggleFilter(filterType: string) {
    if (filterType === 'grado') {
      this.showFilterGrado.set(!this.showFilterGrado());
      this.showFilterSeccion.set(false);
      this.showFilterNivel.set(false);
    } else if (filterType === 'seccion') {
      this.showFilterSeccion.set(!this.showFilterSeccion());
      this.showFilterGrado.set(false);
      this.showFilterNivel.set(false);
    } else if (filterType === 'nivel') {
      this.showFilterNivel.set(!this.showFilterNivel());
      this.showFilterGrado.set(false);
      this.showFilterSeccion.set(false);
    }
  }

  closeFilters() {
    this.showFilterGrado.set(false);
    this.showFilterSeccion.set(false);
    this.showFilterNivel.set(false);
  }

  onSearchChange(event: any) {
    this.searchText = event.target.value.toLowerCase();
    this.applyFilters();
  }

  applyFilters() {
    const items = this.rawMatriculas();
    const filtered = items.filter(i => {
      const okNivel = this.filtroNivel() ? i.nivel === this.filtroNivel() : true;
      const okGrado = this.filtroGrado() ? i.grado === this.filtroGrado() : true;
      const okSeccion = this.filtroSeccion() ? i.seccion === this.filtroSeccion() : true;

      // Search filter - busca en todos los campos
      const okSearch = this.searchText === '' ||
        (i.dni && i.dni.toString().toLowerCase().includes(this.searchText)) ||
        (i.nombres && i.nombres.toLowerCase().includes(this.searchText)) ||
        (i.apellidos && i.apellidos.toLowerCase().includes(this.searchText)) ||
        (i.grado && i.grado.toString().toLowerCase().includes(this.searchText)) ||
        (i.seccion && i.seccion.toString().toLowerCase().includes(this.searchText)) ||
        (i.nivel && i.nivel.toLowerCase().includes(this.searchText)) ||
        (i.montoFinal && i.montoFinal.toString().includes(this.searchText)) ||
        (i.pagoMonto && i.pagoMonto.toString().includes(this.searchText));

      return okNivel && okGrado && okSeccion && okSearch;
    });
    this.filteredMatriculas.set(filtered);
  }

  cargarEstudiantes() {
    this.estudianteService.getEstudiantes().subscribe(data => {
      const options = data.map(e => ({
        label: `${e.nombres} ${e.apellidos} - ${e.grado || ''} ${e.seccion ? e.seccion : ''}`,
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
    this.resetForm();
  }

  hideHistoryDialog() {
    this.displayHistoryDialog = false;
  }

  onUpload(event: any) {
    // En un caso real, el backend devolvería la URL.
    // Aquí simulamos que obtenemos el archivo.
    for (let file of event.files) {
      this.uploadedFile = file;
    }
    this.messageService.add({ severity: 'info', summary: 'Archivo Cargado', detail: 'Imagen/PDF listo para guardar' });
  }

  guardarPago() {
    if (this.pagoForm.invalid) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Complete los campos obligatorios' });
      this.pagoForm.markAllAsTouched();
      return;
    }

    const val = this.pagoForm.value;
    console.log('Datos Formulario:', val);

    const formData = new FormData();
    formData.append('matriculaId', val.matriculaId);
    formData.append('tipoPagoId', val.tipoPagoId.toString());
    if (this.selectedTarifaId) {
      formData.append('tarifaId', this.selectedTarifaId);
    }
    formData.append('monto', val.monto.toString());
    if (val.observacion) {
      formData.append('observacion', val.observacion);
    }
    if (this.uploadedFile) {
      formData.append('file', this.uploadedFile);
    }

    this.http.post('https://localhost:53676/pagos/registrar-detalle', formData).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Pago registrado correctamente' });
        if (this.selectedTarifaId) {
          this.cargarMatriculasPorTarifa(this.selectedTarifaId);
        }
        this.hideDialog();
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al registrar el pago' });
      }
    });
  }

  pagar(m: any) {
    this.resetForm();
    this.selectedMatricula.set(m);
    console.log('Matricula seleccionada:', m);
    // Intentar obtener ID de matricula de id o matriculaId
    const matId = m.id || m.matriculaId;

    if (!matId) {
      console.error('No se encontró ID en el objeto matrícula:', m);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo identificar la matrícula. Ver consola.' });
      return;
    }

    // Pre-fill the dialog with the remaining amount
    const remaining = (Number(m.montoFinal || 0) - Number(m.pagoMonto || 0));

    // Try to find student id by matching name in estudiantes options
    const labelMatch = `${m.nombres} ${m.apellidos}`;
    const found = this.estudiantes().find(e => e.label.startsWith(labelMatch));

    this.pagoForm.patchValue({
      matriculaId: matId,
      monto: remaining > 0 ? remaining : 0,
      tipoPagoId: null, // Reset to null or appropriate value
      estudianteId: found ? found.value : null
    });

    this.displayDialog = true;
  }

  verHistorial(m: any) {
    console.log('Matricula seleccionada:', m);
    const id = m.pagoId;
    if (!id) {
      this.historialPagos.set([]);
      this.displayHistoryDialog = true;
      return;
    }

    this.selectedMatricula.set(m);
    this.historialPagos.set([]); // Limpiar anterior

    this.http.get<any>('https://localhost:53676/pagos/' + id + '/detalle').subscribe({
      next: (data) => {
        console.log('Historial pagos:', data);
        if (data && data.detalles) {
          this.historialPagos.set(data.detalles);
        } else {
          this.historialPagos.set([]);
        }
        this.displayHistoryDialog = true;
      },
      error: (err) => {
        console.error('Error cargando historial', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el historial' });
      }
    });
  }

  resetForm() {
    this.pagoForm.reset({
      tipoPagoId: null
    });
    this.uploadedFile = null;
    this.selectedMatricula.set(null);
    if (this.fileUpload) {
      this.fileUpload.clear();
    }
  }

  getSeverity(estado: string) {
    if (!estado) return 'info';
    switch (estado.toUpperCase()) {
      case 'VERIFICADO':
        return 'success';
      case 'PENDIENTE':
        return 'warn';
      default:
        return 'info';
    }
  }
}
