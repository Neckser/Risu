export type CategoryId = 'streaming' | 'gaming' | 'utility' | 'work' | 'education' | 'other';

export interface Category {
  id: CategoryId;
  label: string;
  icon: string;
  monthlyLimit: number | null;
}

export const DEFAULT_CATEGORIES: readonly Category[] = [
  { id: 'streaming', label: 'Стриминг', icon: '@tui.tv', monthlyLimit: null },
  { id: 'gaming', label: 'Игры', icon: '@tui.gamepad-2', monthlyLimit: null },
  { id: 'utility', label: 'Утилиты', icon: '@tui.wrench', monthlyLimit: null },
  { id: 'work', label: 'Работа', icon: '@tui.briefcase', monthlyLimit: null },
  { id: 'education', label: 'Образование', icon: '@tui.graduation-cap', monthlyLimit: null },
  { id: 'other', label: 'Прочее', icon: '@tui.box', monthlyLimit: null },
];
