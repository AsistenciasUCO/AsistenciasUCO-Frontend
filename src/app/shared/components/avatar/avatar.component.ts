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
      [attr.aria-label]="name"
    >
      <span class="font-serif font-bold uppercase select-none text-white tracking-normal leading-none drop-shadow-xs">
        {{ letter }}
      </span>
    </div>
  `,
})
export class AvatarComponent {
  @Input() name = 'Usuario UCO';
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';

  /**
   * Obtiene la letra inicial representativa del nombre del usuario,
   * omitiendo títulos académicos (Dr., Ing., Prof., etc.).
   */
  get letter(): string {
    if (!this.name) return 'U';
    const clean = this.name.replace(/^(Dr\.|Dra\.|Ing\.|Prof\.|Lic\.|Sr\.|Sra\.)\s+/i, '').trim();
    return clean ? clean.charAt(0).toUpperCase() : 'U';
  }

  /**
   * Genera un color armónico y consistente para el usuario dentro de la paleta institucional.
   */
  get bgColor(): string {
    // Paleta seleccionada: Bosque Esmeralda, Índigo Académico, Ámbar Solar, Vino/Ciruela, Verde Azulado y Pizarra
    const colors = [
      '#065f46', // Esmeralda profundo
      '#047857', // Esmeralda UCO
      '#1e40af', // Azul institucional
      '#b45309', // Oro ámbar
      '#0f766e', // Turquesa sobrio
      '#86198f', // Ciruela académico
      '#334155', // Pizarra grafito
      '#0284c7', // Azul cerúleo
    ];
    let hash = 0;
    const clean = this.name.replace(/^(Dr\.|Dra\.|Ing\.|Prof\.|Lic\.|Sr\.|Sra\.)\s+/i, '').trim();
    for (let i = 0; i < clean.length; i++) {
      hash = clean.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  get containerClasses(): string {
    const base = 'flex items-center justify-center shrink-0 shadow-xs border border-white/25 ring-1 ring-black/5 transition-transform duration-150';
    switch (this.size) {
      case 'xs':
        return `${base} w-6 h-6 text-xs rounded-lg`;
      case 'sm':
        return `${base} w-8 h-8 text-xs rounded-xl`;
      case 'lg':
        return `${base} w-12 h-12 text-base rounded-2xl`;
      case 'xl':
        return `${base} w-14 h-14 text-xl rounded-2xl`;
      default:
        return `${base} w-10 h-10 text-sm rounded-xl`;
    }
  }
}
