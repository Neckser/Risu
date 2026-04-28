export type SubscriptionCategory = 'streaming' | 'gaming' | 'utility' | 'work' | 'other';

export interface Subscription {
  id: string;
  name: string;
  price: number;
  currency: string;
  category: SubscriptionCategory;
  nextPaymentDate: string;
  periodicity: 'monthly' | 'yearly';
  isActive: boolean;
}