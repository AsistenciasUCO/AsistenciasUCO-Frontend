import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { FormSelectComponent, SelectOption } from '../../../shared/components/form-select/form-select.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { CatalogService } from '../../../core/services/catalog.service';
import { UserService, CreateUserDTO } from '../../../core/services/user.service';

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
        <!-- Tipo y Número de Identificación -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <app-form-field label="Tipo de Documento" [required]="true">
            <app-form-select
              [options]="documentTypeOptions()"
              [value]="tipoIdentificacionId"
              (valueChange)="tipoIdentificacionId = $event"
              placeholder="Seleccione tipo..."
            ></app-form-select>
          </app-form-field>

          <app-form-field label="Número de Documento" [required]="true">
            <input
              type="number"
              [(ngModel)]="numeroIdentificacion"
              name="numeroIdentificacion"
              placeholder="Ej. 1017123456"
              required
              class="w-full bg-white text-warm-900 border border-warm-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-warm-sm"
            />
          </app-form-field>
        </div>

        <!-- Primer y Segundo Nombre -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <app-form-field label="Primer Nombre" [required]="true">
            <input
              type="text"
              [(ngModel)]="primerNombre"
              name="primerNombre"
              placeholder="Ej. Roberto"
              required
              class="w-full bg-white text-warm-900 border border-warm-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-warm-sm"
            />
          </app-form-field>

          <app-form-field label="Segundo Nombre (Opcional)">
            <input
              type="text"
              [(ngModel)]="segundoNombre"
              name="segundoNombre"
              placeholder="Ej. Carlos"
              class="w-full bg-white text-warm-900 border border-warm-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-warm-sm"
            />
          </app-form-field>
        </div>

        <!-- Primer y Segundo Apellido -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <app-form-field label="Primer Apellido" [required]="true">
            <input
              type="text"
              [(ngModel)]="primerApellido"
              name="primerApellido"
              placeholder="Ej. Sánchez"
              required
              class="w-full bg-white text-warm-900 border border-warm-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-warm-sm"
            />
          </app-form-field>

          <app-form-field label="Segundo Apellido" [required]="true">
            <input
              type="text"
              [(ngModel)]="segundoApellido"
              name="segundoApellido"
              placeholder="Ej. Gómez"
              required
              class="w-full bg-white text-warm-900 border border-warm-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-warm-sm"
            />
          </app-form-field>
        </div>

        <app-form-field label="Correo Institucional" [required]="true">
          <input
            type="email"
            [(ngModel)]="email"
            name="email"
            placeholder="roberto.sanchez@uco.edu.co"
            required
            class="w-full bg-white text-warm-900 border border-warm-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-warm-sm"
          />
        </app-form-field>

        <app-form-field label="Rol Institucional" [required]="true">
          <app-form-select
            [options]="roleOptions"
            [value]="role"
            (valueChange)="role = $event"
            placeholder="Seleccione su rol..."
          ></app-form-select>
        </app-form-field>

        <app-form-field label="Contraseña / Clave" [required]="true">
          <input
            type="password"
            [(ngModel)]="password"
            name="password"
            placeholder="Mínimo 8 caracteres"
            required
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
      [type]="toastType()"
      (dismissed)="showToast.set(false)"
    ></app-toast>
  `,
})
export class RegisterComponent implements OnInit {
  private router = inject(Router);
  private catalogService = inject(CatalogService);
  private userService = inject(UserService);

  tipoIdentificacionId = 'A1B2C3D4-0000-0000-0000-000000000001';
  numeroIdentificacion = '';
  primerNombre = '';
  segundoNombre = '';
  primerApellido = '';
  segundoApellido = '';
  email = '';
  role = 'DOCENTE';
  password = '';

  isLoading = signal<boolean>(false);
  showToast = signal<boolean>(false);
  toastMessage = signal<string>('');
  toastType = signal<'success' | 'error'>('success');

  documentTypeOptions = signal<SelectOption[]>([]);

  roleOptions: SelectOption[] = [
    { value: 'DOCENTE', label: 'Docente / Catedrático' },
    { value: 'PREFECTO', label: 'Prefecto de Asistencia' },
    { value: 'ADMIN', label: 'Administrador de Sede' },
  ];

  ngOnInit(): void {
    this.catalogService.getIdentityDocumentTypes().subscribe({
      next: (res) => {
        if (res.exitoso && res.datos) {
          const options: SelectOption[] = res.datos.map((doc) => ({
            value: doc.id,
            label: `${doc.tipoIdentificacion} - ${doc.nombre}`,
          }));
          this.documentTypeOptions.set(options);
          if (options.length > 0) {
            this.tipoIdentificacionId = options[0].value;
          }
        }
      },
    });
  }

  onRegister(event: Event) {
    event.preventDefault();

    if (
      !this.tipoIdentificacionId ||
      !this.numeroIdentificacion ||
      !this.primerNombre ||
      !this.primerApellido ||
      !this.segundoApellido ||
      !this.email ||
      !this.password
    ) {
      this.toastType.set('error');
      this.toastMessage.set('Por favor completa todos los campos obligatorios.');
      this.showToast.set(true);
      return;
    }

    this.isLoading.set(true);

    const dto: CreateUserDTO = {
      tipoIdIdentificacion: this.tipoIdentificacionId,
      numeroIdentificacion: this.numeroIdentificacion,
      primerNombre: this.primerNombre,
      segundoNombre: this.segundoNombre,
      primerApellido: this.primerApellido,
      segundoApellido: this.segundoApellido,
      correo: this.email,
      password: this.password,
    };

    this.userService.createUser(dto).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.exitoso) {
          this.toastType.set('success');
          this.toastMessage.set(res.mensajeUsuario || '¡Registro completado exitosamente! Redirigiendo...');
          this.showToast.set(true);

          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1200);
        } else {
          this.toastType.set('error');
          this.toastMessage.set(res.mensajeUsuario || 'Error al completar el registro.');
          this.showToast.set(true);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.toastType.set('error');
        this.toastMessage.set(err?.error?.mensajeUsuario || 'No se pudo conectar con el servidor.');
        this.showToast.set(true);
      },
    });
  }
}


