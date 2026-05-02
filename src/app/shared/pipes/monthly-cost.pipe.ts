import { Pipe, PipeTransform } from '@angular/core';

import { PERIODICITY_MONTHS, Subscription } from '../models/subscription.model';

@Pipe({ name: 'monthlyCost', standalone: true })
export class MonthlyCostPipe implements PipeTransform {
  transform(sub: Pick<Subscription, 'price' | 'periodicity'>): number {
    const months = PERIODICITY_MONTHS[sub.periodicity];
    return months > 0 ? sub.price / months : sub.price;
  }
}
