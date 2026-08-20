import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent } from '../../../shared/components/card/card.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    CardComponent,
  ],
  template: `
    <div class="w-full max-w-md mx-auto animate-fade-in">
      <app-card [glass]="true" padding="lg">
        <div class="mb-6 text-center space-y-2">
          <div class="inline-flex p-3 rounded-2xl bg-warm-100/90 border border-warm-200/80 mb-1 shadow-warm-sm">
            <img src="logo.svg" alt="Gestió Asistencia Logo" class="w-10 h-10 object-contain shrink-0" />
          </div>
          <h2 class="font-serif font-bold text-2xl sm:text-3xl text-warm-900 tracking-tight">
            Acceso Institucional
          </h2>
          <p class="text-xs text-warm-500 max-w-xs mx-auto">
            Inicia sesión de forma segura con tu cuenta institucional a través de Keycloak (OAuth2 / PKCE)
          </p>
        </div>

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
      </app-card>
    </div>
  `,
})
export class LoginComponent {
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  isLoading = signal<boolean>(false);

  onLogin() {
    this.isLoading.set(true);
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/app/dashboard';
    this.authService.loginWithKeycloak(returnUrl);
  }
}
