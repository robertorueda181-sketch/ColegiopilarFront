import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {  RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  menuItems = [
    { label: 'Estudiantes', icon: 'pi pi-users', route: '/estudiantes' },
    { label: 'Pagos', icon: 'pi pi-wallet', route: '/pagos' },
    { label: 'Periodos Escolares', icon: 'pi pi-calendar-plus', route: '/periodos' },
    // Finanzas Sub-items flattened for simplicity or grouped if needed
    { label: 'Tarifas Anuales', icon: 'pi pi-calendar', route: '/finanzas/tarifas' },
    { label: 'Reglas de Descuento', icon: 'pi pi-tag', route: '/finanzas/reglas' },
    { label: 'Simulador de Cuotas', icon: 'pi pi-calculator', route: '/finanzas/calculo' },
  ];
}
