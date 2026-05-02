import { CategoryId } from './category.model';

export type Periodicity = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export type Currency = 'RUB' | 'USD' | 'EUR';

export interface Subscription {
  id: string;
  userId: string;
  name: string;
  price: number;
  currency: Currency;
  category: CategoryId;
  periodicity: Periodicity;
  nextPaymentDate: string;
  notifyDaysBefore: number;
  isActive: boolean;
  notes?: string;
  createdAt: string;
}

export type SubscriptionDraft = Omit<Subscription, 'id' | 'userId' | 'createdAt'>;

export const PERIODICITY_LABELS: Record<Periodicity, string> = {
  weekly: 'Еженедельно',
  monthly: 'Ежемесячно',
  quarterly: 'Ежеквартально',
  yearly: 'Ежегодно',
};

export const PERIODICITY_MONTHS: Record<Periodicity, number> = {
  weekly: 1 / 4.345,
  monthly: 1,
  quarterly: 3,
  yearly: 12,
};

export const CURRENCIES: readonly Currency[] = ['RUB', 'USD', 'EUR'];
