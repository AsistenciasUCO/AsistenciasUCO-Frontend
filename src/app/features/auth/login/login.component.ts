import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole } from '../../../core/models/user.model';
import { MOCK_USERS_LIST } from '../../../core/mocks/user.mock';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    CardComponent,
    BadgeComponent,
    AvatarComponent,
  ],
  template: `
    <div class="w-full max-w-lg mx-auto animate-fade-in space-y-4">
      <app-card [glass]="true" padding="lg">
        <div class="mb-5 text-center space-y-2">
          <div class="inline-flex p-3 rounded-2xl bg-warm-100/90 border border-warm-200/80 mb-1 shadow-warm-sm">
            <img src="logo.svg" alt="Gestió Asistencia Logo" class="w-10 h-10 object-contain shrink-0" />
          </div>
          <h2 class="font-serif font-bold text-2xl sm:text-3xl text-warm-900 tracking-tight">
            Gestió Asistencia UCO
          </h2>
          <p class="text-xs text-warm-500 max-w-sm mx-auto">
            Selecciona uno de los 5 usuarios de prueba para ingresar directamente y evaluar las vistas por rol.
          </p>
        </div>

        @if (isMockMode()) {
          <!-- Selector de Usuarios de Prueba -->
          <div class="space-y-2.5">
            <div class="flex items-center justify-between px-1">
              <span class="text-xs font-bold uppercase tracking-wider text-warm-500">
                Usuarios de Prueba (Mocks Activos)
              </span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-50 text-primary-800 border border-primary-200">
                Desacoplado
              </span>
            </div>

            <div class="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              @for (user of testUsers; track user.id) {
                <button
                  type="button"
                  (click)="loginWithMockUser(user.role)"
                  class="w-full flex items-center justify-between p-3 rounded-xl border border-warm-200/90 bg-white hover:bg-warm-50/80 hover:border-primary-400/80 hover:shadow-warm-sm transition-all duration-200 text-left group"
                >
                  <div class="flex items-center gap-3 min-w-0">
                    <app-avatar [name]="user.name" size="md"></app-avatar>
                    <div class="min-w-0">
                      <div class="flex items-center gap-2">
                        <p class="text-xs font-bold text-warm-900 truncate group-hover:text-primary-800">
                          {{ user.name }}
                        </p>
                      </div>
                      <p class="text-[11px] text-warm-500 truncate">{{ user.email }}</p>
                      <p class="text-[10px] text-warm-400 truncate">{{ user.department }}</p>
                    </div>
                  </div>

                  <div class="shrink-0 flex items-center gap-2">
                    <app-badge [variant]="getRoleBadgeVariant(user.role)">
                      {{ user.role }}
                    </app-badge>
                    <svg class="w-4 h-4 text-warm-300 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              }
            </div>
          </div>
        } @else {
          <div class="space-y-4 pt-2">
            <app-button
              variant="primary"
              type="button"
              [fullWidth]="true"
              [loading]="isLoading()"
              size="lg"
              (clicked)="onLogin()"
            >
              Iniciar Sesión con Keycloak
            </app-button>
          </div>
        }
      </app-card>
    </div>
  `,
})
export class LoginComponent {
  private authService = inject(AuthService);
  isLoading = signal<boolean>(false);
  isMockMode = this.authService.isMockMode;
  testUsers = MOCK_USERS_LIST;

  loginWithMockUser(role: UserRole): void {
    this.authService.loginAsMockUser(role, true);
  }

  onLogin(): void {
    this.isLoading.set(true);
    this.authService.loginWithKeycloak();
  }

  getRoleBadgeVariant(role: UserRole): 'success' | 'warning' | 'danger' | 'info' | 'neutral' {
    switch (role) {
      case 'ADMINISTRADOR':
      case 'ADMIN':
        return 'danger';
      case 'DECANO':
        return 'warning';
      case 'COORDINADOR':
        return 'info';
      case 'DOCENTE':
        return 'success';
      case 'ESTUDIANTE':
        return 'neutral';
      default:
        return 'neutral';
    }
  }
}
