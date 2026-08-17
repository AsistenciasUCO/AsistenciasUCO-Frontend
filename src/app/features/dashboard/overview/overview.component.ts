import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardComponent } from '../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { MOCK_COURSES } from '../../../core/mocks/course.mock';
import { MOCK_SESSIONS } from '../../../core/mocks/attendance.mock';
import { MOCK_CURRENT_USER } from '../../../core/mocks/user.mock';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CardComponent,
    BadgeComponent,
    ButtonComponent,
  ],
  template: `
    <div class="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">
      <!-- 1. Hero Banner de Bienvenida Institucional -->
      <section class="bg-gradient-to-r from-primary-950 via-primary-900 to-primary-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-warm-md border border-primary-800">
        <div class="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent-400/20 via-transparent to-transparent pointer-events-none"></div>

        <div class="relative z-10 max-w-3xl space-y-3">
          <div class="flex flex-wrap items-center gap-2">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-accent-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-white/10">
              <span class="w-2 h-2 rounded-full bg-accent-400 animate-pulse"></span>
              Semestre Académico 2026-II
            </span>
            <span class="text-xs text-warm-300 font-medium">| {{ user.institutionName }}</span>
          </div>

          <h1 class="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            ¡Buenas tardes, {{ user.name }}!
          </h1>
          
          <p class="text-warm-200 text-xs sm:text-sm max-w-xl leading-relaxed font-sans">
            Tienes <strong class="text-white font-semibold">3 asignaturas activas</strong> programadas para hoy. La tasa de asistencia semanal en tu departamento se mantiene en un destacado <strong class="text-accent-300 font-bold">92.4%</strong>.
          </p>

          <div class="pt-2 flex flex-wrap items-center gap-3">
            <a routerLink="/app/asistencia">
              <app-button variant="accent" size="md">
                <svg class="w-4 h-4 mr-1.5 text-warm-950 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                Tomar Asistencia Ahora
              </app-button>
            </a>
          </div>
        </div>
      </section>

      <!-- 2. Bento Grid: Métricas Principales del Día -->
      @if (isLoading()) {
        <!-- Skeleton Loader para Métricas -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (item of [1, 2, 3, 4]; track item) {
            <div class="bg-white p-5 rounded-2xl border border-warm-200 animate-pulse space-y-3">
              <div class="flex items-center justify-between">
                <div class="h-3 w-24 bg-warm-200 rounded"></div>
                <div class="w-8 h-8 bg-warm-200 rounded-xl"></div>
              </div>
              <div class="h-8 w-16 bg-warm-200 rounded"></div>
            </div>
          }
        </div>
      } @else {
        <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Metric 1: Estudiantes Totales -->
          <div class="bg-white p-5 rounded-2xl border border-warm-200/90 shadow-warm-sm hover:shadow-warm-md transition-all group">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold uppercase tracking-wider text-warm-500">Estudiantes Totales</span>
              <span class="p-2 rounded-xl bg-primary-50 text-primary-700 group-hover:scale-110 transition-transform">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </span>
            </div>
            <div class="mt-3 flex items-baseline justify-between">
              <span class="font-serif text-3xl font-bold text-warm-900">105</span>
              <span class="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                +4.2% mes
              </span>
            </div>
            <p class="text-[11px] text-warm-400 mt-2">Matriculados en 3 asignaturas</p>
          </div>

          <!-- Metric 2: Presentes Hoy -->
          <div class="bg-white p-5 rounded-2xl border border-warm-200/90 shadow-warm-sm hover:shadow-warm-md transition-all group">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Presentes Hoy</span>
              <span class="p-2 rounded-xl bg-emerald-50 text-emerald-700 group-hover:scale-110 transition-transform">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </div>
            <div class="mt-3 flex items-baseline justify-between">
              <span class="font-serif text-3xl font-bold text-warm-900">92</span>
              <app-badge variant="success" size="sm">87.6% ratio</app-badge>
            </div>
            <div class="mt-2.5 w-full bg-warm-100 h-1.5 rounded-full overflow-hidden">
              <div class="bg-emerald-500 h-full" style="width: 87.6%"></div>
            </div>
          </div>

          <!-- Metric 3: Tardanzas -->
          <div class="bg-white p-5 rounded-2xl border border-warm-200/90 shadow-warm-sm hover:shadow-warm-md transition-all group">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold uppercase tracking-wider text-amber-800">Tardanzas Registradas</span>
              <span class="p-2 rounded-xl bg-amber-50 text-amber-700 group-hover:scale-110 transition-transform">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </div>
            <div class="mt-3 flex items-baseline justify-between">
              <span class="font-serif text-3xl font-bold text-warm-900">8</span>
              <app-badge variant="warning" size="sm">7.6% ratio</app-badge>
            </div>
            <div class="mt-2.5 w-full bg-warm-100 h-1.5 rounded-full overflow-hidden">
              <div class="bg-amber-500 h-full" style="width: 7.6%"></div>
            </div>
          </div>

          <!-- Metric 4: Inasistencias -->
          <div class="bg-white p-5 rounded-2xl border border-warm-200/90 shadow-warm-sm hover:shadow-warm-md transition-all group">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-bold uppercase tracking-wider text-red-800">Inasistencias</span>
              <span class="p-2 rounded-xl bg-red-50 text-red-700 group-hover:scale-110 transition-transform">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
            </div>
            <div class="mt-3 flex items-baseline justify-between">
              <span class="font-serif text-3xl font-bold text-warm-900">5</span>
              <app-badge variant="danger" size="sm">4.8% ratio</app-badge>
            </div>
            <div class="mt-2.5 w-full bg-warm-100 h-1.5 rounded-full overflow-hidden">
              <div class="bg-red-500 h-full" style="width: 4.8%"></div>
            </div>
          </div>
        </section>
      }

      <!-- 3. Sección Principal: Tarjetas Bento de Cursos Asignados -->
      <section class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="font-serif text-xl sm:text-2xl font-bold text-warm-900">Mis Asignaturas Habilitadas</h2>
            <p class="text-xs text-warm-500">Cursos asignados para la toma y control de asistencia de la jornada</p>
          </div>
        </div>

        @if (isLoading()) {
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            @for (item of [1, 2, 3]; track item) {
              <div class="bg-white p-6 rounded-2xl border border-warm-200 animate-pulse space-y-4">
                <div class="h-4 w-3/4 bg-warm-200 rounded"></div>
                <div class="h-3 w-1/2 bg-warm-200 rounded"></div>
                <div class="h-10 w-full bg-warm-200 rounded-xl mt-4"></div>
              </div>
            }
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            @for (course of courses; track course.id) {
              <app-card [hoverable]="true" [title]="course.name" [subtitle]="course.code + ' • ' + course.section">
                <div class="space-y-3 my-2 text-xs text-warm-700">
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-primary-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="font-medium text-warm-800">{{ course.schedule }}</span>
                  </div>

                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-primary-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span class="font-medium text-warm-800">{{ course.room }}</span>
                  </div>

                  <div class="flex items-center justify-between pt-3 border-t border-warm-100">
                    <span class="text-warm-500 font-medium">Alumnos Matriculados:</span>
                    <span class="font-bold text-warm-900 bg-warm-100 px-2.5 py-0.5 rounded-full text-xs">
                      {{ course.enrolledStudentsCount }} alumnos
                    </span>
                  </div>
                </div>

                <div card-footer class="mt-4 pt-3 border-t border-warm-100 flex items-center justify-end">
                  <a routerLink="/app/asistencia" class="w-full">
                    <app-button variant="secondary" size="sm" [fullWidth]="true">
                      Acceder a Sesiones y Asistencia
                    </app-button>
                  </a>
                </div>
              </app-card>
            } @empty {
              <div class="col-span-3 bg-white p-12 rounded-2xl border border-warm-200 text-center space-y-3">
                <p class="text-xs text-warm-500">No tienes asignaturas programadas para el día de hoy.</p>
              </div>
            }
          </div>
        }
      </section>
    </div>
  `,
})
export class OverviewComponent {
  user = MOCK_CURRENT_USER;
  courses = MOCK_COURSES;
  sessions = MOCK_SESSIONS;

  isLoading = signal<boolean>(true);

  constructor() {
    // Simular carga progresiva de métricas del dashboard
    setTimeout(() => {
      this.isLoading.set(false);
    }, 350);
  }
}
