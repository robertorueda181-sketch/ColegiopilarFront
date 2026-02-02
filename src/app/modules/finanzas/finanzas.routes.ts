import { Routes } from '@angular/router';
import { ReglasComponent } from './pages/reglas/reglas.component';
import { TarifasAnualesComponent } from './pages/tarifas/tarifas-anuales.component';
import { CalculoCuotasComponent } from './pages/calculo/calculo-cuotas.component';

export const FINANZAS_ROUTES: Routes = [
    { path: 'reglas', component: ReglasComponent },
    { path: 'tarifas', component: TarifasAnualesComponent },
    { path: 'calculo', component: CalculoCuotasComponent },
    { path: '', redirectTo: 'tarifas', pathMatch: 'full' } // Default
];
