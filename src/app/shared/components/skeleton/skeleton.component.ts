import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'card';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [class]="skeletonClasses()"
      [style.width]="width()"
      [style.height]="height()"
      aria-hidden="true"
    ></div>
  `,
})
export class SkeletonComponent {
  variant = input<SkeletonVariant>('text');
  width = input<string>('100%');
  height = input<string>('');

  skeletonClasses = computed(() => {
    const base = 'bg-warm-200/80 animate-pulse transition-opacity';

    switch (this.variant()) {
      case 'circular':
        return `${base} rounded-full aspect-square`;
      case 'rectangular':
        return `${base} rounded-xl`;
      case 'card':
        return `${base} rounded-2xl min-h-[160px]`;
      case 'text':
      default:
        return `${base} rounded-md h-4 my-1`;
    }
  });
}
