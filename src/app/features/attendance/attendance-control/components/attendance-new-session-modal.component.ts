import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { FormFieldComponent } from '../../../../shared/components/form-field/form-field.component';
import { Course } from '../../../../core/models/course.model';

@Component({
  selector: 'app-attendance-new-session-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ModalComponent, ButtonComponent, FormFieldComponent],
  template: `
    <app-modal
      [isOpen]="isOpen()"
      title="Crear Nueva Sesión de Clase"
      (closed)="closed.emit()"
    >
      <form (submit)="onSubmit($event)" class="space-y-4">
        <p class="text-xs text-warm-600">
          Crea una nueva sesión para {{ course()?.name }} ({{ course()?.code }}).
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <app-form-field label="Tipo de Sesión" [required]="true">
            <select
              [ngModel]="tipo()"
              (ngModelChange)="tipo.set($event)"
              name="tipoSesion"
              class="w-full bg-white text-warm-900 border border-warm-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="REGULAR">Sesión Regular de Cronograma</option>
              <option value="EXTRAORDINARIA">Sesión Extraordinaria</option>
              <option value="REPOSICION">Sesión de Reposición</option>
            </select>
          </app-form-field>

          <app-form-field label="Fecha de la Sesión" [required]="true">
            <input
              type="date"
              [ngModel]="date()"
              (ngModelChange)="date.set($event)"
              name="fechaSesion"
              required
              class="w-full bg-white text-warm-900 border border-warm-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </app-form-field>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <app-form-field label="Hora Inicio" [required]="true">
            <input
              type="time"
              [ngModel]="startTime()"
              (ngModelChange)="startTime.set($event)"
              name="horaInicio"
              required
              class="w-full bg-white text-warm-900 border border-warm-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </app-form-field>

          <app-form-field label="Hora Fin" [required]="true">
            <input
              type="time"
              [ngModel]="endTime()"
              (ngModelChange)="endTime.set($event)"
              name="horaFin"
              required
              class="w-full bg-white text-warm-900 border border-warm-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </app-form-field>
        </div>

        <app-form-field label="Aula / Espacio Físico">
          <input
            type="text"
            [ngModel]="room()"
            (ngModelChange)="room.set($event)"
            name="aula"
            placeholder="Ej. Aula 302, Laboratorio 1..."
            class="w-full bg-white text-warm-900 border border-warm-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </app-form-field>

        <app-form-field label="Título de la Sesión" [required]="true">
          <input
            type="text"
            [ngModel]="title()"
            (ngModelChange)="title.set($event)"
            name="titulo"
            required
            placeholder="Ej. Sesión #1 - Presentación y Fundamentos"
            class="w-full bg-white text-warm-900 border border-warm-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </app-form-field>

        <app-form-field label="Temática / Descripción">
          <textarea
            [ngModel]="topic()"
            (ngModelChange)="topic.set($event)"
            name="descripcion"
            rows="2"
            placeholder="Breve descripción del tema a tratar..."
            class="w-full bg-white text-warm-900 border border-warm-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
          ></textarea>
        </app-form-field>

        <div modal-footer class="flex items-center justify-end gap-2 w-full pt-2">
          <app-button
            variant="ghost"
            size="sm"
            [disabled]="isCreating()"
            (clicked)="closed.emit()"
          >
            Cancelar
          </app-button>
          <app-button
            variant="primary"
            size="sm"
            type="submit"
            [loading]="isCreating()"
            [disabled]="isCreating() || !title().trim() || !date()"
          >
            Crear Sesión
          </app-button>
        </div>
      </form>
    </app-modal>
  `,
})
export class AttendanceNewSessionModalComponent {
  isOpen = input.required<boolean>();
  course = input<Course | null | undefined>(null);
  isCreating = input<boolean>(false);

  tipo = signal<'REGULAR' | 'EXTRAORDINARIA' | 'REPOSICION'>('REGULAR');
  date = signal<string>(new Date().toISOString().split('T')[0]);
  startTime = signal<string>('08:00');
  endTime = signal<string>('10:00');
  room = signal<string>('');
  title = signal<string>('');
  topic = signal<string>('');

  submitted = output<{
    tipo: 'REGULAR' | 'EXTRAORDINARIA' | 'REPOSICION';
    date: string;
    startTime: string;
    endTime: string;
    room: string;
    title: string;
    topic: string;
  }>();
  closed = output<void>();

  onSubmit(e: Event): void {
    e.preventDefault();
    if (!this.title().trim() || !this.date()) return;
    this.submitted.emit({
      tipo: this.tipo(),
      date: this.date(),
      startTime: this.startTime(),
      endTime: this.endTime(),
      room: this.room().trim(),
      title: this.title().trim(),
      topic: this.topic().trim(),
    });
  }
}
