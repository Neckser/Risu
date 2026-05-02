import { Injectable, computed, inject } from '@angular/core';

import { SubscriptionsStore } from '@stores/subscriptions.store';

export interface PaymentReminder {
  subscriptionId: string;
  name: string;
  daysLeft: number;
  amount: number;
  currency: string;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly subs = inject(SubscriptionsStore);

  readonly upcoming = computed<PaymentReminder[]>(() => {
    const now = Date.now();
    const reminders: PaymentReminder[] = [];

    for (const s of this.subs.items()) {
      if (!s.isActive) continue;
      const daysLeft = Math.ceil((new Date(s.nextPaymentDate).getTime() - now) / MS_PER_DAY);
      if (daysLeft < 0 || daysLeft > s.notifyDaysBefore) continue;
      reminders.push({
        subscriptionId: s.id,
        name: s.name,
        daysLeft,
        amount: s.price,
        currency: s.currency,
      });
    }
    return reminders.sort((a, b) => a.daysLeft - b.daysLeft);
  });
}
