import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { TuiButton } from '@taiga-ui/core';

import { CategoriesStore } from '@stores/categories.store';
import { SubscriptionsStore } from '@stores/subscriptions.store';
import {
  CURRENCIES,
  Currency,
  PERIODICITY_LABELS,
  Periodicity,
  Subscription,
  SubscriptionDraft,
} from '@shared/models/subscription.model';
import { CategoryId } from '@shared/models/category.model';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';

interface SubscriptionForm {
  name: FormControl<string>;
  price: FormControl<number | null>;
  currency: FormControl<Currency>;
  category: FormControl<CategoryId>;
  periodicity: FormControl<Periodicity>;
  nextPaymentDate: FormControl<string>;
  notifyDaysBefore: FormControl<number>;
  isActive: FormControl<boolean>;
  notes: FormControl<string>;
}

const PERIODICITIES: Periodicity[] = ['weekly', 'monthly', 'quarterly', 'yearly'];

const todayIso = (): string => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
};

@Component({
  selector: 'app-subscription-edit',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, TuiButton, PageHeaderComponent],
  templateUrl: './subscription-edit.component.html',
  styleUrl: './subscription-edit.component.scss',
})
export class SubscriptionEditComponent implements OnInit {
  readonly id = input<string | undefined>();

  private readonly fb = inject(FormBuilder);
  private readonly subs = inject(SubscriptionsStore);
  private readonly cats = inject(CategoriesStore);
  private readonly router = inject(Router);

  readonly periodicities = PERIODICITIES;
  readonly currencies = CURRENCIES;
  readonly periodicityLabel = (p: Periodicity): string => PERIODICITY_LABELS[p];

  readonly categories = this.cats.items;
  readonly loading = this.subs.loading;

  readonly form: FormGroup<SubscriptionForm> = this.fb.nonNullable.group({
    name: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(2)]),
    price: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.01)]),
    currency: this.fb.nonNullable.control<Currency>('RUB', [Validators.required]),
    category: this.fb.nonNullable.control<CategoryId>('streaming', [Validators.required]),
    periodicity: this.fb.nonNullable.control<Periodicity>('monthly', [Validators.required]),
    nextPaymentDate: this.fb.nonNullable.control(todayIso(), [Validators.required]),
    notifyDaysBefore: this.fb.nonNullable.control(3, [Validators.required, Validators.min(0)]),
    isActive: this.fb.nonNullable.control(true),
    notes: this.fb.nonNullable.control(''),
  });

  readonly isEdit = computed(() => !!this.id());

  ngOnInit(): void {
    if (!this.cats.loaded()) this.cats.load();
    if (this.id() && !this.subs.loaded()) {
      this.subs.load();
    }
    if (this.id()) {
      this.tryHydrate();
    }
  }

  private tryHydrate(): void {
    const existing = this.subs.items().find((s) => s.id === this.id());
    if (!existing) {
      queueMicrotask(() => {
        const found = this.subs.items().find((s) => s.id === this.id());
        if (found) this.applyValues(found);
      });
      return;
    }
    this.applyValues(existing);
  }

  private applyValues(s: Subscription): void {
    this.form.patchValue({
      name: s.name,
      price: s.price,
      currency: s.currency,
      category: s.category,
      periodicity: s.periodicity,
      nextPaymentDate: s.nextPaymentDate.slice(0, 10),
      notifyDaysBefore: s.notifyDaysBefore,
      isActive: s.isActive,
      notes: s.notes ?? '',
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const draft: SubscriptionDraft = {
      name: v.name,
      price: v.price ?? 0,
      currency: v.currency,
      category: v.category,
      periodicity: v.periodicity,
      nextPaymentDate: new Date(v.nextPaymentDate).toISOString(),
      notifyDaysBefore: v.notifyDaysBefore,
      isActive: v.isActive,
      notes: v.notes || undefined,
    };

    const id = this.id();
    if (id) {
      this.subs.update({ id, patch: draft });
    } else {
      this.subs.create(draft);
    }
    void this.router.navigate(['/subscriptions']);
  }

  cancel(): void {
    void this.router.navigate(['/subscriptions']);
  }
}
