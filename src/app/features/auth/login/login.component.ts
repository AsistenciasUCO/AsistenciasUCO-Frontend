import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    FormFieldComponent,
    CardComponent,
    ToastComponent,
    ModalComponent,
  ],
  template: `
    <div class="w-full max-w-md mx-auto animate-fade-in">
      <app-card [glass]="true" padding="lg">
        <!-- Header con Logotipo Oficial SVG -->

        <div class="mb-6 text-center space-y-2">
          <div class="inline-flex p-3 rounded-2xl bg-warm-100/90 border border-warm-200/80 mb-1 shadow-warm-sm">
            <img src="logo.svg" alt="Gestió Asistencia Logo" class="w-10 h-10 object-contain shrink-0" />
          </div>
          <h2 class="font-serif font-bold text-2xl sm:text-3xl text-warm-900 tracking-tight">
            Acceso Institucional
          </h2>
          <p class="text-xs text-warm-500 max-w-xs mx-auto">
            Ingresa tus credenciales autorizadas de docente o administrador
          </p>
        </div>

        <!-- Formulario de Autenticación -->
        <form (submit)="onLogin($event)" class="space-y-4" novalidate>
          <app-form-field
            label="Correo Electrónico Institucional"
            [errorMessage]="emailError()"
            [required]="true"
            fieldId="login-email"
          >
            <input
              id="login-email"
              type="email"
              [(ngModel)]="email"
              name="email"
              placeholder="docente@aurora.edu.pe"
              autocomplete="username"
              required
              [attr.aria-invalid]="emailError() ? 'true' : 'false'"
              class="w-full bg-white text-warm-900 border border-warm-300 rounded-xl px-4 py-3 sm:py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-primary-500 transition-all shadow-warm-sm"
            />
          </app-form-field>

          <app-form-field
            label="Contraseña"
            [errorMessage]="passwordError()"
            [required]="true"
            fieldId="login-password"
          >
            <div class="relative w-full">
              <input
                id="login-password"
                [type]="showPassword() ? 'text' : 'password'"
                [(ngModel)]="password"
                name="password"
                placeholder="••••••••"
                autocomplete="current-password"
                required
                [attr.aria-invalid]="passwordError() ? 'true' : 'false'"
                class="w-full bg-white text-warm-900 border border-warm-300 rounded-xl pl-4 pr-12 py-3 sm:py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-primary-500 transition-all shadow-warm-sm"
              />
              <!-- Botón Ojo Mostrar/Ocultar Clave -->
              <button
                type="button"
                (click)="toggleShowPassword()"
                class="absolute right-3 top-3 sm:top-2.5 text-warm-400 hover:text-warm-700 p-1 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                [attr.aria-label]="showPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              >
                @if (showPassword()) {
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.041 10.041 0 012.122-.363c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
                  </svg>
                } @else {
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                }
              </button>
            </div>
          </app-form-field>

          <!-- Checkbox Recordarme + Enlace ¿Olvidaste tu contraseña? -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pt-1">
            <label class="flex items-center gap-2 cursor-pointer text-warm-700 font-medium select-none">
              <input
                type="checkbox"
                [(ngModel)]="rememberMe"
                name="rememberMe"
                class="rounded border-warm-300 text-primary-600 focus:ring-primary-500 w-4 h-4"
              />
              <span>Recordar credenciales</span>
            </label>

            <button
              type="button"
              (click)="isForgotPasswordModalOpen.set(true)"
              class="text-primary-700 font-bold hover:underline text-left sm:text-right transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <app-button
            variant="primary"
            type="submit"
            [fullWidth]="true"
            [loading]="isLoading()"
            size="lg"
          >
            @if (isLoading()) {
              Autenticando...
            } @else {
              Acceder a la Plataforma
            }
          </app-button>
        </form>
      </app-card>

      <!-- MODAL: Recuperación de Contraseña -->
      <app-modal
        [isOpen]="isForgotPasswordModalOpen()"
        title="Recuperar Contraseña Institucional"
        (closed)="isForgotPasswordModalOpen.set(false)"
      >
        <form (submit)="onForgotPasswordSubmit($event)" class="space-y-4">
          <p class="text-xs text-warm-600 leading-relaxed">
            Ingresa tu correo institucional registrado para enviarte las instrucciones de restablecimiento de clave.
          </p>

          <app-form-field label="Correo Electrónico" [required]="true">
            <input
              type="email"
              [(ngModel)]="resetEmail"
              name="resetEmail"
              placeholder="docente@aurora.edu.pe"
              class="w-full bg-white text-warm-900 border border-warm-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </app-form-field>

          <div modal-footer class="flex items-center justify-end gap-2 w-full pt-2">
            <app-button variant="ghost" size="sm" (clicked)="isForgotPasswordModalOpen.set(false)">
              Cancelar
            </app-button>
            <app-button variant="primary" size="sm" type="submit" [loading]="isSendingReset()">
              Enviar Enlace de Recuperación
            </app-button>
          </div>
        </form>
      </app-modal>

      <!-- Feedback Toast -->
      <app-toast
        [visible]="showToast()"
        [message]="toastMessage()"
        [type]="toastType()"
        (dismissed)="showToast.set(false)"
      ></app-toast>
    </div>
  `,
})
export class LoginComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  email = signal<string>('maria.rostagno@aurora.edu.pe');
  password = signal<string>('HashBackend_AbCdEf1234567890');
  rememberMe = signal<boolean>(true);
  showPassword = signal<boolean>(false);
  isLoading = signal<boolean>(false);

  isForgotPasswordModalOpen = signal<boolean>(false);
  resetEmail = signal<string>('maria.rostagno@aurora.edu.pe');
  isSendingReset = signal<boolean>(false);

  emailError = signal<string>('');
  passwordError = signal<string>('');

  showToast = signal<boolean>(false);
  toastMessage = signal<string>('');
  toastType = signal<'success' | 'info' | 'warning' | 'error'>('success');

  toggleShowPassword() {
    this.showPassword.update((v) => !v);
  }

  onLogin(event: Event) {
    event.preventDefault();
    this.emailError.set('');
    this.passwordError.set('');

    if (!this.email()) {
      this.emailError.set('Ingrese su correo electrónico institucional');
      return;
    }
    if (!this.password()) {
      this.passwordError.set('Ingrese su contraseña');
      return;
    }

    this.isLoading.set(true);

    this.authService.login(this.email(), this.password()).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.exitoso) {
          this.toastType.set('success');
          this.toastMessage.set(res.mensajeUsuario || '¡Autenticación exitosa! Bienvenido(a)');
          this.showToast.set(true);
          setTimeout(() => {
            this.router.navigate(['/app/dashboard']);
          }, 600);
        } else {
          this.toastType.set('error');
          this.toastMessage.set(res.mensajeUsuario || 'Error al autenticar');
          this.showToast.set(true);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.toastType.set('error');
        this.toastMessage.set(err?.error?.mensajeUsuario || 'No se pudo conectar con el servidor de autenticación');
        this.showToast.set(true);
      },
    });
  }

  onForgotPasswordSubmit(event: Event) {
    event.preventDefault();
    if (!this.resetEmail()) return;

    this.isSendingReset.set(true);
    setTimeout(() => {
      this.isSendingReset.set(false);
      this.isForgotPasswordModalOpen.set(false);
      this.toastType.set('info');
      this.toastMessage.set(`Se envió el enlace de recuperación a ${this.resetEmail()}`);
      this.showToast.set(true);
    }, 900);
  }
}
