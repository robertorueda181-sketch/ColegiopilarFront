import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  template: `
    <div class="layout-wrapper">
      <app-sidebar></app-sidebar>
      <div class="layout-main">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .layout-wrapper {
      display: flex;
      min-height: 100vh;
      background-color: #f8f9fa;
    }
    .layout-main {
      margin-left: 250px; /* Ancho del sidebar */
      padding: 2rem;
      width: calc(100% - 250px);
      flex: 1;
    }
  `]
})
export class MainLayoutComponent {}
