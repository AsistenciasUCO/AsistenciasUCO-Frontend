import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardComponent } from '../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CourseService } from '../../../core/services/course.service';
import { Course } from '../../../core/models/course.model';
import { AuthService } from '../../../core/services/auth.service';

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
            Bienvenido(a), {{ user.name }}
          </h1>
          
          <p class="text-warm-200 text-xs sm:text-sm max-w-xl leading-relaxed font-sans">
            Gestiona tus asignaturas y controla la asistencia de tus estudiantes de forma eficiente.
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
  private courseService = inject(CourseService);
  private authService = inject(AuthService);

  courses: Course[] = [];

  isLoading = signal<boolean>(true);

  get user() {
    const currentUser = this.authService.currentUser();
    const name = [currentUser?.nombres, currentUser?.apellidos].filter(Boolean).join(' ');

    return {
      name: name || currentUser?.username || 'Usuario autenticado',
      institutionName: 'UCO',
    };
  }

  constructor() {
    this.courseService.getTeacherCourses().subscribe({
      next: (res) => {
        if (res.exitoso && res.datos) {
          this.courses = res.datos;
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }
}
