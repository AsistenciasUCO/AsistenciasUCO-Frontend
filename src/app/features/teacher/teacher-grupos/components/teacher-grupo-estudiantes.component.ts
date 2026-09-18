import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Course } from '../../../../core/models/course.model';

@Component({
  selector: 'app-teacher-grupo-estudiantes',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-b-2xl border-x border-b border-warm-200 shadow-warm-sm p-6 space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-warm-100">
        <div>
          <h3 class="font-serif font-bold text-lg text-warm-900">Padrón de Estudiantes Matriculados</h3>
          <p class="text-xs text-warm-500">Listado oficial de estudiantes con asistencia habilitada para este grupo.</p>
        </div>
        <span class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          {{ estudiantes().length }} de {{ curso()?.cupoMaximo || 35 }} Cupos
        </span>
      </div>

      @if (cargando()) {
        <div class="p-6 space-y-3">
          @for (n of [1, 2, 3]; track n) {
            <div class="h-12 bg-warm-100 rounded-xl animate-pulse"></div>
          }
        </div>
      } @else if (estudiantes().length === 0) {
        <div class="p-12 text-center text-warm-400">
          <p class="text-sm">No hay estudiantes matriculados en este grupo actualmente.</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          @for (est of estudiantes(); track est.studentId || est.id) {
            <div class="p-3.5 rounded-xl bg-warm-50 border border-warm-200 flex items-center justify-between gap-3">
              <div class="min-w-0">
                <p class="font-bold text-xs text-warm-900 truncate">{{ est.studentName || est.nombres + ' ' + est.apellidos }}</p>
                <p class="text-[11px] font-mono text-warm-500">Doc / ID: {{ est.studentCode || est.numeroIdentificacion || 'N/A' }}</p>
              </div>
              <span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                Activo
              </span>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class TeacherGrupoEstudiantesComponent {
  estudiantes = input<any[]>([]);
  cargando = input<boolean>(false);
  curso = input<Course | null>(null);
}
