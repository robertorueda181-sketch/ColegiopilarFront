import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Estudiante } from '../../../../models/estudiante.model';
import { EstudianteService } from '../../../../services/estudiante.service';
import { PrimeNG } from 'primeng/config';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-estudiantes-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule, SelectModule],
  templateUrl: './estudiantes-list.component.html',
  styleUrls: ['./estudiantes-list.component.css']
})
export class EstudiantesListComponent implements OnInit {
  estudiantes = signal<Estudiante[]>([]);
  loading = signal<boolean>(true);
  searchValue: string | undefined;

  // Options for Dropdowns
  grados = signal<any[]>([]);
  secciones = signal<any[]>([]);

  constructor(private estudianteService: EstudianteService, private primeng: PrimeNG) {}

  ngOnInit() {
    this.primeng.setTranslation({
        startsWith: 'Empieza con',
        contains: 'Contiene',
        notContains: 'No contiene',
        endsWith: 'Termina con',
        equals: 'Igual a',
        notEquals: 'No igual a',
        noFilter: 'Sin filtro',
        lt: 'Menor que',
        lte: 'Menor o igual a',
        gt: 'Mayor que',
        gte: 'Mayor o igual a',
        is: 'Es',
        isNot: 'No es',
        before: 'Antes',
        after: 'Después',
        dateIs: 'Fecha es',
        dateIsNot: 'Fecha no es',
        dateBefore: 'Fecha antes',
        dateAfter: 'Fecha después',
        clear: 'Limpiar',
        apply: 'Aplicar',
        matchAll: 'Coincidir todo',
        matchAny: 'Coincidir cualquiera',
        addRule: 'Agregar regla',
        removeRule: 'Eliminar regla',
        accept: 'Sí',
        reject: 'No',
        choose: 'Escoger',
        upload: 'Subir',
        cancel: 'Cancelar',
        dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
        dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
        dayNamesMin: ['Do','Lu','Ma','Mi','Ju','Vi','Sa'],
        monthNames: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
        monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun','Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        today: 'Hoy',
        weekHeader: 'Sm'
    });
    this.cargarEstudiantes();
  }

  cargarEstudiantes() {
    this.estudianteService.getEstudiantes().subscribe({
      next: (data) => {
        this.estudiantes.set(data);
        
        // Extract unique options for Grade and Section
        const uniqueGrados = [...new Set(data.map(e => e.grado))].sort();
        this.grados.set(uniqueGrados.map(g => ({ label: g, value: g })));

        const uniqueSecciones = [...new Set(data.filter(e => e.seccion).map(e => e.seccion))].sort();
        this.secciones.set(uniqueSecciones.map(s => ({ label: s, value: s })));

        this.loading.set(false);
      },
      error: (e: any) => {
        console.error('Error al cargar estudiantes', e);
        this.loading.set(false);
      }
    });
  }

  clear(table: Table) {
      table.clear();
      this.searchValue = ''
  }

  onGlobalFilter(table: Table, event: Event) {
      const input = event.target as HTMLInputElement;
      table.filterGlobal(input.value, 'contains');
  }
} 
