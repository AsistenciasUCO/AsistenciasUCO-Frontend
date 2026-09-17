import { Component, signal, computed, inject, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardComponent } from '../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AuthService } from '../../../core/services/auth.service';
import { CourseService } from '../../../core/services/course.service';
import { AdminManagementService } from '../../../core/services/admin-management.service';
import { DeanManagementService } from '../../../core/services/dean-management.service';
import { CoordinatorManagementService } from '../../../core/services/coordinator-management.service';
import { StudentManagementService } from '../../../core/services/student-management.service';
import { AttendanceClaimService } from '../../../core/services/attendance-claim.service';
import { Course } from '../../../core/models/course.model';
import { UserRole } from '../../../core/models/user.model';
import {
  DecanoItem,
  CoordinadorItem,
  DocenteItem,
  PlanEstudioItem,
  MateriaEstudianteItem,
  HorarioDocenteItem,
  HorarioItem,
} from '../../../core/models/role-management.model';
import { MOCK_USERS_BY_ROLE } from '../../../core/mocks/user.mock';

export interface ProximaClaseInfo {
  materia: string;
  codigo: string;
  aula: string;
  subtitulo: string;
  dia: string;
  horaInicio: string;
  horaFin: string;
  fechaProxima: Date;
  enCurso: boolean;
  tiempoRestanteTexto: string;
  tiempoDetalleBadge: string;
  minutosRestantes: number;
}

