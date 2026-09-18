import { Component, ChangeDetectionStrategy, input, output, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormFieldComponent } from '../../../../shared/components/form-field/form-field.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';

@Component({
  selector: 'app-teacher-sesion-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, FormFieldComponent, ButtonComponent],
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between bg-white p-4 rounded-2xl border border-warm-200 shadow-warm-sm">
        <button
          type="button"
          (click)="cancelar.emit()"
          class="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-warm-700 hover:text-warm-950 bg-warm-50 hover:bg-warm-100 border border-warm-200 px-3.5 py-2 rounded-xl transition-all shadow-xs"
        >
          <svg class="w-4 h-4 text-warm-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a Sesiones de {{ codigoCurso() }}
        </button>

        <span class="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
          {{ modo() === 'CREAR' ? 'Programación Extraordinaria' : 'Modificación de Bloque Horario' }}
        </span>
      </div>

      <div class="bg-white p-6 sm:p-8 rounded-2xl border border-warm-200 shadow-warm-sm max-w-2xl mx-auto space-y-6">
        <div>
          <h2 class="font-serif font-bold text-2xl text-warm-900">
            {{ modo() === 'CREAR' ? 'Programar Sesión Extraordinaria o Reposición' : 'Modificar Horario y Aula de la Sesión' }}
          </h2>
          <p class="text-sm text-warm-600 mt-1">
            Establece la fecha, horario de inicio y fin, aula y temática para este bloque de clase.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="sm:col-span-2">
            <app-form-field label="Tipo de Sesión" [required]="true">
              <select
                [(ngModel)]="form().tipo"
                class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm text-warm-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="EXTRAORDINARIA">Sesión Extraordinaria</option>
                <option value="REPOSICION">Sesión de Reposición</option>
                <option value="REGULAR">Sesión Regular Ordinaria</option>
              </select>
            </app-form-field>
          </div>

          <div class="sm:col-span-2">
            <app-form-field label="Título de la Sesión" [required]="true">
              <input
                type="text"
                [(ngModel)]="form().title"
                placeholder="Ej. Taller Extraordinario de Nivelación Previa al Examen"
                class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </app-form-field>
          </div>

          <div class="sm:col-span-2">
            <app-form-field label="Temática / Descripción" [required]="true">
              <textarea
                [(ngModel)]="form().topic"
                rows="3"
                placeholder="Describe los temas a abordar en este bloque..."
                class="w-full p-3 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              ></textarea>
            </app-form-field>
          </div>

          <app-form-field label="Fecha de la Sesión" [required]="true">
            <input
              type="date"
              [(ngModel)]="form().date"
              class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </app-form-field>

          <app-form-field label="Aula Asignada" [required]="true">
            <input
              type="text"
              [(ngModel)]="form().room"
              placeholder="Ej. Aula A-204"
              class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </app-form-field>

          <app-form-field label="Hora de Inicio" [required]="true">
            <input
              type="time"
              [(ngModel)]="form().startTime"
              class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </app-form-field>

          <app-form-field label="Hora de Fin" [required]="true">
            <input
              type="time"
              [(ngModel)]="form().endTime"
              class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </app-form-field>
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-warm-100">
          <app-button variant="secondary" size="md" (clicked)="cancelar.emit()">
            Cancelar
          </app-button>
          <app-button
            variant="primary"
            size="md"
            [disabled]="!form().title?.trim() || !form().date"
            (clicked)="guardar.emit()"
          >
            <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            {{ modo() === 'CREAR' ? 'Programar Sesión' : 'Guardar Horario' }}
          </app-button>
        </div>
      </div>
    </div>
  `,
})
export class TeacherSesionFormComponent {
  modo = input<'CREAR' | 'EDITAR'>('CREAR');
  codigoCurso = input<string>('');
  form = model<any>({
    title: '',
    topic: '',
    date: '',
    startTime: '08:00',
    endTime: '10:00',
    room: '',
    tipo: 'EXTRAORDINARIA',
    sessionNumber: 1,
  });

  cancelar = output<void>();
  guardar = output<void>();
}
