import { Pipe, PipeTransform } from '@angular/core';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

@Pipe({ name: 'daysUntil', standalone: true })
export class DaysUntilPipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    if (!value) return '—';
    const target = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(target.getTime())) return '—';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayDiff = Math.ceil((target.getTime() - today.getTime()) / MS_PER_DAY);

    if (dayDiff < 0) return `${-dayDiff} дн. назад`;
    if (dayDiff === 0) return 'Сегодня';
    if (dayDiff === 1) return 'Завтра';
    if (dayDiff < 7) return `Через ${dayDiff} дн.`;
    if (dayDiff < 30) return `Через ${Math.round(dayDiff / 7)} нед.`;
    return target.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' });
  }
}
