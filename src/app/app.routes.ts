import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'estudiantes', pathMatch: 'full' },
      { 
        path: 'estudiantes', 
        loadChildren: () => import('./modules/estudiantes/estudiantes.routes').then(m => m.ESTUDIANTES_ROUTES) 
      },
      { 
        path: 'pagos', 
        loadChildren: () => import('./modules/pagos/pagos.routes').then(m => m.PAGOS_ROUTES) 
      },
      { 
        path: 'finanzas', 
        loadChildren: () => import('./modules/finanzas/finanzas.routes').then(m => m.FINANZAS_ROUTES) 
      },
      { 
        path: 'periodos', 
        loadChildren: () => import('./modules/periodo/periodo.routes').then(m => m.PERIODO_ROUTES) 
      },
      { 
        path: 'matriculas', 
        loadChildren: () => import('./modules/matriculas/matriculas.routes').then(m => m.MATRICULAS_ROUTES) 
      }
    ]
  }
];
