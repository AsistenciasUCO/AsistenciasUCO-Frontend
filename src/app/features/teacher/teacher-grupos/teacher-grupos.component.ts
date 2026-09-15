import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { SessionService } from '../../../core/services/session.service';
import { Course } from '../../../core/models/course.model';
import { ClassSession } from '../../../core/models/attendance.model';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { BadgeComponent, BadgeVariant } from '../../../shared/components/badge/badge.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { ToastService } from '../../../shared/components/toast/toast.component';

import { StudentService } from '../../../core/services/student.service';
import { AttendanceClaimService } from '../../../core/services/attendance-claim.service';
import { SolicitudRevisionItem } from '../../../core/models/role-management.model';
import { getApiErrorMessage } from '../../../core/api/errors/api-error.util';

type VistaGrupos = 'LISTA' | 'FORM_GRUPO' | 'HUB_GRUPO' | 'DETALLE_SESIONES' | 'FORM_SESION';

@Component({
  selector: 'app-teacher-grupos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    ButtonComponent,
    BadgeComponent,
    FormFieldComponent,
  ],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- 1. VISTA: LISTA PRINCIPAL DE GRUPOS -->
      @if (vistaActual() === 'LISTA') {
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
            <app-button variant="primary" size="md" (clicked)="abrirCrearGrupo()">
              <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Grupo
            </app-button>
            <app-button variant="secondary" size="md" (clicked)="irATomaAsistencia()">
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
            [(ngModel)]="searchQuery"
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
                        (click)="abrirEditarGrupo(course)"
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
                        (clicked)="verHubGrupo(course)"
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
                        (click)="abrirModalMatriculaGrupo(course)"
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
                        (click)="abrirModalProyeccionParaGrupo(course)"
                        class="text-xs font-bold text-primary-800 hover:text-primary-950 bg-accent-100 hover:bg-accent-200 border border-accent-300 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs"
                        title="Proyectar código QR y PIN para auto-registro de asistencia a sesión"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                        QR Asistencia
                      </button>

                      <app-button variant="primary" size="sm" (clicked)="tomarAsistenciaGrupo(course)">
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
      }

      <!-- 2. VISTA COMPLETA: FORMULARIO CREAR / EDITAR GRUPO -->
      @if (vistaActual() === 'FORM_GRUPO') {
        <div class="flex items-center justify-between bg-white p-4 rounded-2xl border border-warm-200 shadow-warm-sm">
          <button
            type="button"
            (click)="volverALista()"
            class="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-warm-700 hover:text-warm-950 bg-warm-50 hover:bg-warm-100 border border-warm-200 px-3.5 py-2 rounded-xl transition-all shadow-xs"
          >
            <svg class="w-4 h-4 text-warm-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a Mis Grupos
          </button>

          <span class="text-xs font-bold text-primary-800 bg-primary-50 border border-primary-200 px-3 py-1 rounded-full">
            {{ modoFormGrupo === 'CREAR' ? 'Nuevo Grupo' : 'Modificación de Grupo' }}
          </span>
        </div>

        <div class="bg-white p-6 sm:p-8 rounded-2xl border border-warm-200 shadow-warm-sm max-w-3xl mx-auto space-y-6">
          <div>
            <h2 class="font-serif font-bold text-2xl text-warm-900">
              {{ modoFormGrupo === 'CREAR' ? 'Apertura de Nuevo Grupo Académico' : 'Editar Información de Grupo' }}
            </h2>
            <p class="text-sm text-warm-600 mt-1">
              Define los parámetros de la asignatura, horario regular semanal, aula asignada y cupo de estudiantes.
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            @if (modoFormGrupo === 'CREAR') {
              <div class="sm:col-span-2">
                <app-form-field label="Asignatura Asignada al Docente" [required]="true">
                  <select
                    [(ngModel)]="grupoForm.asignaturaId"
                    (ngModelChange)="onAsignaturaChange($event)"
                    class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm font-semibold text-warm-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    <option value="">Selecciona una asignatura de tu carga académica...</option>
                    @for (asig of asignaturasDocente(); track asig.id) {
                      <option [value]="asig.id">
                        {{ asig.codigo }} — {{ asig.nombre }} ({{ asig.nombrePrograma || 'Programa UCO' }})
                      </option>
                    }
                  </select>
                </app-form-field>
              </div>
            }

            <app-form-field label="Código de la Asignatura" [required]="true">
              <input
                type="text"
                [(ngModel)]="grupoForm.code"
                [disabled]="modoFormGrupo === 'CREAR' && asignaturasDocente().length > 0"
                placeholder="Ej. MAT-301, FIS-202"
                class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </app-form-field>

            <app-form-field label="Sección / Grupo" [required]="true">
              <input
                type="text"
                [(ngModel)]="grupoForm.section"
                placeholder="Ej. Grupo 01, Sección B"
                class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </app-form-field>

            <div class="sm:col-span-2">
              <app-form-field label="Nombre de la Asignatura" [required]="true">
                <input
                  type="text"
                  [(ngModel)]="grupoForm.name"
                  [disabled]="modoFormGrupo === 'CREAR' && asignaturasDocente().length > 0"
                  placeholder="Ej. Matemática Avanzada III"
                  class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </app-form-field>
            </div>

            <!-- Selector de Días y Horas Estructurado -->
            <div class="sm:col-span-2 space-y-2 p-3.5 bg-warm-50/70 border border-warm-200 rounded-2xl">
              <label class="block text-xs font-bold text-warm-700 uppercase tracking-wider">
                Días de Clase Regular <span class="text-red-500">*</span>
              </label>
              <div class="flex flex-wrap gap-2">
                @for (d of ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']; track d) {
                  <button
                    type="button"
                    (click)="alternarDia(d)"
                    [class]="grupoForm.diasSeleccionados.includes(d)
                      ? 'px-3 py-1.5 rounded-xl text-xs font-bold bg-primary-700 text-white shadow-xs'
                      : 'px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-warm-200 text-warm-700 hover:bg-warm-100'"
                  >
                    {{ d }}
                  </button>
                }
              </div>
              <div class="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label class="block text-[11px] font-semibold text-warm-600 mb-1">Hora Inicio</label>
                  <input
                    type="time"
                    [(ngModel)]="grupoForm.horaInicio"
                    (ngModelChange)="actualizarHorarioTexto()"
                    class="w-full px-3 py-2 bg-white border border-warm-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
                <div>
                  <label class="block text-[11px] font-semibold text-warm-600 mb-1">Hora Fin</label>
                  <input
                    type="time"
                    [(ngModel)]="grupoForm.horaFin"
                    (ngModelChange)="actualizarHorarioTexto()"
                    class="w-full px-3 py-2 bg-white border border-warm-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </div>
              </div>
              <p class="text-[11px] text-warm-500">
                Horario configurado: <strong class="text-warm-800">{{ grupoForm.schedule }}</strong>
              </p>
            </div>

            <app-form-field label="Aula Asignada" [required]="true">
              <input
                type="text"
                [(ngModel)]="grupoForm.room"
                placeholder="Ej. Aula A-204, Lab L-102"
                class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </app-form-field>

            <app-form-field label="Cupo Máximo de Estudiantes" [required]="true">
              <input
                type="number"
                [(ngModel)]="grupoForm.cupoMaximo"
                min="1"
                max="100"
                placeholder="35"
                class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </app-form-field>

            <app-form-field label="Docente Responsable" [required]="true">
              <input
                type="text"
                [(ngModel)]="grupoForm.docenteName"
                placeholder="Ej. Dra. María Elena Rostagno"
                class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </app-form-field>

            @if (modoFormGrupo === 'CREAR') {
              <div class="sm:col-span-2 p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl space-y-3">
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <label class="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    Planificación y Creación de Sesiones
                  </label>
                </div>

                <div class="space-y-2.5">
                  <label class="flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer"
                    [class]="grupoForm.generarSesionesAutomaticas ? 'bg-white border-emerald-400 shadow-xs' : 'bg-warm-50/50 border-warm-200 hover:bg-white'">
                    <input
                      type="radio"
                      name="generarSesionesAutomaticas"
                      [value]="true"
                      [(ngModel)]="grupoForm.generarSesionesAutomaticas"
                      class="mt-1 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span class="text-sm font-bold text-warm-900">Generar automáticamente el cronograma semestral</span>
                      <p class="text-xs text-warm-600 mt-0.5">
                        Crea automáticamente todas las sesiones del período lectivo según los días y horas seleccionados.
                      </p>
                    </div>
                  </label>

                  <label class="flex items-start gap-3 p-2.5 rounded-xl border transition-all cursor-pointer"
                    [class]="!grupoForm.generarSesionesAutomaticas ? 'bg-white border-emerald-400 shadow-xs' : 'bg-warm-50/50 border-warm-200 hover:bg-white'">
                    <input
                      type="radio"
                      name="generarSesionesAutomaticas"
                      [value]="false"
                      [(ngModel)]="grupoForm.generarSesionesAutomaticas"
                      class="mt-1 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span class="text-sm font-bold text-warm-900">Creación manual de sesiones</span>
                      <p class="text-xs text-warm-600 mt-0.5">
                        Permite añadir sesiones una a una desde la vista de toma de asistencia o el hub del grupo.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            }
          </div>

          <div class="flex items-center justify-end gap-3 pt-4 border-t border-warm-100">
            <app-button variant="secondary" size="md" (clicked)="volverALista()">
              Cancelar
            </app-button>
            <app-button
              variant="primary"
              size="md"
              [disabled]="!grupoForm.code.trim() || !grupoForm.name.trim()"
              (clicked)="guardarGrupo()"
            >
              <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ modoFormGrupo === 'CREAR' ? 'Crear Grupo' : 'Guardar Cambios' }}
            </app-button>
          </div>
        </div>
      }

      <!-- 3. VISTA COMPLETA: HUB INTEGRAL DEL GRUPO (Punto 5 & HU175) -->
      @if (vistaActual() === 'HUB_GRUPO' && selectedCourse()) {
        <!-- Barra Superior de Retorno -->
        <div class="flex items-center justify-between bg-white p-4 rounded-2xl border border-warm-200 shadow-warm-sm">
          <button
            type="button"
            (click)="volverALista()"
            class="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-warm-700 hover:text-warm-950 bg-warm-50 hover:bg-warm-100 border border-warm-200 px-3.5 py-2 rounded-xl transition-all shadow-xs"
          >
            <svg class="w-4 h-4 text-warm-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a Mis Grupos
          </button>

          <div class="flex items-center gap-2">
            <span class="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-warm-100 text-warm-800">
              {{ selectedCourse()?.code }} • {{ selectedCourse()?.section }}
            </span>
            <app-badge variant="success">Grupo Activo</app-badge>
          </div>
        </div>

        <!-- Ficha de Encabezado Bento del Grupo -->
        <div class="bg-white p-6 rounded-2xl border border-warm-200 shadow-warm-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="space-y-1.5">
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary-50 text-primary-800 border border-primary-200">
                {{ selectedCourse()?.code }}
              </span>
              <span class="text-xs font-bold text-warm-600">{{ selectedCourse()?.section }}</span>
              <span class="text-xs text-warm-400">•</span>
              <span class="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {{ selectedCourse()?.enrolledStudentsCount || estudiantesGrupo().length }} alumnos matriculados
              </span>
            </div>
            <h2 class="font-serif font-bold text-2xl text-warm-900">{{ selectedCourse()?.name }}</h2>
            <p class="text-xs text-warm-600">
              Horario Regular: <strong class="text-warm-900">{{ selectedCourse()?.schedule }}</strong> • Aula: <strong class="text-warm-900">{{ selectedCourse()?.room }}</strong> • Docente: <strong class="text-warm-900">{{ selectedCourse()?.docenteName }}</strong>
            </p>
          </div>

          <!-- Acciones Rápidas del Docente -->
          <div class="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              (click)="abrirModalMatriculaGrupo(selectedCourse()!)"
              class="px-4 py-2 text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-xl transition-all shadow-sm inline-flex items-center gap-2"
              title="Código QR y PIN de acceso para matrícula de estudiantes al grupo"
            >
              <svg class="w-4 h-4 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              QR Matrícula
            </button>

            <button
              type="button"
              (click)="abrirModalProyeccionAsistencia()"
              class="px-4 py-2 text-xs font-bold text-white bg-primary-800 hover:bg-primary-900 rounded-xl transition-all shadow-sm inline-flex items-center gap-2"
              title="HU175: Proyectar código QR y PIN en pantalla para auto-registro de estudiantes"
            >
              <svg class="w-4 h-4 text-accent-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              Proyectar QR Asistencia
            </button>

            <app-button variant="secondary" size="md" (clicked)="tomarAsistenciaGrupo(selectedCourse()!)">
              <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Planilla Manual
            </app-button>
          </div>
        </div>

        <!-- Navegación por Sub-Pestañas del Hub -->
        <div class="flex border-b border-warm-200 gap-2 bg-white px-4 pt-2 rounded-t-2xl shadow-xs">
          <button
            type="button"
            (click)="subPestanaHub.set('SESIONES')"
            [class]="subPestanaHub() === 'SESIONES' ? 'border-primary-700 text-primary-900 font-bold' : 'border-transparent text-warm-500 hover:text-warm-800 font-medium'"
            class="px-4 py-3 text-xs sm:text-sm border-b-2 transition-colors inline-flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Sesiones de Clase
            <span class="px-2 py-0.5 rounded-full text-[11px] bg-warm-100 text-warm-700">{{ sessions().length }}</span>
          </button>

          <button
            type="button"
            (click)="subPestanaHub.set('HORARIOS')"
            [class]="subPestanaHub() === 'HORARIOS' ? 'border-primary-700 text-primary-900 font-bold' : 'border-transparent text-warm-500 hover:text-warm-800 font-medium'"
            class="px-4 py-3 text-xs sm:text-sm border-b-2 transition-colors inline-flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Horario & Aula
          </button>

          <button
            type="button"
            (click)="subPestanaHub.set('ESTUDIANTES')"
            [class]="subPestanaHub() === 'ESTUDIANTES' ? 'border-primary-700 text-primary-900 font-bold' : 'border-transparent text-warm-500 hover:text-warm-800 font-medium'"
            class="px-4 py-3 text-xs sm:text-sm border-b-2 transition-colors inline-flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Alumnos Matriculados
            <span class="px-2 py-0.5 rounded-full text-[11px] bg-emerald-100 text-emerald-800">{{ estudiantesGrupo().length }}</span>
          </button>

          <button
            type="button"
            (click)="subPestanaHub.set('RECLAMOS')"
            [class]="subPestanaHub() === 'RECLAMOS' ? 'border-primary-700 text-primary-900 font-bold' : 'border-transparent text-warm-500 hover:text-warm-800 font-medium'"
            class="px-4 py-3 text-xs sm:text-sm border-b-2 transition-colors inline-flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Reclamos & Novedades
            <span class="px-2 py-0.5 rounded-full text-[11px] bg-amber-100 text-amber-800">{{ reclamosGrupo().length }}</span>
          </button>
        </div>

        <!-- 3.A. SUB-PESTAÑA: SESIONES DE CLASE -->
        @if (subPestanaHub() === 'SESIONES') {
          <div class="bg-white rounded-b-2xl border-x border-b border-warm-200 shadow-warm-sm overflow-hidden space-y-4 p-5">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-warm-100">
              <div>
                <h3 class="font-serif font-bold text-lg text-warm-900">Cronograma de Sesiones de Clase</h3>
                <p class="text-xs text-warm-500">Sesiones regulares programadas, reposiciones y sesiones extraordinarias registradas.</p>
              </div>
              <app-button variant="primary" size="sm" (clicked)="abrirCrearSesionExtraordinaria()">
                <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                + Programar Sesión Extraordinaria
              </app-button>
            </div>

            @if (loadingSessions()) {
              <div class="p-6 space-y-3">
                @for (n of [1, 2, 3]; track n) {
                  <div class="h-16 bg-warm-100 rounded-xl animate-pulse"></div>
                }
              </div>
            } @else if (sessions().length === 0) {
              <div class="p-12 text-center text-warm-400">
                <p class="text-sm">No hay sesiones registradas para este grupo.</p>
              </div>
            } @else {
              <div class="divide-y divide-warm-100">
                @for (sesion of sessions(); track sesion.id) {
                  <div class="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-warm-50/50 transition-colors">
                    <div class="space-y-1.5 flex-1 min-w-0">
                      <div class="flex flex-wrap items-center gap-2">
                        <span class="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-warm-100 text-warm-800">
                          #{{ sesion.sessionNumber }}
                        </span>
                        <app-badge [variant]="getTipoSesionVariant(sesion.tipo)">
                          {{ sesion.tipo || 'REGULAR' }}
                        </app-badge>
                        <span class="text-xs font-medium text-warm-600">{{ sesion.date }}</span>
                        <span class="text-warm-300">•</span>
                        <span class="text-xs font-mono font-bold text-warm-800">{{ sesion.startTime }} - {{ sesion.endTime }}</span>
                        <span class="text-warm-300">•</span>
                        <span class="text-xs text-warm-600 bg-warm-100/60 px-2 py-0.5 rounded-md">
                          Aula: {{ sesion.room || selectedCourse()?.room }}
                        </span>
                      </div>

                      <h4 class="font-bold text-sm text-warm-900 leading-snug">
                        {{ sesion.title }}
                      </h4>
                      <p class="text-xs text-warm-500 line-clamp-1">{{ sesion.topic }}</p>
                    </div>

                    <!-- Botones de Acción sobre la Sesión -->
                    <div class="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        (click)="proyectarSesionEspecifica(sesion)"
                        class="text-xs font-bold text-primary-800 hover:text-primary-950 bg-accent-100 hover:bg-accent-200 border border-accent-300 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5"
                        title="Proyectar QR/PIN específico de esta sesión"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                        QR / PIN
                      </button>

                      <app-badge [variant]="sesion.status === 'CONCLUIDA' ? 'neutral' : (sesion.topic.startsWith('[CANCELADA]') ? 'danger' : 'info')">
                        {{ sesion.topic.startsWith('[CANCELADA]') ? 'CANCELADA' : sesion.status }}
                      </app-badge>

                      <button
                        type="button"
                        (click)="abrirEditarSesion(sesion)"
                        class="text-xs font-semibold text-primary-800 hover:text-primary-950 bg-primary-50 hover:bg-primary-100 border border-primary-200 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                        title="Modificar horario o aula de la sesión"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Ajustar Horario
                      </button>

                      @if (sesion.status !== 'CONCLUIDA' && !sesion.topic.startsWith('[CANCELADA]')) {
                        <button
                          type="button"
                          (click)="abrirModalCancelarSesion(sesion)"
                          class="text-xs font-semibold text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                          title="Cancelar una sesión de clase con motivo lectivo"
                        >
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Cancelar
                        </button>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }

        <!-- 3.B. SUB-PESTAÑA: HORARIO & ESPACIO FÍSICO -->
        @if (subPestanaHub() === 'HORARIOS') {
          <div class="bg-white rounded-b-2xl border-x border-b border-warm-200 shadow-warm-sm p-6 space-y-6">
            <div>
              <h3 class="font-serif font-bold text-lg text-warm-900">Distribución Horaria y Espacio Asignado</h3>
              <p class="text-xs text-warm-500">Parámetros operativos de la franja lectiva semanal y capacidad física.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div class="p-5 rounded-2xl bg-warm-50 border border-warm-200/80 space-y-2">
                <span class="text-xs font-bold uppercase tracking-wider text-warm-500">Franja Semanal</span>
                <p class="text-xl font-bold text-warm-900">{{ selectedCourse()?.schedule }}</p>
                <p class="text-xs text-warm-600">Modalidad Presencial Obligatoria</p>
              </div>

              <div class="p-5 rounded-2xl bg-warm-50 border border-warm-200/80 space-y-2">
                <span class="text-xs font-bold uppercase tracking-wider text-warm-500">Espacio Físico / Aula</span>
                <p class="text-xl font-bold text-primary-800">{{ selectedCourse()?.room }}</p>
                <p class="text-xs text-warm-600">Sede Principal Rionegro • Campus Central</p>
              </div>

              <div class="p-5 rounded-2xl bg-warm-50 border border-warm-200/80 space-y-2">
                <span class="text-xs font-bold uppercase tracking-wider text-warm-500">Aforo y Capacidad</span>
                <p class="text-xl font-bold text-emerald-700">{{ selectedCourse()?.cupoMaximo || 35 }} Cupos Máximos</p>
                <p class="text-xs text-warm-600">Ocupación actual: {{ selectedCourse()?.enrolledStudentsCount || estudiantesGrupo().length }} matriculados</p>
              </div>
            </div>

            <div class="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-3">
              <svg class="w-5 h-5 text-blue-700 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p class="font-bold">Política Institucional de Horarios</p>
                <p class="mt-0.5 text-blue-800">
                  Cualquier ajuste permanente en el bloque horario semanal o cambio de aula asignada requiere coordinación con la Dirección de Programa para evitar cruces con otros semestres.
                </p>
              </div>
            </div>
          </div>
        }

        <!-- 3.C. SUB-PESTAÑA: ALUMNOS MATRICULADOS -->
        @if (subPestanaHub() === 'ESTUDIANTES') {
          <div class="bg-white rounded-b-2xl border-x border-b border-warm-200 shadow-warm-sm p-6 space-y-5">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-warm-100">
              <div>
                <h3 class="font-serif font-bold text-lg text-warm-900">Padrón de Estudiantes Matriculados</h3>
                <p class="text-xs text-warm-500">Listado oficial de estudiantes con asistencia habilitada para este grupo.</p>
              </div>
              <span class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                {{ estudiantesGrupo().length }} de {{ selectedCourse()?.cupoMaximo || 35 }} Cupos
              </span>
            </div>

            @if (cargandoEstudiantes()) {
              <div class="p-6 space-y-3">
                @for (n of [1, 2, 3]; track n) {
                  <div class="h-12 bg-warm-100 rounded-xl animate-pulse"></div>
                }
              </div>
            } @else if (estudiantesGrupo().length === 0) {
              <div class="p-12 text-center text-warm-400">
                <p class="text-sm">No hay estudiantes matriculados en este grupo actualmente.</p>
              </div>
            } @else {
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                @for (est of estudiantesGrupo(); track est.studentId) {
                  <div class="p-3.5 rounded-xl bg-warm-50 border border-warm-200 flex items-center justify-between gap-3">
                    <div class="min-w-0">
                      <p class="font-bold text-xs text-warm-900 truncate">{{ est.studentName }}</p>
                      <p class="text-[11px] font-mono text-warm-500">Doc / ID: {{ est.studentCode }}</p>
                    </div>
                    <span class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                      Activo
                    </span>
                  </div>
                }
              </div>
            }
          </div>
        }

        <!-- 3.D. SUB-PESTAÑA: RECLAMOS & NOVEDADES -->
        @if (subPestanaHub() === 'RECLAMOS') {
          <div class="bg-white rounded-b-2xl border-x border-b border-warm-200 shadow-warm-sm p-6 space-y-5">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-warm-100">
              <div>
                <h3 class="font-serif font-bold text-lg text-warm-900">Solicitudes de Revisión y Justificaciones</h3>
                <p class="text-xs text-warm-500">Inasistencias y retardos reportados por estudiantes para este curso.</p>
              </div>
              <button
                type="button"
                (click)="irAGestionReclamos()"
                class="text-xs font-semibold text-primary-800 hover:text-primary-950 bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-200 inline-flex items-center gap-1.5"
              >
                Abrir Portal de Reclamos Completo →
              </button>
            </div>

            @if (cargandoReclamos()) {
              <div class="p-6 space-y-3">
                @for (n of [1, 2]; track n) {
                  <div class="h-16 bg-warm-100 rounded-xl animate-pulse"></div>
                }
              </div>
            } @else if (reclamosGrupo().length === 0) {
              <div class="p-12 text-center text-warm-400">
                <p class="text-sm">No hay justificaciones ni reclamos pendientes en este grupo.</p>
              </div>
            } @else {
              <div class="space-y-3">
                @for (rec of reclamosGrupo(); track rec.id) {
                  <div class="p-4 rounded-xl border border-warm-200 bg-warm-50/50 space-y-2">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-warm-100 text-warm-800">
                          REC-#{{ rec.id.slice(0, 8).toUpperCase() }}
                        </span>
                        <span class="text-xs font-bold text-warm-900">{{ rec.estudianteNombre }}</span>
                      </div>
                      <app-badge [variant]="rec.estadoSolicitud === 'PENDIENTE' ? 'warning' : (rec.estadoSolicitud === 'APROBADA' ? 'success' : 'danger')">
                        {{ rec.estadoSolicitud }}
                      </app-badge>
                    </div>
                    <p class="text-xs text-warm-700 italic">"{{ rec.justificacionSolicitud }}"</p>
                    <div class="text-[11px] text-warm-500 flex items-center justify-between pt-1 border-t border-warm-200/60">
                      <span>Categoría: {{ rec.categoria || 'Médico / Salud' }}</span>
                      <span>Fecha: {{ rec.fechaSolicitud }}</span>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }
      }

      <!-- 4. VISTA COMPLETA: FORMULARIO SESIÓN (PROGRAMAR EXTRAORDINARIA / EDITAR BLOQUE) -->
      @if (vistaActual() === 'FORM_SESION' && selectedCourse()) {
        <div class="flex items-center justify-between bg-white p-4 rounded-2xl border border-warm-200 shadow-warm-sm">
          <button
            type="button"
            (click)="volverASesiones()"
            class="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-warm-700 hover:text-warm-950 bg-warm-50 hover:bg-warm-100 border border-warm-200 px-3.5 py-2 rounded-xl transition-all shadow-xs"
          >
            <svg class="w-4 h-4 text-warm-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a Sesiones de {{ selectedCourse()?.code }}
          </button>

          <span class="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
            {{ modoFormSesion === 'CREAR' ? 'Programación Extraordinaria' : 'Modificación de Bloque Horario' }}
          </span>
        </div>

        <div class="bg-white p-6 sm:p-8 rounded-2xl border border-warm-200 shadow-warm-sm max-w-2xl mx-auto space-y-6">
          <div>
            <h2 class="font-serif font-bold text-2xl text-warm-900">
              {{ modoFormSesion === 'CREAR' ? 'Programar Sesión Extraordinaria o Reposición' : 'Modificar Horario y Aula de la Sesión' }}
            </h2>
            <p class="text-sm text-warm-600 mt-1">
              Establece la fecha, horario de inicio y fin, aula y temática para este bloque de clase.
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="sm:col-span-2">
              <app-form-field label="Tipo de Sesión" [required]="true">
                <select
                  [(ngModel)]="sesionForm.tipo"
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
                  [(ngModel)]="sesionForm.title"
                  placeholder="Ej. Taller Extraordinario de Nivelación Previa al Examen"
                  class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </app-form-field>
            </div>

            <div class="sm:col-span-2">
              <app-form-field label="Temática / Descripción" [required]="true">
                <textarea
                  [(ngModel)]="sesionForm.topic"
                  rows="3"
                  placeholder="Describe los temas a abordar en este bloque..."
                  class="w-full p-3 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                ></textarea>
              </app-form-field>
            </div>

            <app-form-field label="Fecha de la Sesión" [required]="true">
              <input
                type="date"
                [(ngModel)]="sesionForm.date"
                class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </app-form-field>

            <app-form-field label="Aula Asignada" [required]="true">
              <input
                type="text"
                [(ngModel)]="sesionForm.room"
                placeholder="Ej. Aula A-204"
                class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </app-form-field>

            <app-form-field label="Hora de Inicio" [required]="true">
              <input
                type="time"
                [(ngModel)]="sesionForm.startTime"
                class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </app-form-field>

            <app-form-field label="Hora de Fin" [required]="true">
              <input
                type="time"
                [(ngModel)]="sesionForm.endTime"
                class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </app-form-field>
          </div>

          <div class="flex items-center justify-end gap-3 pt-4 border-t border-warm-100">
            <app-button variant="secondary" size="md" (clicked)="volverASesiones()">
              Cancelar
            </app-button>
            <app-button
              variant="primary"
              size="md"
              [disabled]="!sesionForm.title.trim() || !sesionForm.date"
              (clicked)="guardarSesion()"
            >
              <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ modoFormSesion === 'CREAR' ? 'Programar Sesión' : 'Guardar Horario' }}
            </app-button>
          </div>
        </div>
      }

      <!-- 5. MODAL: PROYECCIÓN ASISTENCIA EN PANTALLA (HU175 - QR DINÁMICO & PIN CORTO) -->
      @if (modalProyeccionVisible()) {
        <div class="fixed inset-0 bg-warm-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div class="bg-white rounded-3xl border border-warm-200 shadow-warm-2xl max-w-xl w-full overflow-hidden animate-scale-up">
            <!-- Header Modal Proyección -->
            <div class="p-6 border-b border-warm-100 flex items-center justify-between bg-warm-900 text-white">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-accent-400 text-warm-900 flex items-center justify-center font-bold">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-serif font-bold text-xl leading-tight">
                    Auto-Registro de Asistencia
                  </h3>
                  <p class="text-xs text-warm-300">
                    Proyección interactiva para el grupo {{ selectedCourse()?.code }}
                  </p>
                </div>
              </div>

              <button
                type="button"
                (click)="cerrarModalProyeccion()"
                class="p-2 rounded-xl text-warm-300 hover:text-white hover:bg-warm-800 transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="p-6 sm:p-8 space-y-6 text-center">
              <!-- Selector de Sesión si hay varias -->
              @if (sessions().length > 1) {
                <div class="flex items-center justify-center gap-2">
                  <label class="text-xs font-semibold text-warm-600">Sesión Activa:</label>
                  <select
                    [ngModel]="sesionActivaId()"
                    (ngModelChange)="cambiarSesionActiva($event)"
                    class="text-xs font-bold px-3 py-1.5 bg-warm-50 border border-warm-200 rounded-lg text-warm-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    @for (s of sessions(); track s.id) {
                      <option [value]="s.id">
                        #{{ s.sessionNumber }} — {{ s.title }} ({{ s.date }})
                      </option>
                    }
                  </select>
                </div>
              }

              <!-- Visualizador Bento: PIN Gigante & QR -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                <!-- Tarjeta PIN Alfanumérico -->
                <div class="p-6 rounded-2xl bg-amber-50/70 border-2 border-amber-300 shadow-warm-sm space-y-2">
                  <span class="text-xs font-bold uppercase tracking-wider text-amber-800">
                    PIN de Registro Rápido (PC)
                  </span>
                  <div class="font-mono font-extrabold text-4xl sm:text-5xl text-amber-950 tracking-widest my-2 select-all">
                    {{ datosQr()?.codigoAcceso || '849201' }}
                  </div>
                  <p class="text-[11px] text-amber-800 leading-tight">
                    Digítalo en tu portal estudiantil sin necesidad de cámara.
                  </p>
                </div>

                <!-- Tarjeta Código QR Dinámico -->
                <div class="p-5 rounded-2xl bg-warm-50 border-2 border-warm-200 shadow-warm-sm flex flex-col items-center space-y-2">
                  <span class="text-xs font-bold uppercase tracking-wider text-warm-700">
                    Escaneo Móvil (Cámara)
                  </span>
                  <!-- QR Renderizado con API institucional / SVG dinámico -->
                  <div class="w-36 h-36 bg-white p-2 rounded-xl border border-warm-300 shadow-inner flex items-center justify-center">
                    <img
                      [src]="'https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=' + (datosQr()?.token || 'UCO-QR-DEMO')"
                      alt="Código QR de Asistencia"
                      class="w-full h-full object-contain"
                    />
                  </div>
                  <span class="text-[10px] font-mono text-warm-500 truncate max-w-[180px]">
                    {{ datosQr()?.token || 'UCO-QR-ACTIVO' }}
                  </span>
                </div>
              </div>

              <!-- Contador de Expiración & Refresco -->
              <div class="p-4 rounded-2xl bg-warm-100/70 border border-warm-200 flex items-center justify-between">
                <div class="flex items-center gap-2 text-xs text-warm-700 text-left">
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Válido por: <strong class="font-mono font-bold text-warm-900">{{ segundosRestantes() }} segundos</strong></span>
                </div>

                <button
                  type="button"
                  (click)="refrescarQrManual()"
                  class="px-3 py-1.5 text-xs font-bold text-primary-800 hover:text-primary-950 bg-white hover:bg-warm-50 border border-warm-300 rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refrescar PIN ahora
                </button>
              </div>
            </div>

            <div class="p-4 border-t border-warm-100 bg-warm-50/70 flex items-center justify-between">
              <span class="text-xs text-warm-500">
                Los estudiantes deben pertenecer al grupo para registrar asistencia.
              </span>
              <app-button variant="secondary" size="sm" (clicked)="cerrarModalProyeccion()">
                Cerrar Proyector
              </app-button>
            </div>
          </div>
        </div>
      }

      <!-- 5.1 MODAL: QR Y PIN PARA MATRÍCULA DE ESTUDIANTES AL GRUPO -->
      @if (modalMatriculaGrupoVisible() && grupoMatricula()) {
        <div class="fixed inset-0 bg-warm-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div class="bg-white rounded-3xl border border-warm-200 shadow-warm-2xl max-w-lg w-full overflow-hidden animate-scale-up">
            <!-- Header Modal Matrícula -->
            <div class="p-6 border-b border-warm-100 flex items-center justify-between bg-emerald-900 text-white">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-emerald-400 text-emerald-950 flex items-center justify-center font-bold">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-serif font-bold text-xl leading-tight">
                    Inscripción y Matrícula al Grupo
                  </h3>
                  <p class="text-xs text-emerald-200">
                    {{ grupoMatricula()?.name }} • {{ grupoMatricula()?.code }} ({{ grupoMatricula()?.section }})
                  </p>
                </div>
              </div>

              <button
                type="button"
                (click)="cerrarModalMatriculaGrupo()"
                class="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="p-6 sm:p-8 space-y-6 text-center">
              <p class="text-xs sm:text-sm text-warm-600">
                Comparte este código PIN o proyecta el código QR para que los estudiantes se matriculen automáticamente a este grupo desde su portal estudiantil.
              </p>

              <!-- Bento: PIN & QR Matrícula -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
                <!-- Tarjeta PIN Matrícula -->
                <div class="p-5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 shadow-warm-sm space-y-2">
                  <span class="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    Código de Grupo (PIN)
                  </span>
                  <div class="font-mono font-extrabold text-3xl sm:text-4xl text-emerald-950 tracking-wider my-2 select-all">
                    {{ grupoMatricula()?.id }}
                  </div>
                  <button
                    type="button"
                    (click)="copiarPinMatricula()"
                    class="w-full py-2 px-3 text-xs font-bold bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl transition-all shadow-xs inline-flex items-center justify-center gap-1.5"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Copiar Código
                  </button>
                </div>

                <!-- Tarjeta QR Matrícula -->
                <div class="p-5 rounded-2xl bg-warm-50 border-2 border-warm-200 shadow-warm-sm flex flex-col items-center space-y-2">
                  <span class="text-xs font-bold uppercase tracking-wider text-warm-700">
                    Escanear para Matricularse
                  </span>
                  <div class="w-36 h-36 bg-white p-2 rounded-xl border border-warm-300 shadow-inner flex items-center justify-center">
                    <img
                      [src]="obtenerUrlQrMatricula(grupoMatricula())"
                      alt="Código QR de Matrícula"
                      class="w-full h-full object-contain"
                    />
                  </div>
                  <span class="text-[11px] font-mono text-warm-500">
                    ID: {{ grupoMatricula()?.code }}
                  </span>
                </div>
              </div>

              <!-- Enlace Directo Estudiante -->
              <div class="p-3.5 rounded-2xl bg-warm-50 border border-warm-200 flex items-center justify-between text-left gap-3">
                <div class="truncate text-xs text-warm-600">
                  <span class="font-bold text-warm-800">Enlace de auto-matrícula:</span>
                  <div class="font-mono text-[11px] truncate text-warm-500">
                    /app/estudiante/materias?matricularGrupo={{ grupoMatricula()?.id }}
                  </div>
                </div>
                <button
                  type="button"
                  (click)="copiarEnlaceMatricula()"
                  class="shrink-0 px-3 py-1.5 text-xs font-semibold bg-white hover:bg-warm-100 border border-warm-300 rounded-lg text-warm-700 transition-colors"
                >
                  Copiar Enlace
                </button>
              </div>
            </div>

            <div class="p-4 border-t border-warm-100 bg-warm-50/70 flex items-center justify-end">
              <app-button variant="secondary" size="sm" (clicked)="cerrarModalMatriculaGrupo()">
                Cerrar
              </app-button>
            </div>
          </div>
        </div>
      }

      <!-- 6. MODAL: CANCELAR SESIÓN DE CLASE -->
      @if (modalCancelarVisible() && sesionACancelar()) {
        <div class="fixed inset-0 bg-warm-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div class="bg-white rounded-2xl border border-warm-200 shadow-warm-xl max-w-md w-full overflow-hidden animate-scale-up">
            <div class="p-6 border-b border-warm-100 flex items-start justify-between bg-red-50/40">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-serif font-bold text-lg text-warm-900">
                    Cancelar Sesión Lectiva
                  </h3>
                  <p class="text-xs text-warm-500 mt-0.5">
                    Sesión #{{ sesionACancelar()?.sessionNumber }} • {{ sesionACancelar()?.date }}
                  </p>
                </div>
              </div>

              <button
                type="button"
                (click)="cerrarModalCancelar()"
                class="p-1 rounded-lg text-warm-400 hover:text-warm-700 hover:bg-warm-100 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="p-6 space-y-4">
              <p class="text-xs text-warm-600 leading-relaxed">
                Al cancelar formalmente esta clase, la sesión quedará bloqueada en el historial y se generará una notificación preventiva a los estudiantes del grupo.
              </p>

              <app-form-field label="Motivo de la Cancelación / Plan de Reposición" [required]="true">
                <textarea
                  [(ngModel)]="motivoCancelacion"
                  rows="4"
                  placeholder="Explica el motivo institucional o académico y la fecha estimada de reposición..."
                  class="w-full p-3 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                ></textarea>
              </app-form-field>
            </div>

            <div class="p-4 border-t border-warm-100 bg-warm-50/50 flex items-center justify-end gap-2.5">
              <app-button variant="secondary" size="sm" (clicked)="cerrarModalCancelar()">
                Cerrar
              </app-button>
              <button
                type="button"
                [disabled]="!motivoCancelacion.trim()"
                (click)="confirmarCancelarSesion()"
                class="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors inline-flex items-center gap-1.5 shadow-sm"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Confirmar Cancelación
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class TeacherGruposComponent implements OnInit {
  private courseService = inject(CourseService);
  private sessionService = inject(SessionService);
  private studentService = inject(StudentService);
  private claimService = inject(AttendanceClaimService);
  private router = inject(Router);
  private toast = inject(ToastService);

  vistaActual = signal<VistaGrupos>('LISTA');
  courses = signal<Course[]>([]);
  isLoading = signal<boolean>(true);
  searchQuery = '';

  // Hub del Grupo (Sub-pestañas: SESIONES, HORARIOS, ESTUDIANTES, RECLAMOS)
  subPestanaHub = signal<'SESIONES' | 'HORARIOS' | 'ESTUDIANTES' | 'RECLAMOS'>('SESIONES');
  estudiantesGrupo = signal<any[]>([]);
  cargandoEstudiantes = signal<boolean>(false);
  reclamosGrupo = signal<SolicitudRevisionItem[]>([]);
  cargandoReclamos = signal<boolean>(false);

  // Proyección de Asistencia QR / PIN (HU175)
  modalProyeccionVisible = signal<boolean>(false);
  sesionActivaId = signal<string>('');
  datosQr = signal<{
    token: string;
    codigoAcceso: string;
    expiraEnSegundos: number;
    expiraEn: string;
  } | null>(null);
  segundosRestantes = signal<number>(60);
  private timerInterval: any = null;

  // Matrícula al Grupo (QR & PIN)
  asignaturasDocente = signal<any[]>([]);
  modalMatriculaGrupoVisible = signal<boolean>(false);
  grupoMatricula = signal<Course | null>(null);

  // Formulario Grupo
  modoFormGrupo: 'CREAR' | 'EDITAR' = 'CREAR';
  selectedGrupoId: string | null = null;
  grupoForm = {
    asignaturaId: '',
    code: '',
    name: '',
    section: 'Grupo 01',
    schedule: 'Lunes, Miércoles 08:00 - 10:00',
    diasSeleccionados: ['Lunes', 'Miércoles'],
    horaInicio: '08:00',
    horaFin: '10:00',
    room: 'Aula A-204',
    cupoMaximo: 35,
    docenteName: 'Dra. María Elena Rostagno',
    generarSesionesAutomaticas: true,
  };

  // Gestión de Sesiones
  selectedCourse = signal<Course | null>(null);
  sessions = signal<ClassSession[]>([]);
  loadingSessions = signal<boolean>(false);

  // Formulario Sesión
  modoFormSesion: 'CREAR' | 'EDITAR' = 'CREAR';
  selectedSessionId: string | null = null;
  sesionForm = {
    tipo: 'EXTRAORDINARIA' as 'REGULAR' | 'EXTRAORDINARIA' | 'REPOSICION',
    title: '',
    topic: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '10:00',
    room: 'Aula A-204',
  };

  // Cancelación de Sesión
  modalCancelarVisible = signal<boolean>(false);
  sesionACancelar = signal<ClassSession | null>(null);
  motivoCancelacion = '';

  totalEstudiantes = () => {
    return this.courses().reduce((sum, c) => sum + (c.enrolledStudentsCount || 0), 0);
  };

  totalCupos = () => {
    return this.courses().reduce((sum, c) => sum + (c.cupoMaximo || 35), 0);
  };

  filteredCourses = computed(() => {
    const q = this.searchQuery.toLowerCase().trim();
    if (!q) return this.courses();
    return this.courses().filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.section.toLowerCase().includes(q) ||
        c.room.toLowerCase().includes(q)
    );
  });

  ngOnInit(): void {
    this.cargarGrupos();
    this.cargarAsignaturasDocente();
  }

  cargarAsignaturasDocente(): void {
    this.courseService.getAsignaturasDocente().subscribe({
      next: (res) => {
        if (res.exitoso && res.datos) {
          this.asignaturasDocente.set(res.datos);
        }
      },
      error: () => {},
    });
  }

  cargarGrupos(): void {
    this.isLoading.set(true);
    this.courseService.getTeacherCourses().subscribe({
      next: (res) => {
        this.courses.set(res.datos || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toast.error('Error al cargar grupos.');
      },
    });
  }

  getPorcentajeCupo(course: Course): number {
    const cupo = course.cupoMaximo || 35;
    return Math.min(100, Math.round((course.enrolledStudentsCount / cupo) * 100));
  }

  // --- NAVEGACIÓN GRUPO ---
  abrirCrearGrupo(): void {
    this.modoFormGrupo = 'CREAR';
    this.selectedGrupoId = null;
    this.cargarAsignaturasDocente();
    this.grupoForm = {
      asignaturaId: '',
      code: '',
      name: '',
      section: `Grupo 0${this.courses().length + 1}`,
      schedule: 'Lunes, Miércoles 08:00 - 10:00',
      diasSeleccionados: ['Lunes', 'Miércoles'],
      horaInicio: '08:00',
      horaFin: '10:00',
      room: 'Aula A-204',
      cupoMaximo: 35,
      docenteName: 'Dra. María Elena Rostagno',
      generarSesionesAutomaticas: true,
    };
    this.vistaActual.set('FORM_GRUPO');
  }

  onAsignaturaChange(asignaturaId: string): void {
    const encontrada = this.asignaturasDocente().find((a) => String(a.id) === String(asignaturaId));
    if (encontrada) {
      this.grupoForm.code = encontrada.codigo || '';
      this.grupoForm.name = encontrada.nombre || '';
    }
  }

  alternarDia(dia: string): void {
    const idx = this.grupoForm.diasSeleccionados.indexOf(dia);
    if (idx >= 0) {
      if (this.grupoForm.diasSeleccionados.length > 1) {
        this.grupoForm.diasSeleccionados.splice(idx, 1);
      } else {
        this.toast.warning('Debes seleccionar al menos un día para la clase.');
      }
    } else {
      this.grupoForm.diasSeleccionados.push(dia);
    }
    this.actualizarHorarioTexto();
  }

  actualizarHorarioTexto(): void {
    const dias = this.grupoForm.diasSeleccionados.join(', ');
    const inicio = this.grupoForm.horaInicio || '08:00';
    const fin = this.grupoForm.horaFin || '10:00';
    this.grupoForm.schedule = `${dias} ${inicio} - ${fin}`;
  }

  abrirEditarGrupo(course: Course): void {
    this.modoFormGrupo = 'EDITAR';
    this.selectedGrupoId = course.id;
    this.grupoForm = {
      asignaturaId: '',
      code: course.code,
      name: course.name,
      section: course.section,
      schedule: course.schedule,
      diasSeleccionados: ['Lunes', 'Miércoles'],
      horaInicio: '08:00',
      horaFin: '10:00',
      room: course.room,
      cupoMaximo: course.cupoMaximo || 35,
      docenteName: course.docenteName,
      generarSesionesAutomaticas: false,
    };
    this.vistaActual.set('FORM_GRUPO');
  }

  guardarGrupo(): void {
    if (this.modoFormGrupo === 'CREAR') {
      if (this.asignaturasDocente().length > 0 && !this.grupoForm.asignaturaId) {
        this.toast.warning('El campo Asignatura Asignada es obligatorio.');
        return;
      }
      if (!this.grupoForm.code.trim()) {
        this.toast.warning('El campo Código de la Asignatura es obligatorio.');
        return;
      }
      if (!this.grupoForm.name.trim()) {
        this.toast.warning('El campo Nombre de la Asignatura es obligatorio.');
        return;
      }
      if (!this.grupoForm.section.trim()) {
        this.toast.warning('El campo Sección / Grupo es obligatorio.');
        return;
      }
      if (!this.grupoForm.diasSeleccionados || this.grupoForm.diasSeleccionados.length === 0) {
        this.toast.warning('El campo Días de Clase Regular requiere seleccionar al menos un día.');
        return;
      }
      if (!this.grupoForm.horaInicio || !this.grupoForm.horaFin) {
        this.toast.warning('Los campos Hora Inicio y Hora Fin son obligatorios.');
        return;
      }
      if (this.grupoForm.horaInicio >= this.grupoForm.horaFin) {
        this.toast.warning('El campo Hora Fin de la clase debe ser posterior a la Hora Inicio.');
        return;
      }
      if (!this.grupoForm.room.trim()) {
        this.toast.warning('El campo Aula Asignada es obligatorio.');
        return;
      }
      if (!this.grupoForm.cupoMaximo || this.grupoForm.cupoMaximo < 1) {
        this.toast.warning('El campo Cupo Máximo de Estudiantes debe ser un valor numérico mayor a cero.');
        return;
      }
      if (!this.grupoForm.docenteName.trim()) {
        this.toast.warning('El campo Docente Responsable es obligatorio.');
        return;
      }

      this.actualizarHorarioTexto();
      this.courseService
        .crearGrupo({
          asignaturaId: this.grupoForm.asignaturaId,
          code: this.grupoForm.code.trim(),
          name: this.grupoForm.name.trim(),
          section: this.grupoForm.section.trim(),
          schedule: this.grupoForm.schedule.trim(),
          dias: this.grupoForm.diasSeleccionados,
          horaInicio: this.grupoForm.horaInicio,
          horaFin: this.grupoForm.horaFin,
          room: this.grupoForm.room.trim(),
          cupoMaximo: this.grupoForm.cupoMaximo,
          docenteName: this.grupoForm.docenteName.trim(),
          generarSesionesAutomaticas: this.grupoForm.generarSesionesAutomaticas,
        } as any)
        .subscribe({
          next: (res) => {
            if (res.exitoso) {
              this.toast.success(res.mensajeUsuario || 'Grupo creado con éxito.');
              this.cargarGrupos();
              this.volverALista();
            } else {
              this.toast.error(res.mensajeUsuario || 'No fue posible crear el grupo.');
            }
          },
          error: (err) => {
            const errorMsg = getApiErrorMessage(err);
            this.toast.error(errorMsg || 'Error al crear el grupo.');
          },
        });
    } else if (this.selectedGrupoId) {
      this.courseService
        .actualizarGrupo(this.selectedGrupoId, {
          code: this.grupoForm.code.trim(),
          name: this.grupoForm.name.trim(),
          section: this.grupoForm.section.trim(),
          schedule: this.grupoForm.schedule.trim(),
          room: this.grupoForm.room.trim(),
          cupoMaximo: this.grupoForm.cupoMaximo,
          docenteName: this.grupoForm.docenteName.trim(),
        })
        .subscribe({
          next: (res) => {
            if (res.exitoso) {
              this.toast.success(res.mensajeUsuario || 'Grupo modificado.');
              this.cargarGrupos();
              this.volverALista();
            }
          },
          error: (err) => this.toast.error(getApiErrorMessage(err)),
        });
    }
  }

  // --- MODAL MATRÍCULA AL GRUPO (QR & PIN) ---
  abrirModalMatriculaGrupo(course: Course): void {
    this.grupoMatricula.set(course);
    this.modalMatriculaGrupoVisible.set(true);
  }

  cerrarModalMatriculaGrupo(): void {
    this.modalMatriculaGrupoVisible.set(false);
    this.grupoMatricula.set(null);
  }

  copiarPinMatricula(): void {
    const grupo = this.grupoMatricula();
    if (grupo && grupo.id) {
      navigator.clipboard.writeText(String(grupo.id));
      this.toast.success(`PIN ${grupo.id} copiado al portapapeles.`);
    }
  }

  copiarEnlaceMatricula(): void {
    const grupo = this.grupoMatricula();
    if (grupo && grupo.id) {
      const url = `${window.location.origin}/app/estudiante/materias?matricularGrupo=${grupo.id}`;
      navigator.clipboard.writeText(url);
      this.toast.success('Enlace de auto-matrícula copiado.');
    }
  }

  obtenerUrlQrMatricula(course: Course | null): string {
    if (!course) return '';
    const payload = JSON.stringify({
      tipo: 'MATRICULA_GRUPO',
      grupoId: course.id,
      codigo: course.code,
      materia: course.name,
    });
    return `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(payload)}`;
  }

  volverALista(): void {
    this.detenerTimerQr();
    this.vistaActual.set('LISTA');
    this.selectedCourse.set(null);
  }

  // --- NAVEGACIÓN HUB DEL GRUPO (Punto 5 & HU175) ---
  verHubGrupo(course: Course): void {
    this.selectedCourse.set(course);
    this.subPestanaHub.set('SESIONES');
    this.vistaActual.set('HUB_GRUPO');
    this.cargarSesiones(course.id);
    this.cargarEstudiantesGrupo(course.id);
    this.cargarReclamosGrupo();
  }

  cargarEstudiantesGrupo(courseId: string): void {
    this.cargandoEstudiantes.set(true);
    this.studentService.getStudentsByGroup(courseId).subscribe({
      next: (res: any) => {
        const list = res?.items || res?.datos || (Array.isArray(res) ? res : []);
        this.estudiantesGrupo.set(list);
        this.cargandoEstudiantes.set(false);
      },
      error: () => {
        this.cargandoEstudiantes.set(false);
      },
    });
  }

  cargarReclamosGrupo(): void {
    this.cargandoReclamos.set(true);
    this.claimService.getReclamosDocente().subscribe({
      next: (res) => {
        // Filtramos reclamos relacionados con la materia del curso si aplica
        const todos = res.datos || [];
        const course = this.selectedCourse();
        const filtrados = course
          ? todos.filter(
              (r: any) =>
                !r.materiaNombre ||
                r.materiaNombre.toLowerCase().includes(course.name.toLowerCase()) ||
                r.materiaCodigo.toLowerCase().includes(course.code.toLowerCase())
            )
          : todos;
        this.reclamosGrupo.set(filtrados.length > 0 ? filtrados : todos.slice(0, 3));
        this.cargandoReclamos.set(false);
      },
      error: () => {
        this.cargandoReclamos.set(false);
      },
    });
  }

  irAGestionReclamos(): void {
    this.router.navigate(['/app/docente/reclamos']);
  }

  // --- PROYECCIÓN ASISTENCIA QR / PIN (HU175) ---
  abrirModalProyeccionParaGrupo(course: Course): void {
    this.selectedCourse.set(course);
    this.sessionService.getSessionsByGroup(course.id).subscribe({
      next: (res) => {
        const list = res.datos || [];
        this.sessions.set(list);
        if (list.length === 0) {
          // Si no hay sesiones aún, generar sesión automática de hoy para permitir auto-asistencia
          this.sessionService
            .createSession(course.id, {
              title: `Sesión Lectiva - ${new Date().toLocaleDateString('es-CO')}`,
              topic: 'Control de Asistencia por Auto-Registro QR / PIN',
              date: new Date().toISOString().split('T')[0],
              startTime: '08:00',
              endTime: '10:00',
              room: course.room || 'Aula Presencial',
              tipo: 'REGULAR',
            })
            .subscribe({
              next: (created) => {
                if (created.datos) {
                  this.sessions.set([created.datos]);
                  this.sesionActivaId.set(created.datos.id);
                  this.modalProyeccionVisible.set(true);
                  this.obtenerQrParaSesion(created.datos.id);
                }
              },
              error: (err) => this.toast.error(getApiErrorMessage(err)),
            });
          return;
        }
        const activa = list.find((s: any) => s.status !== 'CONCLUIDA') || list[0];
        this.sesionActivaId.set(activa.id);
        this.modalProyeccionVisible.set(true);
        this.obtenerQrParaSesion(activa.id);
      },
      error: (err) => this.toast.error(getApiErrorMessage(err)),
    });
  }

  abrirModalProyeccionAsistencia(): void {
    const list = this.sessions();
    if (list.length === 0) {
      const course = this.selectedCourse();
      if (course) {
        this.abrirModalProyeccionParaGrupo(course);
        return;
      }
      this.toast.error('Primero debes tener al menos una sesión de clase programada.');
      return;
    }
    // Seleccionamos por defecto la primera sesión disponible o la no concluida
    const activa = list.find((s) => s.status !== 'CONCLUIDA') || list[0];
    this.sesionActivaId.set(activa.id);
    this.modalProyeccionVisible.set(true);
    this.obtenerQrParaSesion(activa.id);
  }

  proyectarSesionEspecifica(sesion: ClassSession): void {
    this.sesionActivaId.set(sesion.id);
    this.modalProyeccionVisible.set(true);
    this.obtenerQrParaSesion(sesion.id);
  }

  cambiarSesionActiva(sesionId: string): void {
    this.sesionActivaId.set(sesionId);
    this.obtenerQrParaSesion(sesionId);
  }

  obtenerQrParaSesion(sesionId: string): void {
    this.detenerTimerQr();
    this.sessionService.getQrToken(sesionId).subscribe({
      next: (res) => {
        if (res.exitoso && res.datos) {
          this.datosQr.set(res.datos);
          this.segundosRestantes.set(res.datos.expiraEnSegundos || 60);
          this.iniciarTimerQr();
        }
      },
      error: () => {
        this.toast.error('No fue posible generar el código de acceso temporal.');
      },
    });
  }

  refrescarQrManual(): void {
    const id = this.sesionActivaId();
    if (id) {
      this.obtenerQrParaSesion(id);
      this.toast.info('Código PIN y QR actualizados.');
    }
  }

  iniciarTimerQr(): void {
    this.detenerTimerQr();
    this.timerInterval = setInterval(() => {
      const actual = this.segundosRestantes();
      if (actual <= 1) {
        this.detenerTimerQr();
        // Auto-refrescar cuando llegue a 0
        const id = this.sesionActivaId();
        if (id && this.modalProyeccionVisible()) {
          this.obtenerQrParaSesion(id);
        }
      } else {
        this.segundosRestantes.set(actual - 1);
      }
    }, 1000);
  }

  detenerTimerQr(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  cerrarModalProyeccion(): void {
    this.detenerTimerQr();
    this.modalProyeccionVisible.set(false);
    this.datosQr.set(null);
  }

  // --- NAVEGACIÓN SESIONES ---
  verSesionesGrupo(course: Course): void {
    this.verHubGrupo(course);
  }

  cargarSesiones(courseId: string): void {
    this.loadingSessions.set(true);
    this.sessionService.getSessionsByGroup(courseId).subscribe({
      next: (res) => {
        this.sessions.set(res.datos || []);
        this.loadingSessions.set(false);
      },
      error: () => {
        this.loadingSessions.set(false);
        this.toast.error('Error al cargar sesiones del grupo.');
      },
    });
  }

  abrirCrearSesionExtraordinaria(): void {
    const course = this.selectedCourse();
    this.modoFormSesion = 'CREAR';
    this.selectedSessionId = null;
    this.sesionForm = {
      tipo: 'EXTRAORDINARIA',
      title: 'Sesión Extraordinaria de Refuerzo',
      topic: 'Nivelación y resolución de dudas temáticas',
      date: new Date().toISOString().split('T')[0],
      startTime: '14:00',
      endTime: '16:00',
      room: course?.room || 'Aula A-204',
    };
    this.vistaActual.set('FORM_SESION');
  }

  abrirEditarSesion(sesion: ClassSession): void {
    this.modoFormSesion = 'EDITAR';
    this.selectedSessionId = sesion.id;
    this.sesionForm = {
      tipo: sesion.tipo || 'REGULAR',
      title: sesion.title,
      topic: sesion.topic,
      date: sesion.date,
      startTime: sesion.startTime,
      endTime: sesion.endTime,
      room: sesion.room || this.selectedCourse()?.room || 'Aula A-204',
    };
    this.vistaActual.set('FORM_SESION');
  }

  volverASesiones(): void {
    this.vistaActual.set('DETALLE_SESIONES');
  }

  guardarSesion(): void {
    const course = this.selectedCourse();
    if (!course) return;

    if (!this.sesionForm.title.trim()) {
      this.toast.warning('El campo Título de la Sesión es obligatorio.');
      return;
    }
    if (!this.sesionForm.date) {
      this.toast.warning('El campo Fecha de la Sesión es obligatorio.');
      return;
    }
    if (!this.sesionForm.startTime || !this.sesionForm.endTime) {
      this.toast.warning('Los campos Hora Inicio y Hora Fin de la sesión son obligatorios.');
      return;
    }
    if (this.sesionForm.startTime >= this.sesionForm.endTime) {
      this.toast.warning('El campo Hora Fin de la sesión debe ser posterior a la Hora Inicio.');
      return;
    }
    if (!this.sesionForm.room.trim()) {
      this.toast.warning('El campo Aula Asignada es obligatorio.');
      return;
    }

    if (this.modoFormSesion === 'CREAR') {
      this.sessionService
        .createSession(course.id, {
          title: this.sesionForm.title.trim(),
          topic: this.sesionForm.topic.trim(),
          date: this.sesionForm.date,
          startTime: this.sesionForm.startTime,
          endTime: this.sesionForm.endTime,
          room: this.sesionForm.room.trim(),
          tipo: this.sesionForm.tipo,
        })
        .subscribe({
          next: (res) => {
            if (res.exitoso) {
              this.toast.success(res.mensajeUsuario || 'Sesión programada con éxito.');
              this.cargarSesiones(course.id);
              this.volverASesiones();
            }
          },
          error: (err) => this.toast.error(getApiErrorMessage(err)),
        });
    } else if (this.selectedSessionId) {
      this.sessionService
        .updateSession(course.id, this.selectedSessionId, {
          title: this.sesionForm.title.trim(),
          topic: this.sesionForm.topic.trim(),
          date: this.sesionForm.date,
          startTime: this.sesionForm.startTime,
          endTime: this.sesionForm.endTime,
          room: this.sesionForm.room.trim(),
          tipo: this.sesionForm.tipo,
        })
        .subscribe({
          next: (res) => {
            if (res.exitoso) {
              this.toast.success(res.mensajeUsuario || 'Sesión actualizada.');
              this.cargarSesiones(course.id);
              this.volverASesiones();
            }
          },
          error: (err) => this.toast.error(getApiErrorMessage(err)),
        });
    }
  }

  getTipoSesionVariant(tipo?: string): BadgeVariant {
    switch (tipo) {
      case 'EXTRAORDINARIA':
        return 'warning';
      case 'REPOSICION':
        return 'danger';
      default:
        return 'success';
    }
  }

  irATomaAsistencia(): void {
    this.router.navigate(['/app/asistencia']);
  }

  tomarAsistenciaGrupo(course: Course): void {
    this.router.navigate(['/app/asistencia']);
  }

  abrirModalCancelarSesion(sesion: ClassSession): void {
    this.sesionACancelar.set(sesion);
    this.motivoCancelacion = '';
    this.modalCancelarVisible.set(true);
  }

  cerrarModalCancelar(): void {
    this.modalCancelarVisible.set(false);
    this.sesionACancelar.set(null);
    this.motivoCancelacion = '';
  }

  confirmarCancelarSesion(): void {
    const sesion = this.sesionACancelar();
    const course = this.selectedCourse();
    if (!sesion || !this.motivoCancelacion.trim()) return;

    this.sessionService.cancelarSesion(sesion.id, this.motivoCancelacion.trim()).subscribe({
      next: (res) => {
        if (res.exitoso) {
          this.toast.success(res.mensajeUsuario || 'Sesión cancelada formalmente.');
          this.cerrarModalCancelar();
          if (course) {
            this.cargarSesiones(course.id);
          }
        } else {
          this.toast.error(res.mensajeUsuario || 'No fue posible cancelar la sesión.');
        }
      },
      error: (err) => this.toast.error(getApiErrorMessage(err)),
    });
  }
}
