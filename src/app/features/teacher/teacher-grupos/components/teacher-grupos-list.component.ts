import { Component, ChangeDetectionStrategy, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';
import { Course } from '../../../../core/models/course.model';

@Component({
  selector: 'app-teacher-grupos-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent, BadgeComponent],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Header Bento -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-warm-200/80 shadow-warm-sm">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              Portal Docente & Oferta Horaria
            </span>
            <span class="text-xs text-warm-400">•</span>
            <span class="text-xs font-medium text-warm-500">Período Académico 2026-2</span>
          </div>
          <h1 class="font-serif font-bold text-2xl sm:text-3xl text-warm-900 tracking-tight">
            Gestión Integral de Grupos y Sesiones
          </h1>
          <p class="text-sm text-warm-600 mt-1">
            Administra la oferta de grupos, programa sesiones regulares y extraordinarias, y ajusta bloques horarios.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
          <app-button variant="primary" size="md" (clicked)="crearGrupo.emit()">
            <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Grupo
          </app-button>
          <app-button variant="secondary" size="md" (clicked)="irAsistencia.emit()">
            <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Toma de Asistencia
          </app-button>
        </div>
      </div>

      <!-- Resumen de Métricas Bento -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="p-4 rounded-2xl bg-white border border-warm-200 shadow-warm-sm flex items-center gap-4">
          <div class="w-11 h-11 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center shrink-0">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <span class="text-xs text-warm-500 font-medium">Grupos Habilitados</span>
            <p class="text-2xl font-serif font-bold text-warm-900">{{ courses().length }}</p>
          </div>
        </div>

        <div class="p-4 rounded-2xl bg-white border border-warm-200 shadow-warm-sm flex items-center gap-4">
          <div class="w-11 h-11 rounded-xl bg-accent-100 text-accent-800 flex items-center justify-center shrink-0">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <span class="text-xs text-warm-500 font-medium">Estudiantes Registrados</span>
            <p class="text-2xl font-serif font-bold text-warm-900">{{ totalEstudiantes() }}</p>
          </div>
        </div>

        <div class="p-4 rounded-2xl bg-white border border-warm-200 shadow-warm-sm flex items-center gap-4">
          <div class="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <span class="text-xs text-warm-500 font-medium">Cupo Total Ofertado</span>
            <p class="text-2xl font-serif font-bold text-emerald-700">{{ totalCupos() }} cupos</p>
          </div>
        </div>
      </div>

      <!-- Barra de Búsqueda -->
      <div class="relative">
        <input
          type="text"
          [ngModel]="searchQuery()"
          (ngModelChange)="searchQuery.set($event)"
          placeholder="Buscar grupo por nombre, código de asignatura o aula..."
          class="w-full pl-10 pr-4 py-2.5 bg-white border border-warm-200 rounded-xl text-sm text-warm-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 shadow-warm-sm transition-all"
        />
        <svg class="w-4 h-4 text-warm-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <!-- Tarjetas de Grupos -->
      @if (isLoading()) {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          @for (n of [1, 2, 3, 4]; track n) {
            <div class="h-60 bg-warm-100 rounded-2xl animate-pulse"></div>
          }
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          @for (course of filteredCourses(); track course.id) {
            <app-card [hoverable]="true" padding="md">
              <div class="flex flex-col h-full justify-between gap-4">
                <div>
                  <div class="flex items-start justify-between gap-3 mb-2">
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-warm-100 text-warm-800">
                        {{ course.code }}
                      </span>
                      <app-badge variant="neutral">{{ course.section }}</app-badge>
                    </div>

                    <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {{ course.enrolledStudentsCount }} / {{ course.cupoMaximo || 35 }} cupos
                    </span>
                  </div>

                  <h3 class="font-serif font-bold text-xl text-warm-900 leading-snug">
                    {{ course.name }}
                  </h3>
                  <p class="text-xs text-warm-500 mt-1">Docente titular: {{ course.docenteName }}</p>

                  <!-- Barra de Ocupación -->
                  <div class="mt-3 space-y-1">
                    <div class="flex items-center justify-between text-[11px] text-warm-500">
                      <span>Ocupación de Aula</span>
                      <span class="font-semibold text-warm-800">{{ getPorcentajeCupo(course) }}%</span>
                    </div>
                    <div class="w-full h-1.5 bg-warm-100 rounded-full overflow-hidden">
                      <div
                        class="h-full bg-primary-600 rounded-full transition-all duration-300"
                        [style.width.%]="getPorcentajeCupo(course)"
                      ></div>
                    </div>
                  </div>
                </div>

                <div class="p-3 rounded-xl bg-warm-50 border border-warm-100 text-xs space-y-1.5 text-warm-700">
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-warm-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="font-medium">{{ course.schedule }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-warm-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>{{ course.room }}</span>
                  </div>
                </div>

                <!-- Botones de Acción -->
                <div class="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-warm-100">
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      (click)="editarGrupo.emit(course)"
                      class="text-xs font-semibold text-warm-600 hover:text-warm-900 px-2.5 py-1.5 rounded-lg hover:bg-warm-100 transition-colors inline-flex items-center gap-1"
                      title="Modificar datos del grupo"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar Grupo
                    </button>

                    <app-button
                      variant="secondary"
                      size="sm"
                      (clicked)="verHub.emit(course)"
                    >
                      <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      Hub del Grupo & Sesiones
                    </app-button>
                  </div>

                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      (click)="matricular.emit(course)"
                      class="text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs"
                      title="Código QR y PIN para matrícula de estudiantes al grupo"
                    >
                      <svg class="w-3.5 h-3.5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      QR Matrícula
                    </button>

                    <button
                      type="button"
                      (click)="proyectarQr.emit(course)"
                      class="text-xs font-bold text-primary-800 hover:text-primary-950 bg-accent-100 hover:bg-accent-200 border border-accent-300 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs"
                      title="Proyectar código QR y PIN para auto-registro de asistencia a sesión"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                      QR Asistencia
                    </button>

                    <app-button variant="primary" size="sm" (clicked)="tomarAsistencia.emit(course)">
                      <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Asistencia
                    </app-button>
                  </div>
                </div>
              </div>
            </app-card>
          }
        </div>
      }
    </div>
  `,
})
export class TeacherGruposListComponent {
  courses = input<Course[]>([]);
  isLoading = input<boolean>(false);

  crearGrupo = output<void>();
  irAsistencia = output<void>();
  editarGrupo = output<Course>();
  verHub = output<Course>();
  matricular = output<Course>();
  proyectarQr = output<Course>();
  tomarAsistencia = output<Course>();

  searchQuery = signal<string>('');

  totalEstudiantes = computed(() =>
    this.courses().reduce((acc, c) => acc + (c.enrolledStudentsCount || 0), 0)
  );

  totalCupos = computed(() =>
    this.courses().reduce((acc, c) => acc + (c.cupoMaximo || 35), 0)
  );

  filteredCourses = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.courses();
    return this.courses().filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.room.toLowerCase().includes(q)
    );
  });

  getPorcentajeCupo(course: Course): number {
    const max = course.cupoMaximo || 35;
    const actuales = course.enrolledStudentsCount || 0;
    return Math.min(Math.round((actuales / max) * 100), 100);
  }
}
