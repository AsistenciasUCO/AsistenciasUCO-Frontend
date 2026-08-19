import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [class]="containerClasses"
      [style.backgroundColor]="bgColor"
      [title]="name"
    >
      <span class="font-bold uppercase select-none text-white tracking-wider">{{ initials }}</span>
    </div>
  `,
})
export class AvatarComponent {
  @Input() name = 'Estudiante UCO';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  get initials(): string {
    if (!this.name) return 'UCO';
    const parts = this.name.trim().split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  get bgColor(): string {
    const colors = ['#059669', '#0284c7', '#7c3aed', '#d97706', '#dc2626', '#0891b2'];
    let hash = 0;
    for (let i = 0; i < this.name.length; i++) {
      hash = this.name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  get containerClasses(): string {
    const base = 'rounded-xl flex items-center justify-center shrink-0 shadow-xs';
    switch (this.size) {
      case 'sm':
        return `${base} w-7 h-7 text-[10px]`;
      case 'lg':
        return `${base} w-11 h-11 text-sm`;
      default:
        return `${base} w-9 h-9 text-xs`;
    }
  }
}
