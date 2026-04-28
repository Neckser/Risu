import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { SubscriptionsStore } from '../../store/subscriptions.store';
import { TuiButton, TuiDataList } from '@taiga-ui/core';
import { TuiDataListWrapper } from '@taiga-ui/kit';
import { TuiInputModule, TuiInputNumberModule, TuiSelectModule } from '@taiga-ui/legacy';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TuiButton,
    TuiDataList,
    TuiDataListWrapper,
    TuiInputModule,
    TuiInputNumberModule,
    TuiSelectModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  readonly store = inject(SubscriptionsStore);
  private readonly fb = inject(FormBuilder);

  readonly categories = ['streaming', 'gaming', 'utility', 'work', 'other'];

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    price: [null as number | null, [Validators.required, Validators.min(1)]],
    category: ['streaming' as const, [Validators.required]]
  });

  onSubmit() {
    if (this.form.valid) {
      const { name, price, category } = this.form.value;
      this.store.addSubscription({
        id: crypto.randomUUID(),
        name: name!,
        price: price!,
        category: category as any,
        currency: 'RUB',
        nextPaymentDate: new Date().toISOString(),
        periodicity: 'monthly',
        isActive: true
      });
      this.form.reset({ category: 'streaming' });
    }
  }

  deleteSub(id: string) {
    this.store.removeSubscription(id);
  }

  toggleSub(id: string) {
    this.store.toggleStatus(id);
  }
}