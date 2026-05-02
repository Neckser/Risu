import { Routes } from '@angular/router';

export const SUBSCRIPTIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./list/subscriptions-list.component').then((m) => m.SubscriptionsListComponent),
    title: 'Подписки — Risu',
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./edit/subscription-edit.component').then((m) => m.SubscriptionEditComponent),
    title: 'Новая подписка — Risu',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./edit/subscription-edit.component').then((m) => m.SubscriptionEditComponent),
    title: 'Подписка — Risu',
  },
];
