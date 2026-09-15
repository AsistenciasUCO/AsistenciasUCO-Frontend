import { Component, input, output, signal, OnChanges, SimpleChanges, Injectable, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastData {
  visible: boolean;
  message: string;
  type: ToastType;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private state = signal<ToastData>({
    visible: false,
    message: '',
    type: 'success',
  });

  currentToast = this.state.asReadonly();

  show(message: string, type: ToastType = 'success'): void {
    this.state.set({ visible: true, message, type });
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error');
  }

  info(message: string): void {
    this.show(message, 'info');
  }

  warning(message: string): void {
    this.show(message, 'warning');
  }

  dismiss(): void {
    this.state.update((s) => ({ ...s, visible: false }));
  }
}

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible() || isExiting()) {
      <div
        [class]="containerClasses()"
        role="status"
        aria-live="polite"
      >
        <div class="flex items-center gap-3">
          @switch (type()) {
            @case ('success') {
              <span class="p-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl shrink-0">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </span>
            }
            @case ('info') {
              <span class="p-1.5 bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-xl shrink-0">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            }
            @case ('warning') {
              <span class="p-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl shrink-0">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </span>
            }
            @case ('error') {
              <span class="p-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl shrink-0">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            }
          }

          <div class="flex-1 text-xs font-semibold text-warm-100 pr-2 leading-tight">
            {{ message() }}
          </div>

          <button
            type="button"
            (click)="triggerDismiss()"
            class="text-warm-400 hover:text-white p-1 rounded-lg transition-colors shrink-0 focus:outline-none"
            aria-label="Cerrar notificación"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    }
  `,
})
export class ToastComponent implements OnChanges {
  visible = input<boolean>(false);
  message = input<string>('');
  type = input<ToastType>('success');
  duration = input<number>(3500);

  dismissed = output<void>();

  isExiting = signal<boolean>(false);
  private timerId: ReturnType<typeof setTimeout> | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']) {
      if (this.visible()) {
        this.isExiting.set(false);
        this.startAutoDismissTimer();
      }
    }
  }

  private startAutoDismissTimer(): void {
    this.clearTimer();
    this.timerId = setTimeout(() => {
      this.triggerDismiss();
    }, this.duration());
  }

  triggerDismiss(): void {
    this.clearTimer();
    this.isExiting.set(true);

    setTimeout(() => {
      this.isExiting.set(false);
      this.dismissed.emit();
    }, 250);
  }

  private clearTimer(): void {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  containerClasses(): string {
    const base = 'fixed top-16 right-6 z-50 flex flex-col gap-2 p-3.5 bg-warm-950 text-white rounded-2xl shadow-warm-lg border border-primary-800/80 max-w-xs sm:max-w-sm w-full select-none';
    const anim = this.isExiting() ? 'animate-toast-exit' : 'animate-toast-enter';
    return `${base} ${anim}`;
  }
}
