import { Routes } from '@angular/router';

import { guestGuard } from '@core/auth/auth.guard';
import { AuthShellComponent } from './auth-shell.component';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    component: AuthShellComponent,
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./login/login.component').then((m) => m.LoginComponent),
        title: 'Вход — Risu',
      },
      {
        path: 'register',
        loadComponent: () => import('./register/register.component').then((m) => m.RegisterComponent),
        title: 'Регистрация — Risu',
      },
      { path: '', pathMatch: 'full', redirectTo: 'login' },
    ],
  },
];
