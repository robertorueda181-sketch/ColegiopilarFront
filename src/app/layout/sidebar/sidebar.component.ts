import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  menuItems = [
    { label: 'Matrículas', icon: 'pi pi-id-card', route: '/matriculas' },
    { label: 'Pagos', icon: 'pi pi-wallet', route: '/pagos' },
    {
      label: 'Finanzas',
      icon: 'pi pi-money-bill',
      submenu: [
        { label: 'Tarifas Anuales', icon: 'pi pi-calendar', route: '/finanzas/tarifas' },
        { label: 'Reglas de Descuento', icon: 'pi pi-tag', route: '/finanzas/reglas' },
        { label: 'Simulador de Cuotas', icon: 'pi pi-calculator', route: '/finanzas/calculo' },
      ]
    },
    {
      label: 'Configuración',
      icon: 'pi pi-cog',
      submenu: [
        { label: 'Periodos Escolares', icon: 'pi pi-calendar-plus', route: '/periodos' },
        { label: 'Estudiantes', icon: 'pi pi-users', route: '/estudiantes' },
        { label: 'Asignación de Grupos', icon: 'pi pi-list', route: '/finanzas/grupo-regla' },
      ]
    },
  ];

  expandedMenus: { [key: string]: boolean } = {};

  toggleSubmenu(label: string) {
    this.expandedMenus[label] = !this.expandedMenus[label];
  }

  isMenuExpanded(label: string): boolean {
    return this.expandedMenus[label] || false;
  }
}
