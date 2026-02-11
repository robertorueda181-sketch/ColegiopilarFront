import { Routes } from '@angular/router';
import { ReglasComponent } from './pages/reglas/reglas.component';
import { TarifasAnualesComponent } from './pages/tarifas/tarifas-anuales.component';
import { GrupoReglaComponent } from './pages/grupo-regla/grupo-regla.component';

export const FINANZAS_ROUTES: Routes = [
    { path: 'reglas', component: ReglasComponent },
    { path: 'grupo-regla', component: GrupoReglaComponent },
    { path: 'tarifas', component: TarifasAnualesComponent },
    { path: '', redirectTo: 'tarifas', pathMatch: 'full' } // Default
];
