import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Pago } from '../../../../models/pago.model';
import { PagoService } from '../../../../services/pago.service';
import { EstudianteService } from '../../../../services/estudiante.service';
import { MatriculaService } from '../../../../services/matricula.service';
import { TarifaService } from '../../../../services/tarifa.service';
import { Tarifa } from '../../../../models/tarifa.model';

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
import { InputTextModule } from 'primeng/inputtext';
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
    ToastModule,
    InputTextModule
  ],
  providers: [MessageService],
  templateUrl: './control-pagos.component.html',
  styleUrls: ['./control-pagos.component.css']
})
export class ControlPagosComponent implements OnInit {
  pagos = signal<Pago[]>([]);
  estudiantes = signal<{label: string, value: number}[]>([]);
  tiposPago = signal<any[]>([]);
  matriculas = signal<any[]>([]);
  tarifasOptions = signal<{label:string,value:string|undefined}[]>([]);
  selectedTarifaId: string | null = null;
  // Raw and filtered matriculas for filtering by nivel/grado
  rawMatriculas = signal<any[]>([]);
  filteredMatriculas = signal<any[]>([]);
  nivelesOptions = signal<{label:string,value:string}[]>([]);
  gradosOptions = signal<{label:string,value:string}[]>([]);
  seccionesOptions = signal<{label:string,value:string}[]>([]);
  filtroGrado = signal<string | null>(null);
  filtroNivel = signal<string | null>(null);
  filtroSeccion = signal<string | null>(null);
  showFilterGrado = signal<boolean>(false);
  showFilterSeccion = signal<boolean>(false);
  showFilterNivel = signal<boolean>(false);
  displayDialog = false;
  
  // Form Model
  selectedEstudiante: number | null = null;
  selectedMatriculaId: string | null = null;
  selectedTipoPagoId: number | null = null;
  monto: number | null = null;
  tipoPago: 'PARCIAL' | 'TOTAL' = 'PARCIAL';
  uploadedFile: any = null;
  observacion: string = '';

  searchText: string = '';

  constructor(
    private pagoService: PagoService,
    private estudianteService: EstudianteService,
    private messageService: MessageService
    , private matriculaService: MatriculaService
    , private tarifaService: TarifaService
    , private http: HttpClient
  ) {}

  ngOnInit() {

    this.cargarEstudiantes();
    this.cargarTiposPago();
    // Cargar tarifas para filtro
    this.tarifaService.getTarifas().subscribe((tars: Tarifa[]) => {
      console.log('Tarifas cargadas', tars);
      // Ordenar tarifas por el campo 'order' en forma ascendente
      const tarifasOrdenadas = tars.sort((a, b) => (a.order || 0) - (b.order || 0));
      const opts = tarifasOrdenadas.map(t => ({ label: `${t.nombre}`, value: t.id }));
      this.tarifasOptions.set(opts);
      if (opts.length > 0 && opts[0].value) {
        this.selectedTarifaId = opts[0].value as string;
        this.cargarMatriculasPorTarifa(this.selectedTarifaId);
      }
    });
  }

  cargarTiposPago() {
    this.http.get<any[]>('https://localhost:53676/tipospago').subscribe(data => {
      this.tiposPago.set(data);
    });
  }

  onTarifaChange(id: string|null) {
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
    if (!this.selectedMatriculaId || !this.monto || !this.selectedTipoPagoId) {
        this.messageService.add({severity: 'error', summary: 'Error', detail: 'Complete los campos obligatorios'});
        return;
    }

    const formData = new FormData();
    formData.append('matriculaId', this.selectedMatriculaId);
    formData.append('tipoPagoId', this.selectedTipoPagoId.toString());
    if (this.selectedTarifaId) {
        formData.append('tarifaId', this.selectedTarifaId);
    }
    formData.append('monto', this.monto.toString());
    if (this.observacion) {
        formData.append('observacion', this.observacion);
    }
    if (this.uploadedFile) {
        formData.append('file', this.uploadedFile);
    }

    this.http.post('https://localhost:53676/pagos/registrar-detalle', formData).subscribe({
        next: () => {
            this.messageService.add({severity: 'success', summary: 'Éxito', detail: 'Pago registrado correctamente'});
            this.hideDialog();
            if (this.selectedTarifaId) {
                this.cargarMatriculasPorTarifa(this.selectedTarifaId);
            }
        },
        error: (err) => {
            console.error(err);
            this.messageService.add({severity: 'error', summary: 'Error', detail: 'Error al registrar el pago'});
        }
    });
  }

  pagar(m: any) {
    this.selectedMatriculaId = m.id;
    // Pre-fill the dialog with the remaining amount
    const remaining = (Number(m.montoFinal || 0) - Number(m.pagoMonto || 0));
    this.monto = remaining > 0 ? remaining : 0;
    // Try to find student id by matching name in estudiantes options
    const labelMatch = `${m.nombres} ${m.apellidos}`;
    const found = this.estudiantes().find(e => e.label.startsWith(labelMatch));
    this.selectedEstudiante = found ? found.value : null;
    this.displayDialog = true;
  }

  resetForm() {
    this.selectedEstudiante = null;
    this.selectedMatriculaId = null;
    this.selectedTipoPagoId = null;
    this.monto = null;
    this.observacion = '';
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