@Component({
  selector: 'app-overview',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterLink,
    CardComponent,
    BadgeComponent,
    ButtonComponent,
  ],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- 1. Hero Banner de Bienvenida Adaptado por Rol -->
      <section class="bg-gradient-to-r from-primary-950 via-primary-900 to-primary-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-warm-md border border-primary-800">
        <div class="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent-400/20 via-transparent to-transparent pointer-events-none"></div>

        <div class="relative z-10 max-w-3xl space-y-3">
          <div class="flex flex-wrap items-center gap-2">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-accent-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-white/10">
              <span class="w-2 h-2 rounded-full bg-accent-400 animate-pulse"></span>
              Semestre Académico 2026-II
            </span>
            <span class="text-xs text-warm-300 font-medium">| {{ user().institutionName }}</span>
            <span class="text-xs bg-primary-800/80 text-primary-200 px-2.5 py-0.5 rounded-md font-semibold border border-primary-700/50">
              Rol: {{ userRole() }}
            </span>
          </div>

          <h1 class="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
            Bienvenido(a), {{ user().name }}
          </h1>
          
          <p class="text-warm-200 text-xs sm:text-sm max-w-xl leading-relaxed font-sans">
            @switch (userRole()) {
              @case ('ADMINISTRADOR') {
                Panel de Control Institucional. Supervisa la estructura académica, decanaturas y auditoría del campus universitario.
              }
              @case ('ADMIN') {
                Panel de Control Institucional. Supervisa la estructura académica, decanaturas y auditoría del campus universitario.
              }
              @case ('DECANO') {
                Decanatura — {{ user().department }}. Gestiona los programas académicos, coordinadores asignados y el seguimiento de facultad.
              }
              @case ('COORDINADOR') {
                Coordinación Académica — {{ user().department }}. Administra la planta docente adscrita y consulta los planes de estudio del programa.
              }
              @case ('DOCENTE') {
                Panel Docente. Gestiona tus asignaturas asignadas, realiza el control de asistencia en tiempo real y revisa las justificaciones de estudiantes.
              }
              @case ('ESTUDIANTE') {
                Portal del Estudiante. Revisa tu porcentaje de asistencia en cada materia, consulta tus horarios de clase y realiza el seguimiento de tus solicitudes.
              }
            }
          </p>

          <!-- Acciones Rápidas del Banner según Rol -->
          <div class="pt-2 flex flex-wrap items-center gap-3">
            @switch (userRole()) {
              @case ('ADMINISTRADOR') {
                <a routerLink="/app/admin/decanos">
                  <app-button variant="accent" size="md">
                    <svg class="w-4 h-4 mr-1.5 text-warm-950 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Gestionar Decanaturas
                  </app-button>
                </a>
                <a routerLink="/app/asistencia">
                  <app-button variant="secondary" size="md">
                    <svg class="w-4 h-4 mr-1.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Auditoría de Asistencias
                  </app-button>
                </a>
              }
              @case ('ADMIN') {
                <a routerLink="/app/admin/decanos">
                  <app-button variant="accent" size="md">
                    <svg class="w-4 h-4 mr-1.5 text-warm-950 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Gestionar Decanaturas
                  </app-button>
                </a>
                <a routerLink="/app/asistencia">
                  <app-button variant="secondary" size="md">
                    Auditoría de Asistencias
                  </app-button>
                </a>
              }
              @case ('DECANO') {
                <a routerLink="/app/decano/coordinadores">
                  <app-button variant="accent" size="md">
                    <svg class="w-4 h-4 mr-1.5 text-warm-950 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Gestionar Coordinadores
                  </app-button>
                </a>
              }
              @case ('COORDINADOR') {
                <a routerLink="/app/coordinador/docentes">
                  <app-button variant="accent" size="md">
                    <svg class="w-4 h-4 mr-1.5 text-warm-950 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Gestionar Docentes
                  </app-button>
                </a>
                <a routerLink="/app/coordinador/planes-estudio">
                  <app-button variant="secondary" size="md">
                    <svg class="w-4 h-4 mr-1.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Planes de Estudio y Malla
                  </app-button>
                </a>
              }
              @case ('DOCENTE') {
                <a routerLink="/app/asistencia">
                  <app-button variant="accent" size="md">
                    <svg class="w-4 h-4 mr-1.5 text-warm-950 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Tomar Asistencia Ahora
                  </app-button>
                </a>
                <a routerLink="/app/docente/reclamos">
                  <app-button variant="secondary" size="md">
                    <svg class="w-4 h-4 mr-1.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    Revisar Reclamos
                    @if (pendingClaimsCount() > 0) {
                      <span class="ml-1 px-1.5 py-0.5 rounded-full bg-accent-400 text-warm-950 font-bold text-[10px]">
                        {{ pendingClaimsCount() }}
                      </span>
                    }
                  </app-button>
                </a>
              }
              @case ('ESTUDIANTE') {
                <a routerLink="/app/estudiante/materias">
                  <app-button variant="accent" size="md">
                    <svg class="w-4 h-4 mr-1.5 text-warm-950 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Mis Materias y Asistencias
                  </app-button>
                </a>
                <a routerLink="/app/estudiante/horarios">
                  <app-button variant="secondary" size="md">
                    <svg class="w-4 h-4 mr-1.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Mi Horario Semanal
                  </app-button>
                </a>
              }
            }
          </div>
        </div>
      </section>

      <!-- 2. Tarjetas de Métricas / KPIs Adaptadas al Rol -->
      <section class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        @switch (userRole()) {
          @case ('ADMINISTRADOR') {
            <div class="bg-white p-5 rounded-2xl border border-warm-200 shadow-warm-sm flex flex-col justify-between h-full min-h-[120px]">
              <span class="text-xs text-warm-500 font-medium">Facultades Activas</span>
              <p class="text-2xl font-serif font-bold text-warm-900 mt-1">{{ totalFacultadesAdmin() }}</p>
              <span class="text-[11px] text-emerald-700 font-medium">Sincronizadas con base de datos</span>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-warm-200 shadow-warm-sm flex flex-col justify-between h-full min-h-[120px]">
              <span class="text-xs text-warm-500 font-medium">Decanos Registrados</span>
              <p class="text-2xl font-serif font-bold text-warm-900 mt-1">{{ decanos().length }}</p>
              <span class="text-[11px] text-warm-500 font-medium">En ejercicio activo</span>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-warm-200 shadow-warm-sm flex flex-col justify-between h-full min-h-[120px]">
              <span class="text-xs text-warm-500 font-medium">Programas Académicos</span>
              <p class="text-2xl font-serif font-bold text-warm-900 mt-1">{{ decanos().length > 0 ? 1 : 0 }}</p>
              <span class="text-[11px] text-primary-700 font-medium">Pregrado y posgrado</span>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-warm-200 shadow-warm-sm flex flex-col justify-between h-full min-h-[120px]">
              <span class="text-xs text-warm-500 font-medium">Asistencia Promedio Campus</span>
              <p class="text-2xl font-serif font-bold text-accent-700 mt-1">100%</p>
              <span class="text-[11px] text-emerald-700 font-medium">Monitoreo activo</span>
            </div>
          }
          @case ('ADMIN') {
            <div class="bg-white p-5 rounded-2xl border border-warm-200 shadow-warm-sm flex flex-col justify-between h-full min-h-[120px]">
              <span class="text-xs text-warm-500 font-medium">Facultades Activas</span>
              <p class="text-2xl font-serif font-bold text-warm-900 mt-1">{{ totalFacultadesAdmin() }}</p>
              <span class="text-[11px] text-emerald-700 font-medium">Sincronizadas con base de datos</span>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-warm-200 shadow-warm-sm flex flex-col justify-between h-full min-h-[120px]">
              <span class="text-xs text-warm-500 font-medium">Decanos Registrados</span>
              <p class="text-2xl font-serif font-bold text-warm-900 mt-1">{{ decanos().length }}</p>
              <span class="text-[11px] text-warm-500 font-medium">En ejercicio activo</span>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-warm-200 shadow-warm-sm flex flex-col justify-between h-full min-h-[120px]">
              <span class="text-xs text-warm-500 font-medium">Programas Académicos</span>
              <p class="text-2xl font-serif font-bold text-warm-900 mt-1">{{ decanos().length > 0 ? 1 : 0 }}</p>
              <span class="text-[11px] text-primary-700 font-medium">Pregrado y posgrado</span>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-warm-200 shadow-warm-sm flex flex-col justify-between h-full min-h-[120px]">
              <span class="text-xs text-warm-500 font-medium">Asistencia Promedio Campus</span>
              <p class="text-2xl font-serif font-bold text-accent-700 mt-1">100%</p>
              <span class="text-[11px] text-emerald-700 font-medium">Monitoreo activo</span>
            </div>
          }
          @case ('DECANO') {
            <div class="bg-white p-5 rounded-2xl border border-warm-200 shadow-warm-sm flex flex-col justify-between h-full min-h-[120px]">
              <span class="text-xs text-warm-500 font-medium">Programas de la Facultad</span>
              <p class="text-2xl font-serif font-bold text-warm-900 mt-1">{{ coordinadores().length }}</p>
              <span class="text-[11px] text-primary-700 font-medium">Bajo tu decanatura</span>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-warm-200 shadow-warm-sm flex flex-col justify-between h-full min-h-[120px]">
              <span class="text-xs text-warm-500 font-medium">Coordinadores Asignados</span>
              <p class="text-2xl font-serif font-bold text-warm-900 mt-1">{{ coordinadores().length }}</p>
              <span class="text-[11px] text-emerald-700 font-medium">Vinculados</span>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-warm-200 shadow-warm-sm flex flex-col justify-between h-full min-h-[120px]">
              <span class="text-xs text-warm-500 font-medium">Docentes en Facultad</span>
              <p class="text-2xl font-serif font-bold text-warm-900 mt-1">{{ totalDocentesFacultad() }}</p>
              <span class="text-[11px] text-warm-500 font-medium">Planta docente activa</span>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-warm-200 shadow-warm-sm flex flex-col justify-between h-full min-h-[120px]">
              <span class="text-xs text-warm-500 font-medium">Grupos Académicos</span>
              <p class="text-2xl font-serif font-bold text-emerald-700 mt-1">{{ totalGruposFacultad() }}</p>
              <span class="text-[11px] text-emerald-700 font-medium">En oferta académica</span>
            </div>
          }
          @case ('COORDINADOR') {
            <div class="bg-white p-5 rounded-2xl border border-warm-200 shadow-warm-sm flex flex-col justify-between h-full min-h-[120px]">
              <span class="text-xs text-warm-500 font-medium">Docentes del Programa</span>
              <p class="text-2xl font-serif font-bold text-warm-900 mt-1">{{ docentes().length }}</p>
              <span class="text-[11px] text-primary-700 font-medium">Adscritos a asignaturas</span>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-warm-200 shadow-warm-sm flex flex-col justify-between h-full min-h-[120px]">
              <span class="text-xs text-warm-500 font-medium">Planes de Estudio</span>
              <p class="text-2xl font-serif font-bold text-warm-900 mt-1">{{ planesEstudio().length }}</p>
              <span class="text-[11px] text-warm-500 font-medium">Vigentes e históricos</span>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-warm-200 shadow-warm-sm flex flex-col justify-between h-full min-h-[120px]">
              <span class="text-xs text-warm-500 font-medium">Grupos Académicos</span>
              <p class="text-2xl font-serif font-bold text-warm-900 mt-1">{{ totalGruposPrograma() }}</p>
              <span class="text-[11px] text-emerald-700 font-medium">En oferta activa</span>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-warm-200 shadow-warm-sm flex flex-col justify-between h-full min-h-[120px]">
              <span class="text-xs text-warm-500 font-medium">Estudiantes Matriculados</span>
              <p class="text-2xl font-serif font-bold text-accent-700 mt-1">{{ totalEstudiantesPrograma() }}</p>
              <span class="text-[11px] text-warm-500 font-medium">En el programa</span>
            </div>
          }
          @case ('DOCENTE') {
            <div class="bg-white p-5 rounded-2xl border border-warm-200 shadow-warm-sm flex flex-col justify-between h-full min-h-[120px]">
              <span class="text-xs text-warm-500 font-medium">Asignaturas Asignadas</span>
              <p class="text-2xl font-serif font-bold text-warm-900 mt-1">{{ courses.length }}</p>
              <span class="text-[11px] text-primary-700 font-medium">Cursos habilitados</span>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-warm-200 shadow-warm-sm flex flex-col justify-between h-full min-h-[120px]">
              <span class="text-xs text-warm-500 font-medium">Total Alumnos a Cargo</span>
              <p class="text-2xl font-serif font-bold text-warm-900 mt-1">{{ totalStudentsCount() }}</p>
              <span class="text-[11px] text-warm-500 font-medium">Estudiantes activos</span>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-warm-200 shadow-warm-sm flex flex-col justify-between h-full min-h-[120px]">
              <span class="text-xs text-warm-500 font-medium">Reclamos Pendientes</span>
              <p class="text-2xl font-serif font-bold text-amber-700 mt-1">{{ pendingClaimsCount() }}</p>
              <span class="text-[11px] text-amber-600 font-medium">Por responder</span>
            </div>
            <!-- Tarjeta 4 Docente: Próxima Clase con Cuenta Regresiva Reactiva -->
            <div class="bg-white p-5 rounded-2xl border border-warm-200 shadow-warm-sm flex flex-col justify-between h-full min-h-[120px]"
                 [ngClass]="{'border-emerald-300 bg-emerald-50/30 ring-1 ring-emerald-400/20': proximaClase()?.enCurso, 'border-primary-200/60': proximaClase() && !proximaClase()?.enCurso}">
              <div class="flex items-center justify-between">
                <span class="text-xs text-warm-500 font-medium">Próxima Clase</span>
                @if (proximaClase()?.enCurso) {
                  <span class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full animate-pulse">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    En curso
                  </span>
                } @else if (proximaClase()) {
                  <span class="text-[10px] font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full">
                    Programada
                  </span>
                }
              </div>
              @if (proximaClase(); as pc) {
                <div>
                  <p class="text-lg font-serif font-bold text-warm-900 mt-1" [title]="pc.materia">
                    {{ pc.tiempoRestanteTexto }}
                  </p>
                  <p class="text-xs font-semibold text-primary-800 truncate mt-0.5" [title]="pc.materia">{{ pc.materia }}</p>
                  <span class="text-[11px] text-warm-500 font-medium block truncate mt-0.5">{{ pc.aula }} • {{ pc.tiempoDetalleBadge }}</span>
                </div>
              } @else {
                <div>
                  <p class="text-sm font-semibold text-warm-500 mt-2">Sin clases próximas</p>
                  <span class="text-[11px] text-warm-400 font-medium">Horario despejado</span>
                </div>
              }
            </div>
          }
          @case ('ESTUDIANTE') {
            <div class="bg-white p-5 rounded-2xl border border-warm-200 shadow-warm-sm flex flex-col justify-between h-full min-h-[120px]">
              <span class="text-xs text-warm-500 font-medium">Materias Matriculadas</span>
              <p class="text-2xl font-serif font-bold text-warm-900 mt-1">{{ materias().length }}</p>
              <span class="text-[11px] text-primary-700 font-medium">Semestre 2026-II</span>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-warm-200 shadow-warm-sm flex flex-col justify-between h-full min-h-[120px]">
              <span class="text-xs text-warm-500 font-medium">Asistencia Promedio</span>
              <p class="text-2xl font-serif font-bold text-emerald-700 mt-1">{{ averageStudentAttendance() }}%</p>
              <span class="text-[11px] text-emerald-700 font-medium">Excelente desempeño</span>
            </div>
            <div class="bg-white p-5 rounded-2xl border border-warm-200 shadow-warm-sm flex flex-col justify-between h-full min-h-[120px]">
              <span class="text-xs text-warm-500 font-medium">Inasistencias Registradas</span>
              <p class="text-2xl font-serif font-bold text-warm-900 mt-1">{{ totalStudentAbsences() }}</p>
              <span class="text-[11px] text-warm-500 font-medium">En todo el periodo</span>
            </div>
            <!-- Tarjeta 4 Estudiante: Próxima Clase con Cuenta Regresiva Reactiva -->
            <div class="bg-white p-5 rounded-2xl border border-warm-200 shadow-warm-sm flex flex-col justify-between h-full min-h-[120px]"
                 [ngClass]="{'border-emerald-300 bg-emerald-50/30 ring-1 ring-emerald-400/20': proximaClase()?.enCurso, 'border-primary-200/60': proximaClase() && !proximaClase()?.enCurso}">
              <div class="flex items-center justify-between">
                <span class="text-xs text-warm-500 font-medium">Próxima Clase</span>
                @if (proximaClase()?.enCurso) {
                  <span class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full animate-pulse">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    En curso
                  </span>
                } @else if (proximaClase()) {
                  <span class="text-[10px] font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full">
                    Programada
                  </span>
                }
              </div>
              @if (proximaClase(); as pc) {
                <div>
                  <p class="text-lg font-serif font-bold text-warm-900 mt-1" [title]="pc.materia">
                    {{ pc.tiempoRestanteTexto }}
                  </p>
                  <p class="text-xs font-semibold text-primary-800 truncate mt-0.5" [title]="pc.materia">{{ pc.materia }}</p>
                  <span class="text-[11px] text-warm-500 font-medium block truncate mt-0.5">{{ pc.aula }} • {{ pc.tiempoDetalleBadge }}</span>
                </div>
              } @else {
                <div>
                  <p class="text-sm font-semibold text-warm-500 mt-2">Sin clases próximas</p>
                  <span class="text-[11px] text-warm-400 font-medium">Horario despejado</span>
                </div>
              }
            </div>
          }
        }
      </section>

      <!-- 3. Sección Principal de Contenido Adaptado al Rol -->
      @switch (userRole()) {
        <!-- ==================== ROL ADMINISTRADOR ==================== -->
        @case ('ADMINISTRADOR') {
          <section class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="font-serif text-xl sm:text-2xl font-bold text-warm-900">Directorio de Facultades y Decanaturas</h2>
                <p class="text-xs text-warm-500">Supervisión general de decanos titulares y facultades adscritas a la universidad</p>
              </div>
              <a routerLink="/app/admin/decanos">
                <app-button variant="secondary" size="sm">Ver Todas las Decanaturas →</app-button>
              </a>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              @for (decano of decanos(); track decano.id) {
                <app-card [hoverable]="true" [title]="decano.facultad" [subtitle]="decano.nombres + ' ' + decano.apellidos">
                  <div class="space-y-3 my-2 text-xs text-warm-700">
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4 text-primary-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span class="font-medium text-warm-800">{{ decano.correo }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4 text-primary-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span class="text-warm-600">Asignado: {{ decano.fechaAsignacion }}</span>
                    </div>
                    <div class="pt-2 border-t border-warm-100 flex items-center justify-between">
                      <span class="text-warm-500 font-medium">Estado institucional:</span>
                      <app-badge [variant]="decano.estado === 'ACTIVO' ? 'success' : 'neutral'">
                        {{ decano.estado }}
                      </app-badge>
                    </div>
                  </div>

                  <div card-footer class="mt-4 pt-3 border-t border-warm-100 flex items-center justify-end">
                    <a routerLink="/app/admin/decanos" class="w-full">
                      <app-button variant="secondary" size="sm" [fullWidth]="true">
                        Gestionar Decano
                      </app-button>
                    </a>
                  </div>
                </app-card>
              }
            </div>
          </section>
        }

        @case ('ADMIN') {
          <section class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="font-serif text-xl sm:text-2xl font-bold text-warm-900">Directorio de Facultades y Decanaturas</h2>
                <p class="text-xs text-warm-500">Supervisión general de decanos titulares y facultades adscritas a la universidad</p>
              </div>
              <a routerLink="/app/admin/decanos">
                <app-button variant="secondary" size="sm">Ver Todas las Decanaturas →</app-button>
              </a>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              @for (decano of decanos(); track decano.id) {
                <app-card [hoverable]="true" [title]="decano.facultad" [subtitle]="decano.nombres + ' ' + decano.apellidos">
                  <div class="space-y-3 my-2 text-xs text-warm-700">
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4 text-primary-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span class="font-medium text-warm-800">{{ decano.correo }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4 text-primary-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span class="text-warm-600">Asignado: {{ decano.fechaAsignacion }}</span>
                    </div>
                    <div class="pt-2 border-t border-warm-100 flex items-center justify-between">
                      <span class="text-warm-500 font-medium">Estado institucional:</span>
                      <app-badge [variant]="decano.estado === 'ACTIVO' ? 'success' : 'neutral'">
                        {{ decano.estado }}
                      </app-badge>
                    </div>
                  </div>

                  <div card-footer class="mt-4 pt-3 border-t border-warm-100 flex items-center justify-end">
                    <a routerLink="/app/admin/decanos" class="w-full">
                      <app-button variant="secondary" size="sm" [fullWidth]="true">
                        Gestionar Decano
                      </app-button>
                    </a>
                  </div>
                </app-card>
              }
            </div>
          </section>
        }

        <!-- ==================== ROL DECANO ==================== -->
        @case ('DECANO') {
          <section class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="font-serif text-xl sm:text-2xl font-bold text-warm-900">Programas Académicos de la Facultad</h2>
                <p class="text-xs text-warm-500">Supervisión de coordinadores responsables y carga académica adscrita</p>
              </div>
              <a routerLink="/app/decano/coordinadores">
                <app-button variant="secondary" size="sm">Gestionar Todos →</app-button>
              </a>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              @for (coord of coordinadores(); track coord.id) {
                <app-card [hoverable]="true" [title]="coord.programaAcademico" [subtitle]="coord.nombres + ' ' + coord.apellidos">
                  <div class="space-y-3 my-2 text-xs text-warm-700">
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4 text-primary-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span class="font-medium text-warm-800">{{ coord.correo }}</span>
                    </div>
                    <div class="grid grid-cols-2 gap-2 pt-2 border-t border-warm-100">
                      <div class="bg-warm-50 p-2 rounded-lg text-center">
                        <span class="block text-warm-500 text-[10px]">Docentes</span>
                        <span class="font-bold text-warm-900 text-sm">{{ coord.totalDocentes }}</span>
                      </div>
                      <div class="bg-warm-50 p-2 rounded-lg text-center">
                        <span class="block text-warm-500 text-[10px]">Grupos</span>
                        <span class="font-bold text-warm-900 text-sm">{{ coord.totalGrupos }}</span>
                      </div>
                    </div>
                  </div>

                  <div card-footer class="mt-4 pt-3 border-t border-warm-100 flex items-center justify-end">
                    <a routerLink="/app/decano/coordinadores" class="w-full">
                      <app-button variant="secondary" size="sm" [fullWidth]="true">
                        Administrar Coordinación
                      </app-button>
                    </a>
                  </div>
                </app-card>
              }
            </div>
          </section>
        }

        <!-- ==================== ROL COORDINADOR ==================== -->
        @case ('COORDINADOR') {
          <div class="space-y-8">
            <!-- Sección 1: Planes de Estudio del Programa -->
            <section class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="font-serif text-xl sm:text-2xl font-bold text-warm-900">Planes de Estudio del Programa</h2>
                  <p class="text-xs text-warm-500">Malla curricular, créditos aprobados y asignaturas de la carrera</p>
                </div>
                <a routerLink="/app/coordinador/planes-estudio">
                  <app-button variant="secondary" size="sm">Ver Malla Completa →</app-button>
                </a>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                @for (plan of planesEstudio(); track plan.id) {
                  <app-card [hoverable]="true" [title]="plan.nombre" [subtitle]="plan.codigo + ' • Vigencia ' + plan.anioVigencia">
                    <div class="space-y-3 my-2 text-xs text-warm-700">
                      <div class="grid grid-cols-3 gap-2 bg-warm-50 p-3 rounded-xl">
                        <div class="text-center">
                          <span class="block text-warm-400 text-[10px]">Créditos</span>
                          <span class="font-bold text-warm-900 text-sm">{{ plan.totalCreditos }}</span>
                        </div>
                        <div class="text-center">
                          <span class="block text-warm-400 text-[10px]">Duración</span>
                          <span class="font-bold text-warm-900 text-sm">{{ plan.totalSemestres }} Sem.</span>
                        </div>
                        <div class="text-center">
                          <span class="block text-warm-400 text-[10px]">Estado</span>
                          <span class="font-bold text-xs" [ngClass]="plan.estado === 'VIGENTE' ? 'text-emerald-700' : 'text-amber-700'">
                            {{ plan.estado }}
                          </span>
                        </div>
                      </div>
                      <p class="text-[11px] text-warm-500 italic">
                        {{ plan.descripcion }}
                      </p>
                    </div>

                    <div card-footer class="mt-4 pt-3 border-t border-warm-100 flex items-center justify-end">
                      <a routerLink="/app/coordinador/planes-estudio" class="w-full">
                        <app-button variant="secondary" size="sm" [fullWidth]="true">
                          Explorar Malla Curricular
                        </app-button>
                      </a>
                    </div>
                  </app-card>
                }
              </div>
            </section>

            <!-- Sección 2: Docentes Adscritos -->
            <section class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="font-serif text-xl sm:text-2xl font-bold text-warm-900">Planta Docente Adscrita</h2>
                  <p class="text-xs text-warm-500">Profesores vinculados y asignación de grupos de la carrera</p>
                </div>
                <a routerLink="/app/coordinador/docentes">
                  <app-button variant="secondary" size="sm">Gestionar Planta Docente →</app-button>
                </a>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                @for (docente of docentes().slice(0, 3); track docente.id) {
                  <div class="bg-white p-5 rounded-2xl border border-warm-200 shadow-warm-sm flex flex-col justify-between space-y-4">
                    <div class="space-y-2">
                      <div class="flex items-center justify-between">
                        <span class="font-bold text-warm-900 text-sm">{{ docente.nombres }} {{ docente.apellidos }}</span>
                        <app-badge variant="success">{{ docente.estado }}</app-badge>
                      </div>
                      <p class="text-xs text-primary-700 font-medium">{{ docente.especialidad }}</p>
                      <p class="text-xs text-warm-500">{{ docente.correo }}</p>
                      <p class="text-xs text-warm-600 bg-warm-50 px-2.5 py-1 rounded-md inline-block">
                        Grupos a cargo: <strong class="text-warm-900">{{ docente.totalGruposAsignados }}</strong>
                      </p>
                    </div>
                    <a routerLink="/app/coordinador/docentes" class="w-full">
                      <app-button variant="ghost" size="sm" [fullWidth]="true">
                        Ver Perfil y Carga
                      </app-button>
                    </a>
                  </div>
                }
              </div>
            </section>
          </div>
        }

        <!-- ==================== ROL DOCENTE ==================== -->
        @case ('DOCENTE') {
          <div class="space-y-8">
            <!-- Alerta destacada si hay reclamos pendientes -->
            @if (pendingClaimsCount() > 0) {
              <div class="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 class="font-bold text-amber-900 text-sm">Tienes {{ pendingClaimsCount() }} reclamos de asistencia pendientes</h3>
                    <p class="text-xs text-amber-700">Revisa las solicitudes radicadas por estudiantes antes de que expiren los plazos de corte.</p>
                  </div>
                </div>
                <a routerLink="/app/docente/reclamos" class="shrink-0">
                  <app-button variant="accent" size="sm">
                    Revisar Reclamos Ahora →
                  </app-button>
                </a>
              </div>
            }

            <!-- Widget Destacado de Próxima Clase con Cuenta Regresiva (Docente) -->
            @if (proximaClase(); as pc) {
              <div class="rounded-2xl p-5 border transition-all duration-300 shadow-warm-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                   [ngClass]="pc.enCurso 
                     ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-warm-50 border-emerald-300 ring-1 ring-emerald-400/30' 
                     : 'bg-gradient-to-r from-warm-50 via-white to-primary-50/40 border-primary-200/80'">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                       [ngClass]="pc.enCurso ? 'bg-emerald-600 text-white shadow-emerald-sm' : 'bg-primary-900 text-white shadow-warm-sm'">
                    @if (pc.enCurso) {
                      <svg class="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    } @else {
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    }
                  </div>
                  <div>
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md"
                            [ngClass]="pc.enCurso ? 'bg-emerald-100 text-emerald-800' : 'bg-primary-100 text-primary-900'">
                        {{ pc.codigo }}
                      </span>
                      <span class="text-xs font-bold px-2.5 py-0.5 rounded-full"
                            [ngClass]="pc.enCurso ? 'bg-emerald-600 text-white animate-pulse' : 'bg-warm-200 text-warm-800'">
                        {{ pc.tiempoRestanteTexto }}
                      </span>
                      <span class="text-xs text-warm-500 font-medium">| {{ pc.dia }} {{ pc.horaInicio }} - {{ pc.horaFin }}</span>
                    </div>
                    <h3 class="font-serif font-bold text-warm-900 text-base sm:text-lg mt-1">
                      {{ pc.materia }}
                    </h3>
                    <p class="text-xs text-warm-600 flex flex-wrap items-center gap-2 mt-0.5">
                      <span class="font-semibold text-warm-800">Aula: {{ pc.aula }}</span>
                      <span>•</span>
                      <span>{{ pc.subtitulo }}</span>
                      <span>•</span>
                      <span class="text-primary-700 font-medium">{{ pc.tiempoDetalleBadge }}</span>
                    </p>
                  </div>
                </div>

                <div class="shrink-0 w-full sm:w-auto flex items-center justify-end gap-2">
                  <a routerLink="/app/asistencia" class="w-full sm:w-auto">
                    <app-button variant="accent" size="sm" [fullWidth]="true">
                      Tomar Asistencia →
                    </app-button>
                  </a>
                </div>
              </div>
            }

            <!-- Sección de Asignaturas Habilitadas -->
            <section class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="font-serif text-xl sm:text-2xl font-bold text-warm-900">Mis Asignaturas Habilitadas</h2>
                  <p class="text-xs text-warm-500">Cursos asignados para la toma y control de asistencia de la jornada</p>
                </div>
                <a routerLink="/app/docente/grupos">
                  <app-button variant="secondary" size="sm">Ver Todos los Grupos →</app-button>
                </a>
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
        }

        <!-- ==================== ROL ESTUDIANTE ==================== -->
        @case ('ESTUDIANTE') {
          <div class="space-y-8">
            <!-- Widget Destacado de Próxima Clase con Cuenta Regresiva (Estudiante) -->
            @if (proximaClase(); as pc) {
              <div class="rounded-2xl p-5 border transition-all duration-300 shadow-warm-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                   [ngClass]="pc.enCurso 
                     ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-warm-50 border-emerald-300 ring-1 ring-emerald-400/30' 
                     : 'bg-gradient-to-r from-warm-50 via-white to-primary-50/40 border-primary-200/80'">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                       [ngClass]="pc.enCurso ? 'bg-emerald-600 text-white shadow-emerald-sm' : 'bg-primary-900 text-white shadow-warm-sm'">
                    @if (pc.enCurso) {
                      <svg class="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    } @else {
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    }
                  </div>
                  <div>
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md"
                            [ngClass]="pc.enCurso ? 'bg-emerald-100 text-emerald-800' : 'bg-primary-100 text-primary-900'">
                        {{ pc.codigo }}
                      </span>
                      <span class="text-xs font-bold px-2.5 py-0.5 rounded-full"
                            [ngClass]="pc.enCurso ? 'bg-emerald-600 text-white animate-pulse' : 'bg-warm-200 text-warm-800'">
                        {{ pc.tiempoRestanteTexto }}
                      </span>
                      <span class="text-xs text-warm-500 font-medium">| {{ pc.dia }} {{ pc.horaInicio }} - {{ pc.horaFin }}</span>
                    </div>
                    <h3 class="font-serif font-bold text-warm-900 text-base sm:text-lg mt-1">
                      {{ pc.materia }}
                    </h3>
                    <p class="text-xs text-warm-600 flex flex-wrap items-center gap-2 mt-0.5">
                      <span class="font-semibold text-warm-800">Aula: {{ pc.aula }}</span>
                      <span>•</span>
                      <span>{{ pc.subtitulo }}</span>
                      <span>•</span>
                      <span class="text-primary-700 font-medium">{{ pc.tiempoDetalleBadge }}</span>
                    </p>
                  </div>
                </div>

                <div class="shrink-0 w-full sm:w-auto flex items-center justify-end gap-2">
                  <a routerLink="/app/estudiante/horarios" class="w-full sm:w-auto">
                    <app-button variant="accent" size="sm" [fullWidth]="true">
                      Ver Horario Completo →
                    </app-button>
                  </a>
                </div>
              </div>
            }

            <!-- Sección de Materias Matriculadas con % de Asistencia -->
            <section class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="font-serif text-xl sm:text-2xl font-bold text-warm-900">Mis Materias y Resumen de Asistencia</h2>
                  <p class="text-xs text-warm-500">Monitoreo en tiempo real de asistencias, inasistencias y solicitudes de revisión</p>
                </div>
                <a routerLink="/app/estudiante/materias">
                  <app-button variant="secondary" size="sm">Ver Todas las Materias →</app-button>
                </a>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                @for (mat of materias(); track mat.id) {
                  <app-card [hoverable]="true" [title]="mat.nombre" [subtitle]="mat.codigo + ' • Grupo ' + mat.grupo">
                    <div class="space-y-4 my-2 text-xs text-warm-700">
                      <!-- Barra de Progreso de Asistencia -->
                      <div>
                        <div class="flex items-center justify-between mb-1.5">
                          <span class="font-medium text-warm-600">Cumplimiento de Asistencia:</span>
                          <span class="font-bold text-sm" [ngClass]="mat.porcentajeAsistencia >= 80 ? 'text-emerald-700' : 'text-rose-700'">
                            {{ mat.porcentajeAsistencia }}%
                          </span>
                        </div>
                        <div class="w-full bg-warm-100 rounded-full h-2.5 overflow-hidden">
                          <div
                            class="h-2.5 rounded-full transition-all duration-500"
                            [ngClass]="mat.porcentajeAsistencia >= 80 ? 'bg-emerald-600' : 'bg-rose-500'"
                            [style.width.%]="mat.porcentajeAsistencia"
                          ></div>
                        </div>
                      </div>

                      <!-- Ficha resumida -->
                      <div class="grid grid-cols-2 gap-2 bg-warm-50 p-3 rounded-xl">
                        <div>
                          <span class="text-warm-400 text-[10px] block">Docente</span>
                          <span class="font-semibold text-warm-900 text-xs">{{ mat.docente }}</span>
                        </div>
                        <div>
                          <span class="text-warm-400 text-[10px] block">Horario y Aula</span>
                          <span class="font-semibold text-warm-900 text-xs">{{ mat.horario }} ({{ mat.aula }})</span>
                        </div>
                      </div>

                      <div class="flex items-center justify-between pt-2 border-t border-warm-100">
                        <div class="flex items-center gap-2">
                          <span class="text-emerald-700 font-semibold">{{ mat.asistencias }} asistencias</span>
                          <span class="text-warm-300">•</span>
                          <span class="text-rose-700 font-semibold">{{ mat.inasistencias }} fallas</span>
                        </div>
                        <app-badge [variant]="mat.estado === 'Al día' ? 'success' : 'danger'">
                          {{ mat.estado }}
                        </app-badge>
                      </div>
                    </div>

                    <div card-footer class="mt-4 pt-3 border-t border-warm-100 flex items-center justify-end">
                      <a routerLink="/app/estudiante/materias" class="w-full">
                        <app-button variant="secondary" size="sm" [fullWidth]="true">
                          Ver Desglose de Sesiones y Reclamar
                        </app-button>
                      </a>
                    </div>
                  </app-card>
                }
              </div>
            </section>

            <!-- Acceso rápido a Horarios -->
            <section class="bg-warm-50 rounded-2xl p-6 border border-warm-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-800 shrink-0">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-serif font-bold text-warm-900 text-lg">Consulta tu Horario Semanal</h3>
                  <p class="text-xs text-warm-600">Revisa la distribución de tus clases por día, bloques horarios y salones de clase.</p>
                </div>
              </div>
              <a routerLink="/app/estudiante/horarios">
                <app-button variant="primary" size="md">
                  Ver Mi Horario Completo →
                </app-button>
              </a>
            </section>
          </div>
        }
      }
    </div>
  `,
})
export class OverviewComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private courseService = inject(CourseService);
  private adminService = inject(AdminManagementService);
  private deanService = inject(DeanManagementService);
  private coordinatorService = inject(CoordinatorManagementService);
  private studentService = inject(StudentManagementService);
  private claimService = inject(AttendanceClaimService);

  user = computed(() => this.authService.currentUser() || MOCK_USERS_BY_ROLE.DOCENTE);
  userRole = computed<UserRole>(() => this.user()?.role || 'DOCENTE');

  // Próxima Clase Reactiva (Docente y Estudiante)
  horariosDocente = signal<HorarioDocenteItem[]>([]);
  horariosEstudiante = signal<HorarioItem[]>([]);
  proximaClase = signal<ProximaClaseInfo | null>(null);
  private timerProximaClase: any = null;

  // Datos para Docente
  courses: Course[] = [];
  pendingClaimsCount = signal<number>(0);
  totalStudentsCount = signal<number>(0);

  // Datos para Administrador
  decanos = signal<DecanoItem[]>([]);
  totalFacultadesAdmin = computed<number>(() => {
    const list = this.decanos();
    if (!list || list.length === 0) return 0;
    const unique = new Set(list.map((d) => d.facultad).filter(Boolean));
    return unique.size || list.length;
  });

  // Datos para Decano
  coordinadores = signal<CoordinadorItem[]>([]);
  totalDocentesFacultad = computed<number>(() => {
    return this.coordinadores().reduce((acc, c) => acc + (c.totalDocentes || 0), 0);
  });
  totalGruposFacultad = computed<number>(() => {
    return this.coordinadores().reduce((acc, c) => acc + (c.totalGrupos || 0), 0);
  });

  // Datos para Coordinador
  docentes = signal<DocenteItem[]>([]);
  planesEstudio = signal<PlanEstudioItem[]>([]);
  totalGruposPrograma = computed<number>(() => {
    return this.docentes().reduce((acc, d) => acc + (d.totalGruposAsignados || 0), 0);
  });
  totalEstudiantesPrograma = signal<number>(0);

  // Datos para Estudiante
  materias = signal<MateriaEstudianteItem[]>([]);
  averageStudentAttendance = signal<number>(0);
  totalStudentAbsences = signal<number>(0);

  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadDataForRole(this.userRole());
  }

  ngOnDestroy(): void {
    if (this.timerProximaClase) {
      clearInterval(this.timerProximaClase);
      this.timerProximaClase = null;
    }
  }

  loadDataForRole(role: UserRole): void {
    this.isLoading.set(true);

    switch (role) {
      case 'ADMINISTRADOR':
      case 'ADMIN':
        this.adminService.getDecanos().subscribe({
          next: (res) => {
            if (res.exitoso && res.datos) {
              this.decanos.set(res.datos);
            }
            this.isLoading.set(false);
          },
          error: () => this.isLoading.set(false),
        });
        break;

      case 'DECANO':
        this.deanService.getCoordinadores().subscribe({
          next: (res) => {
            if (res.exitoso && res.datos) {
              this.coordinadores.set(res.datos);
            }
            this.isLoading.set(false);
          },
          error: () => this.isLoading.set(false),
        });
        break;

      case 'COORDINADOR':
        this.coordinatorService.getPlanesEstudio().subscribe({
          next: (res) => {
            if (res.exitoso && res.datos) {
              this.planesEstudio.set(res.datos);
            }
          },
        });
        this.coordinatorService.getDocentes().subscribe({
          next: (res) => {
            if (res.exitoso && res.datos) {
              this.docentes.set(res.datos);
            }
            this.isLoading.set(false);
          },
          error: () => this.isLoading.set(false),
        });
        this.coordinatorService.getEstudiantesDirectorio().subscribe({
          next: (res) => {
            if (res.exitoso && res.datos) {
              this.totalEstudiantesPrograma.set(res.datos.length);
            }
          },
        });
        break;

      case 'DOCENTE':
        this.claimService.getHorarioDocente().subscribe({
          next: (res) => {
            if (res.exitoso && res.datos) {
              this.horariosDocente.set(res.datos);
              this.recalcularProximaClase();
            }
          },
        });
        this.courseService.getTeacherCourses(this.user()?.id || '').subscribe({
          next: (res) => {
            if (res.exitoso && res.datos) {
              this.courses = res.datos;
              const total = res.datos.reduce((acc: number, c: Course) => acc + (c.enrolledStudentsCount || 0), 0);
              this.totalStudentsCount.set(total);
              this.recalcularProximaClase();
            }
            this.isLoading.set(false);
          },
          error: () => this.isLoading.set(false),
        });
        this.claimService.getReclamosDocente().subscribe({
          next: (res) => {
            if (res.exitoso && res.datos) {
              const pending = res.datos.filter((c: any) => c.estadoSolicitud === 'PENDIENTE').length;
              this.pendingClaimsCount.set(pending);
            }
          },
        });
        this.iniciarTimerProximaClase();
        break;

      case 'ESTUDIANTE':
        this.studentService.getHorarios().subscribe({
          next: (res) => {
            if (res.exitoso && res.datos) {
              this.horariosEstudiante.set(res.datos);
              this.recalcularProximaClase();
            }
          },
        });
        this.studentService.getMaterias().subscribe({
          next: (res) => {
            if (res.exitoso && res.datos) {
              this.materias.set(res.datos);
              if (res.datos.length > 0) {
                const avg = Math.round(res.datos.reduce((acc: number, m: any) => acc + m.porcentajeAsistencia, 0) / res.datos.length);
                const absences = res.datos.reduce((acc: number, m: any) => acc + m.inasistencias, 0);
                this.averageStudentAttendance.set(avg);
                this.totalStudentAbsences.set(absences);
              }
              this.recalcularProximaClase();
            }
            this.isLoading.set(false);
          },
          error: () => this.isLoading.set(false),
        });
        this.iniciarTimerProximaClase();
        break;

      default:
        this.isLoading.set(false);
        break;
    }
  }

  private iniciarTimerProximaClase(): void {
    if (this.timerProximaClase) {
      clearInterval(this.timerProximaClase);
    }
    this.timerProximaClase = setInterval(() => {
      this.recalcularProximaClase();
    }, 30000);
  }

  recalcularProximaClase(): void {
    const role = this.userRole();
    const items: Array<{
      codigoMateria: string;
      nombreMateria: string;
      dia: string;
      horaInicio: string;
      horaFin: string;
      aula: string;
      subtitulo: string;
    }> = [];

    if (role === 'DOCENTE') {
      const hd = this.horariosDocente();
      if (hd && hd.length > 0) {
        for (const h of hd) {
          items.push({
            codigoMateria: h.codigoMateria,
            nombreMateria: h.nombreMateria,
            dia: h.dia,
            horaInicio: h.horaInicio,
            horaFin: h.horaFin,
            aula: h.aula || 'Aula Principal',
            subtitulo: h.seccion || 'Grupo Docente',
          });
        }
      } else if (this.courses && this.courses.length > 0) {
        for (const c of this.courses) {
          const parsed = this.parseScheduleString(c.schedule);
          for (const p of parsed) {
            items.push({
              codigoMateria: c.code,
              nombreMateria: c.name,
              dia: p.dia,
              horaInicio: p.horaInicio,
              horaFin: p.horaFin,
              aula: c.room || 'Aula Principal',
              subtitulo: c.section || 'Sección',
            });
          }
        }
      }
    } else if (role === 'ESTUDIANTE') {
      const he = this.horariosEstudiante();
      if (he && he.length > 0) {
        for (const h of he) {
          items.push({
            codigoMateria: h.codigoMateria,
            nombreMateria: h.nombreMateria,
            dia: h.dia,
            horaInicio: h.horaInicio,
            horaFin: h.horaFin,
            aula: h.aula || 'Aula Asignada',
            subtitulo: `Grupo ${h.grupo || '01'}${h.docente ? ' • ' + h.docente : ''}`,
          });
        }
      } else if (this.materias() && this.materias().length > 0) {
        for (const m of this.materias()) {
          const parsed = this.parseScheduleString(m.horario);
          for (const p of parsed) {
            items.push({
              codigoMateria: m.codigo,
              nombreMateria: m.nombre,
              dia: p.dia,
              horaInicio: p.horaInicio,
              horaFin: p.horaFin,
              aula: m.aula || 'Aula Asignada',
              subtitulo: `Grupo ${m.grupo || '01'}${m.docente ? ' • ' + m.docente : ''}`,
            });
          }
        }
      }
    }

    this.proximaClase.set(this.calcularProximaClaseDesdeItems(items));
  }

  private calcularProximaClaseDesdeItems(
    items: Array<{
      codigoMateria: string;
      nombreMateria: string;
      dia: string;
      horaInicio: string;
      horaFin: string;
      aula: string;
      subtitulo: string;
    }>
  ): ProximaClaseInfo | null {
    if (!items || items.length === 0) return null;

    const now = new Date();
    const currentDay = now.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado

    interface Candidato {
      item: (typeof items)[0];
      startDate: Date;
      endDate: Date;
      enCurso: boolean;
      diffMs: number;
    }

    const candidatos: Candidato[] = [];

    for (const item of items) {
      const targetDay = this.parseDayToNumber(item.dia);
      if (targetDay === -1) continue;

      const tInicio = this.parseTime(item.horaInicio);
      const tFin = this.parseTime(item.horaFin);
      if (!tInicio) continue;

      const dayDiff = (targetDay - currentDay + 7) % 7;

      let startDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + dayDiff,
        tInicio.hours,
        tInicio.minutes,
        0,
        0
      );

      let endDate: Date;
      if (tFin) {
        endDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + dayDiff,
          tFin.hours,
          tFin.minutes,
          0,
          0
        );
      } else {
        endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
      }

      if (dayDiff === 0) {
        if (now >= startDate && now <= endDate) {
          candidatos.push({
            item,
            startDate,
            endDate,
            enCurso: true,
            diffMs: 0,
          });
          continue;
        } else if (now > endDate) {
          startDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
          endDate = new Date(endDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        }
      }

      const diffMs = startDate.getTime() - now.getTime();
      if (diffMs > 0) {
        candidatos.push({
          item,
          startDate,
          endDate,
          enCurso: false,
          diffMs,
        });
      }
    }

    if (candidatos.length === 0) return null;

    candidatos.sort((a, b) => {
      if (a.enCurso && !b.enCurso) return -1;
      if (!a.enCurso && b.enCurso) return 1;
      return a.diffMs - b.diffMs;
    });

    const elegido = candidatos[0];
    const diffMinutos = Math.max(0, Math.round(elegido.diffMs / 60000));

    let tiempoRestanteTexto = '';
    let tiempoDetalleBadge = '';

    const cleanDia = this.sanitizeDayName(elegido.item.dia);

    if (elegido.enCurso) {
      const minsParaTerminar = Math.max(1, Math.round((elegido.endDate.getTime() - now.getTime()) / 60000));
      tiempoRestanteTexto = `¡En curso ahora!`;
      tiempoDetalleBadge = `Finaliza en ${minsParaTerminar} min`;
    } else if (diffMinutos < 60) {
      tiempoRestanteTexto = diffMinutos <= 1 ? 'En 1 minuto' : `Faltan ${diffMinutos} min`;
      tiempoDetalleBadge = `En ${diffMinutos} min`;
    } else if (diffMinutos < 1440) {
      const horas = Math.floor(diffMinutos / 60);
      const mins = diffMinutos % 60;
      const minsStr = mins > 0 ? ` ${mins}m` : '';
      if (elegido.startDate.getDate() === now.getDate()) {
        tiempoRestanteTexto = `Hoy en ${horas}h${minsStr}`;
        tiempoDetalleBadge = `Hoy a las ${elegido.item.horaInicio}`;
      } else {
        tiempoRestanteTexto = `Mañana en ${horas}h${minsStr}`;
        tiempoDetalleBadge = `Mañana ${elegido.item.horaInicio}`;
      }
    } else {
      const dias = Math.floor(diffMinutos / 1440);
      tiempoRestanteTexto = `En ${dias} día${dias > 1 ? 's' : ''}`;
      tiempoDetalleBadge = `${cleanDia} ${elegido.item.horaInicio}`;
    }

    return {
      materia: elegido.item.nombreMateria,
      codigo: elegido.item.codigoMateria,
      aula: elegido.item.aula,
      subtitulo: elegido.item.subtitulo,
      dia: cleanDia,
      horaInicio: elegido.item.horaInicio,
      horaFin: elegido.item.horaFin,
      fechaProxima: elegido.startDate,
      enCurso: elegido.enCurso,
      tiempoRestanteTexto,
      tiempoDetalleBadge,
      minutosRestantes: diffMinutos,
    };
  }

  private parseDayToNumber(dayStr: string): number {
    if (!dayStr) return -1;
    const d = dayStr
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
    if (d.startsWith('dom')) return 0;
    if (d.startsWith('lun')) return 1;
    if (d.startsWith('mar')) return 2;
    if (d.startsWith('mi') || d.includes('ier')) return 3;
    if (d.startsWith('jue')) return 4;
    if (d.startsWith('vie')) return 5;
    if (d.startsWith('sab')) return 6;
    return -1;
  }

  private sanitizeDayName(dayStr: string): string {
    const num = this.parseDayToNumber(dayStr);
    switch (num) {
      case 0: return 'Domingo';
      case 1: return 'Lunes';
      case 2: return 'Martes';
      case 3: return 'Miércoles';
      case 4: return 'Jueves';
      case 5: return 'Viernes';
      case 6: return 'Sábado';
      default: return dayStr || '';
    }
  }

  private parseTime(timeStr: string): { hours: number; minutes: number } | null {
    if (!timeStr) return null;
    const parts = timeStr.trim().split(':');
    if (parts.length < 2) return null;
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    if (isNaN(hours) || isNaN(minutes)) return null;
    return { hours, minutes };
  }

  private parseScheduleString(schedule: string): Array<{ dia: string; horaInicio: string; horaFin: string }> {
    if (!schedule) return [];
    const res: Array<{ dia: string; horaInicio: string; horaFin: string }> = [];

    const timeMatch = schedule.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
    if (!timeMatch) return [];

    const horaInicio = timeMatch[1];
    const horaFin = timeMatch[2];

    const diasDetectados: string[] = [];
    const lower = schedule
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    if (lower.includes('lun')) diasDetectados.push('Lunes');
    if (lower.includes('mar')) diasDetectados.push('Martes');
    if (lower.includes('mie')) diasDetectados.push('Miércoles');
    if (lower.includes('jue')) diasDetectados.push('Jueves');
    if (lower.includes('vie')) diasDetectados.push('Viernes');
    if (lower.includes('sab')) diasDetectados.push('Sábado');
    if (lower.includes('dom')) diasDetectados.push('Domingo');

    for (const d of diasDetectados) {
      res.push({ dia: d, horaInicio, horaFin });
    }
    return res;
  }
}

