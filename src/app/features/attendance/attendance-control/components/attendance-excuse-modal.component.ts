import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { FormFieldComponent } from '../../../../shared/components/form-field/form-field.component';
import { StudentAttendance } from '../../../../core/models/attendance.model';

@Component({
  selector: 'app-attendance-excuse-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ModalComponent, ButtonComponent, FormFieldComponent],
  template: `
    <app-modal
      [isOpen]="isOpen()"
      title="Registrar Excusa Justificada de Asistencia"
      (closed)="closed.emit()"
    >
      <div class="space-y-4">
        <div class="p-3 bg-primary-50 border border-primary-200 rounded-xl text-xs">
          <span class="text-primary-800 font-bold block">{{ student()?.studentName }}</span>
          <span class="text-primary-600 font-mono">Código: {{ student()?.studentCode }}</span>
        </div>

        <app-form-field label="Causa Institucional de la Excusa" [required]="true">
          <select
            [ngModel]="causa()"
            (ngModelChange)="causa.set($event)"
            class="w-full bg-white text-warm-900 border border-warm-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="INCAPACIDAD_MEDICA">Incapacidad Médica EPS / Bienestar Universitario</option>
            <option value="CALAMIDAD_DOMESTICA">Calamidad Doméstica Comprobada</option>
            <option value="REPRESENTACION_INSTITUCIONAL">Representación Deportiva, Cultural o Académica UCO</option>
            <option value="CASO_FORTUITO">Caso Fortuito o Fuerza Mayor Comprobada</option>
            <option value="DILIGENCIA_OFICIAL">Diligencia Judicial o Administrativa Obligatoria</option>
            <option value="OTRA">Otra Justificación Avalada por la Coordinación</option>
          </select>
        </app-form-field>

        <app-form-field label="Número de Radicado / Observaciones de Soporte">
          <textarea
            [ngModel]="observacion()"
            (ngModelChange)="observacion.set($event)"
            rows="2"
            placeholder="Número de incapacidad médica, certificado EPS o detalle de la justificación..."
            class="w-full bg-white text-warm-900 border border-warm-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
          ></textarea>
        </app-form-field>

        <div modal-footer class="flex items-center justify-end gap-2 w-full pt-2">
          <app-button variant="ghost" size="sm" (clicked)="closed.emit()">
            Cancelar
          </app-button>
          <app-button variant="primary" size="sm" (clicked)="confirmar()">
            Aplicar Excusa
          </app-button>
        </div>
      </div>
    </app-modal>
  `,
})
export class AttendanceExcuseModalComponent {
  isOpen = input.required<boolean>();
  student = input<StudentAttendance | null>(null);

  causa = signal<string>('INCAPACIDAD_MEDICA');
  observacion = signal<string>('');

  confirmed = output<{ causa: string; observacion: string }>();
  closed = output<void>();

  confirmar(): void {
    this.confirmed.emit({
      causa: this.causa(),
      observacion: this.observacion().trim(),
    });
    this.observacion.set('');
  }
}
