import { Routes } from '@angular/router';
import { MatriculasListComponent } from './pages/matriculas-list/matriculas-list.component';

export const MATRICULAS_ROUTES: Routes = [
    {
        path: '',
        component: MatriculasListComponent
    }
];
