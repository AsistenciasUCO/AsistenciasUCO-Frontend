import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { FormFieldComponent } from '../../../../shared/components/form-field/form-field.component';
import { FormSelectComponent, SelectOption } from '../../../../shared/components/form-select/form-select.component';

@Component({
  selector: 'app-attendance-enrollment-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ModalComponent, ButtonComponent, FormFieldComponent, FormSelectComponent],
  template: `
    <app-modal
      [isOpen]="isOpen()"
      title="Matricular Nuevo Estudiante"
      (closed)="closed.emit()"
    >
      <form (submit)="onSubmit($event)" class="space-y-4">
        <p class="text-xs text-warm-500">Registra directamente al alumno en la asignatura activa.</p>

        <app-form-field
          label="Tipo de Documento"
          [required]="true"
          [errorMessage]="fieldErrors()['tipoIdentificacionId'] ?? ''"
        >
          <app-form-select
            [options]="docTypeOptions()"
            [value]="docType()"
            (valueChange)="docType.set($event)"
            placeholder="Seleccione..."
          ></app-form-select>
        </app-form-field>

        <app-form-field
          label="Número de Identificación"
          [required]="true"
          [errorMessage]="fieldErrors()['numeroIdentificacion'] ?? ''"
        >
          <input
            type="text"
            inputmode="numeric"
            maxlength="10"
            [ngModel]="code()"
            (ngModelChange)="code.set($event)"
            name="studentCode"
            placeholder="Ej. 1017123456"
            class="w-full bg-white text-warm-900 border border-warm-300 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </app-form-field>

        <!-- Primer y Segundo Nombre -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <app-form-field
            label="Primer Nombre"
            [required]="true"
            [errorMessage]="fieldErrors()['primerNombre'] ?? ''"
          >
            <input
              type="text"
              maxlength="50"
              [ngModel]="firstName()"
              (ngModelChange)="firstName.set($event)"
              name="studentFirstName"
              placeholder="Ej. Juan"
              class="w-full bg-white text-warm-900 border border-warm-300 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </app-form-field>

          <app-form-field
            label="Segundo Nombre (Opcional)"
            [errorMessage]="fieldErrors()['segundoNombre'] ?? ''"
          >
            <input
              type="text"
              maxlength="50"
              [ngModel]="secondName()"
              (ngModelChange)="secondName.set($event)"
              name="studentSecondName"
              placeholder="Ej. Carlos"
              class="w-full bg-white text-warm-900 border border-warm-300 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </app-form-field>
        </div>

        <!-- Primer y Segundo Apellido -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <app-form-field
            label="Primer Apellido"
            [required]="true"
            [errorMessage]="fieldErrors()['primerApellido'] ?? ''"
          >
            <input
              type="text"
              maxlength="50"
              [ngModel]="lastName()"
              (ngModelChange)="lastName.set($event)"
              name="studentLastName"
              placeholder="Ej. Pérez"
              class="w-full bg-white text-warm-900 border border-warm-300 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </app-form-field>

          <app-form-field
            label="Segundo Apellido (Opcional)"
            [errorMessage]="fieldErrors()['segundoApellido'] ?? ''"
          >
            <input
              type="text"
              maxlength="50"
              [ngModel]="secondLastName()"
              (ngModelChange)="secondLastName.set($event)"
              name="studentSecondLastName"
              placeholder="Ej. Gómez"
              class="w-full bg-white text-warm-900 border border-warm-300 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </app-form-field>
        </div>

        <app-form-field
          label="Correo Electrónico Institucional"
          [required]="true"
          [errorMessage]="fieldErrors()['correo'] ?? ''"
        >
          <input
            type="email"
            maxlength="100"
            [ngModel]="email()"
            (ngModelChange)="email.set($event)"
            name="studentEmail"
            placeholder="juan.perez@uco.edu.co"
            class="w-full bg-white text-warm-900 border border-warm-300 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </app-form-field>

        <app-form-field
          label="Contraseña"
          [required]="true"
          [errorMessage]="fieldErrors()['password'] ?? ''"
        >
          <input
            type="password"
            minlength="8"
            maxlength="255"
            [ngModel]="password()"
            (ngModelChange)="password.set($event)"
            name="studentPassword"
            placeholder="Mínimo 8 caracteres"
            class="w-full bg-white text-warm-900 border border-warm-300 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </app-form-field>

        <div modal-footer class="flex items-center justify-end gap-2 w-full pt-2">
          <app-button variant="ghost" size="sm" (clicked)="closed.emit()">
            Cancelar
          </app-button>
          <app-button variant="primary" size="sm" type="submit" [loading]="isEnrolling()">
            Matricular en Curso
          </app-button>
        </div>
      </form>
    </app-modal>
  `,
})
export class AttendanceEnrollmentModalComponent {
  isOpen = input.required<boolean>();
  isEnrolling = input<boolean>(false);
  docTypeOptions = input<SelectOption[]>([]);
  fieldErrors = input<Record<string, string | undefined>>({});

  docType = signal<string>('');
  code = signal<string>('');
  firstName = signal<string>('');
  secondName = signal<string>('');
  lastName = signal<string>('');
  secondLastName = signal<string>('');
  email = signal<string>('');
  password = signal<string>('Temporal2026*');

  submitted = output<{
    tipoIdentificacionId: string;
    numeroIdentificacion: string;
    primerNombre: string;
    segundoNombre?: string;
    primerApellido: string;
    segundoApellido?: string;
    correo: string;
    password: string;
  }>();
  closed = output<void>();

  onSubmit(e: Event): void {
    e.preventDefault();
    this.submitted.emit({
      tipoIdentificacionId: this.docType(),
      numeroIdentificacion: this.code().trim(),
      primerNombre: this.firstName().trim(),
      segundoNombre: this.secondName().trim() || undefined,
      primerApellido: this.lastName().trim(),
      segundoApellido: this.secondLastName().trim() || undefined,
      correo: this.email().trim(),
      password: this.password(),
    });
  }
}
