import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [class]="badgeClasses()">
      @if (dot()) {
        <span [class]="dotClasses()"></span>
      }
      <ng-content></ng-content>
    </span>
  `,
})
export class BadgeComponent {
  variant = input<BadgeVariant>('neutral');
  dot = input<boolean>(true);
  size = input<'sm' | 'md'>('md');

  badgeClasses = computed(() => {
    const base = 'inline-flex items-center font-medium rounded-full tracking-wide transition-colors';
    
    const sizes = {
      sm: 'px-2 py-0.5 text-xs gap-1',
      md: 'px-2.5 py-1 text-xs gap-1.5',
    }[this.size()];

    const variants = {
      success: 'bg-emerald-50 text-emerald-800 border border-emerald-200/60',
      warning: 'bg-amber-50 text-amber-800 border border-amber-200/60',
      danger: 'bg-red-50 text-red-800 border border-red-200/60',
      info: 'bg-sky-50 text-sky-800 border border-sky-200/60',
      neutral: 'bg-warm-100 text-warm-700 border border-warm-200/80',
    }[this.variant()];

    return `${base} ${sizes} ${variants}`;
  });

  dotClasses = computed(() => {
    const base = 'w-1.5 h-1.5 rounded-full';
    const dots = {
      success: 'bg-emerald-500',
      warning: 'bg-amber-500',
      danger: 'bg-red-500',
      info: 'bg-sky-500',
      neutral: 'bg-warm-400',
    }[this.variant()];

    return `${base} ${dots}`;
  });
}
