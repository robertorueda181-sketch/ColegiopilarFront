import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Matricula } from '../../../../models/matricula.model';
import { MatriculaService } from '../../../../services/matricula.service';
import { PeriodoService } from '../../../periodo/services/periodo.service';
import { PrimeNG } from 'primeng/config';

// PrimeNG Imports
import { TableModule, Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-matriculas-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule, SelectModule, TagModule],
  templateUrl: './matriculas-list.component.html',
  styleUrls: ['./matriculas-list.component.css']
})
export class MatriculasListComponent implements OnInit {
  matriculas = signal<Matricula[]>([]);
  loading = signal<boolean>(true);
  searchValue: string | undefined;
  
  // Period filter
  selectedPeriodoId: number | null = null;

  grados = signal<any[]>([]);
  secciones = signal<any[]>([]);
  niveis = signal<any[]>([]);
  
  constructor(
      private matriculaService: MatriculaService,
      public periodoService: PeriodoService,
      private primeng: PrimeNG
  ) {
      effect(() => {
          const periodos = this.periodoService.periodos();
          if (periodos.length > 0 && !this.selectedPeriodoId) {
              const activePeriod = periodos.find(p => p.activo);
              if (activePeriod) {
                  this.selectedPeriodoId = activePeriod.anio;
              } else {
                  this.selectedPeriodoId = periodos[0].anio;
              }
              // Use setTimeout to avoid 'ExpressionChangedAfterItHasBeenCheckedError' or synchronization issues if this effect runs during change detection
              setTimeout(() => this.loadMatriculas(), 0);
          }
      });
  }

  ngOnInit() {
      // Trigger load if needed, though constructor performs it. 
      // Ensure periodos are loaded if service didn't trigger it (e.g. if it was already loaded but empty?)
      // The service loads in constructor, so we are good.
  }


  loadMatriculas() {
      if (!this.selectedPeriodoId) return;
      
      this.loading.set(true);
      this.matriculaService.getMatriculas(this.selectedPeriodoId).subscribe({
          next: (data) => {
              this.matriculas.set(data);
              this.loading.set(false);

               const uniqueGrados = [...new Set(data.map(e => e.grado))].sort();
        this.grados.set(uniqueGrados.map(g => ({ label: g, value: g })));

        const uniqueSecciones = [...new Set(data.filter(e => e.seccion).map(e => e.seccion))].sort();
        this.secciones.set(uniqueSecciones.map(s => ({ label: s, value: s })));

        const uniqueNiveis = [...new Set(data.filter(e => e.nivel).map(e => e.nivel))].sort();
        this.niveis.set(uniqueNiveis.map(n => ({ label: n, value: n })));

          },
          error: (err) => {
            console.error(err);
            this.loading.set(false);
          }
      });
  }

  onPeriodoChange() {
      this.loadMatriculas();
  }

  clear(table: Table) {
      table.clear();
      this.searchValue = '';
  }

  onGlobalFilter(table: Table, event: Event) {
      table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
