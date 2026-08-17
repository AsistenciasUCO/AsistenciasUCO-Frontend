import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { FormSelectComponent, SelectOption } from '../../../shared/components/form-select/form-select.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ToastComponent } from '../../../shared/components/toast/toast.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ButtonComponent,
    FormFieldComponent,
    FormSelectComponent,
    CardComponent,
    ToastComponent,
  ],
  template: `
    <app-card [glass]="true" padding="lg">
      <div class="mb-6 text-center">
        <h2 class="font-serif font-bold text-2xl text-warm-900 tracking-tight">Registro Institucional</h2>
        <p class="text-xs text-warm-500 mt-1">Solicitud de alta de usuario docente o administrativo</p>
      </div>

      <form (submit)="onRegister($event)" class="space-y-3.5">
        <app-form-field label="Nombre Completo" [required]="true">
          <input
            type="text"
            [(ngModel)]="name"
            name="name"
            placeholder="Ej. Dr. Roberto Carlos Sánchez"
            class="w-full bg-white text-warm-900 border border-warm-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-warm-sm"
          />
        </app-form-field>

        <app-form-field label="Correo Institucional" [required]="true">
          <input
            type="email"
            [(ngModel)]="email"
            name="email"
            placeholder="roberto.sanchez@aurora.edu.pe"
            class="w-full bg-white text-warm-900 border border-warm-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-warm-sm"
          />
        </app-form-field>

        <app-form-field label="Rol Institucional" [required]="true">
          <app-form-select
            [options]="roleOptions"
            [value]="role()"
            (valueChange)="role.set($event)"
            placeholder="Seleccione su rol..."
          ></app-form-select>
        </app-form-field>

        <app-form-field label="Contraseña" [required]="true">
          <input
            type="password"
            [(ngModel)]="password"
            name="password"
            placeholder="Mínimo 8 caracteres"
            class="w-full bg-white text-warm-900 border border-warm-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-warm-sm"
          />
        </app-form-field>

        <app-button
          variant="primary"
          type="submit"
          [fullWidth]="true"
          [loading]="isLoading()"
        >
          Crear Cuenta Institucional
        </app-button>
      </form>

      <div class="mt-6 pt-4 border-t border-warm-200 text-center text-xs text-warm-600">
        ¿Ya posees una cuenta?
        <a routerLink="/login" class="text-primary-700 font-semibold hover:underline ml-1">Inicia sesión</a>
      </div>
    </app-card>

    <app-toast
      [visible]="showToast()"
      [message]="toastMessage()"
      type="success"
      (dismissed)="showToast.set(false)"
    ></app-toast>
  `,
})
export class RegisterComponent {
  private router = inject(Router);

  name = signal<string>('');
  email = signal<string>('');
  role = signal<string>('DOCENTE');
  password = signal<string>('');
  isLoading = signal<boolean>(false);

  showToast = signal<boolean>(false);
  toastMessage = signal<string>('');

  roleOptions: SelectOption[] = [
    { value: 'DOCENTE', label: 'Docente / Catedrático' },
    { value: 'PREFECTO', label: 'Prefecto de Asistencia' },
    { value: 'ADMIN', label: 'Administrador de Sede' },
  ];

  onRegister(event: Event) {
    event.preventDefault();
    this.isLoading.set(true);

    setTimeout(() => {
      this.isLoading.set(false);
      this.toastMessage.set('¡Registro completado! Redirigiendo...');
      this.showToast.set(true);

      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1000);
    }, 1200);
  }
}
