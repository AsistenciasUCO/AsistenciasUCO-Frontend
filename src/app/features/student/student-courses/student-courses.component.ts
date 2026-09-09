import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { StudentManagementService } from '../../../core/services/student-management.service';
import { AttendanceClaimService } from '../../../core/services/attendance-claim.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  MateriaEstudianteItem,
  SesionMateriaDetalle,
  EstadoAsistenciaSesion,
  CategoriaJustificacion,
  SoporteAdjuntoItem,
} from '../../../core/models/role-management.model';
import { CardComponent } from '../../../shared/components/card/card.component';
import { BadgeComponent, BadgeVariant } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { ToastService } from '../../../shared/components/toast/toast.component';
import { CoordinatorManagementService } from '../../../core/services/coordinator-management.service';
import { CourseService } from '../../../core/services/course.service';
import { Course } from '../../../core/models/course.model';
import { SessionService } from '../../../core/services/session.service';
import { getApiErrorMessage } from '../../../core/api/errors/api-error.util';

type VistaEstudiante = 'LISTA' | 'DETALLE' | 'RECLAMO' | 'SOLICITAR_MATRICULA';

@Component({
  selector: 'app-student-courses',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    BadgeComponent,
    ButtonComponent,
    FormFieldComponent,
  ],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- 1. VISTA: LISTA PRINCIPAL DE MATERIAS -->
      @if (vistaActual() === 'LISTA') {
        <!-- Header Bento -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-warm-200/80 shadow-warm-sm">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-50 text-primary-800 border border-primary-200">
                Portal Estudiantil
              </span>
              <span class="text-xs text-warm-400">•</span>
              <span class="text-xs font-medium text-warm-500">Plan de Estudios</span>
            </div>
            <h1 class="font-serif font-bold text-2xl sm:text-3xl text-warm-900 tracking-tight">
              Gestión de Mis Materias
            </h1>
            <p class="text-sm text-warm-600 mt-1">
              Selecciona una asignatura para abrir su vista completa de sesiones, revisar tu registro de asistencia y radicar justificaciones.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              (click)="abrirModalMatriculaGrupo()"
              class="px-3.5 py-2 text-xs font-bold text-white bg-primary-700 hover:bg-primary-800 rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5"
              title="Matricularse a un grupo académico ingresando el código PIN o enlace provisto por el docente"
            >
              <svg class="w-4 h-4 text-primary-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Matricularse con Código
            </button>

            <button
              type="button"
              (click)="abrirModalAutoAsistencia()"
              class="px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5"
              title="HU176: Auto-registrar asistencia con código PIN de 6 dígitos o QR"
            >
              <svg class="w-4 h-4 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              Auto-Registro Asistencia
            </button>

            <app-button variant="primary" size="sm" (clicked)="abrirSolicitudMatricula()">
              <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Solicitar Inscripción
            </app-button>
            <span class="px-3 py-1.5 rounded-xl bg-warm-100 text-xs font-bold text-warm-800 border border-warm-200">
              {{ totalCreditos() }} Créditos
            </span>
          </div>
        </div>

        <!-- Métricas Generales -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="p-4 rounded-2xl bg-white border border-warm-200 shadow-warm-sm flex items-center gap-4">
            <div class="w-11 h-11 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center shrink-0">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <span class="text-xs text-warm-500 font-medium">Materias Inscritas</span>
              <p class="text-2xl font-serif font-bold text-warm-900">{{ materias().length }}</p>
            </div>
          </div>

          <div class="p-4 rounded-2xl bg-white border border-warm-200 shadow-warm-sm flex items-center gap-4">
            <div class="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <span class="text-xs text-warm-500 font-medium">Promedio de Asistencia</span>
              <p class="text-2xl font-serif font-bold text-emerald-700">{{ promedioAsistencia() }}%</p>
            </div>
          </div>

          <div class="p-4 rounded-2xl bg-white border border-warm-200 shadow-warm-sm flex items-center gap-4">
            <div class="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <span class="text-xs text-warm-500 font-medium">Fallas Registradas</span>
              <p class="text-2xl font-serif font-bold text-warm-900">{{ totalFallas() }}</p>
            </div>
          </div>
        </div>

        <!-- Grid de Materias -->
        @if (isLoading()) {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            @for (n of [1, 2, 3, 4]; track n) {
              <div class="h-52 bg-warm-100 rounded-2xl animate-pulse"></div>
            }
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            @for (materia of materias(); track materia.id) {
              <app-card [hoverable]="true" padding="md">
                <div class="flex flex-col h-full justify-between gap-4">
                  <div>
                    <div class="flex items-start justify-between gap-3 mb-2">
                      <div class="flex items-center gap-2">
                        <span class="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-warm-100 text-warm-800">
                          {{ materia.codigo }}
                        </span>
                        <span class="text-xs text-warm-500 font-medium">Grupo {{ materia.grupo }}</span>
                      </div>

                      <app-badge [variant]="getBadgeVariant(materia.estado)">
                        {{ materia.estado }}
                      </app-badge>
                    </div>

                    <h3 class="font-serif font-bold text-lg text-warm-900 leading-snug">
                      {{ materia.nombre }}
                    </h3>
                    <p class="text-xs text-warm-500 mt-1">Docente: {{ materia.docente }}</p>
                  </div>

                  <!-- Barra de Progreso de Asistencia -->
                  <div class="space-y-1.5 p-3 rounded-xl bg-warm-50 border border-warm-100">
                    <div class="flex items-center justify-between text-xs">
                      <span class="font-medium text-warm-600">Asistencia Registrada</span>
                      <span class="font-bold text-warm-900">{{ materia.porcentajeAsistencia }}%</span>
                    </div>
                    <div class="w-full h-2 bg-warm-200 rounded-full overflow-hidden">
                      <div
                        [class]="getProgressColor(materia.porcentajeAsistencia)"
                        [style.width.%]="materia.porcentajeAsistencia"
                        class="h-full rounded-full transition-all duration-500"
                      ></div>
                    </div>
                    <div class="flex items-center justify-between text-[11px] text-warm-500 pt-0.5">
                      <span>{{ materia.asistencias }} asistencias</span>
                      <span>{{ materia.inasistencias }} fallas de {{ materia.totalClases }} clases</span>
                    </div>
                  </div>

                  <div class="flex items-center justify-between pt-2 border-t border-warm-100">
                    <span class="text-xs text-warm-500">{{ materia.aula }}</span>
                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        (click)="abrirPrerrequisitos(materia)"
                        class="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-warm-700 hover:text-warm-900 bg-warm-100 hover:bg-warm-200 border border-warm-200 transition-colors inline-flex items-center gap-1"
                        title="Ver qué materias se necesitan cursar antes de otra"
                      >
                        <svg class="w-3.5 h-3.5 text-warm-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Prerrequisitos
                      </button>
                      <app-button variant="secondary" size="sm" (clicked)="verDetalleCompleto(materia)">
                        <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Ver Detalle
                      </app-button>
                    </div>
                  </div>
                </div>
              </app-card>
            }
          </div>
        }
      }

      <!-- 2. VISTA COMPLETA: DETALLE DE ASIGNATURA Y SESIONES -->
      @if (vistaActual() === 'DETALLE' && selectedMateria()) {
        <!-- Barra Superior de Navegación "Atrás" -->
        <div class="flex items-center justify-between bg-white p-4 rounded-2xl border border-warm-200 shadow-warm-sm">
          <button
            type="button"
            (click)="volverALista()"
            class="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-warm-700 hover:text-warm-950 bg-warm-50 hover:bg-warm-100 border border-warm-200 px-3.5 py-2 rounded-xl transition-all shadow-xs"
          >
            <svg class="w-4 h-4 text-warm-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a Mis Materias
          </button>

          <span class="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-warm-100 text-warm-800">
            {{ selectedMateria()?.codigo }} • Grupo {{ selectedMateria()?.grupo }}
          </span>
        </div>

        <!-- Ficha Resumen de la Asignatura -->
        <div class="bg-white p-6 rounded-2xl border border-warm-200 shadow-warm-sm grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="md:col-span-3 space-y-2">
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold px-2 py-0.5 rounded bg-primary-50 text-primary-800 border border-primary-200">
                {{ selectedMateria()?.creditos }} Créditos
              </span>
              <app-badge [variant]="getBadgeVariant(selectedMateria()!.estado)">
                {{ selectedMateria()?.estado }}
              </app-badge>
            </div>
            <h2 class="font-serif font-bold text-2xl text-warm-900">
              {{ selectedMateria()?.nombre }}
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-warm-600 pt-2 border-t border-warm-100">
              <div>
                <span class="text-warm-400 block text-[11px]">Docente Titular</span>
                <strong class="text-warm-800">{{ selectedMateria()?.docente }}</strong>
              </div>
              <div>
                <span class="text-warm-400 block text-[11px]">Horario Asignado</span>
                <strong class="text-warm-800">{{ selectedMateria()?.horario }}</strong>
              </div>
              <div>
                <span class="text-warm-400 block text-[11px]">Aula de Clase</span>
                <strong class="text-warm-800">{{ selectedMateria()?.aula }}</strong>
              </div>
            </div>
          </div>

          <!-- Métricas de Asistencia -->
          <div class="p-4 rounded-xl bg-warm-50 border border-warm-100 flex flex-col justify-between text-center">
            <div>
              <span class="text-xs text-warm-500 font-medium">Asistencia Acumulada</span>
              <p class="text-3xl font-serif font-bold text-primary-800 my-1">{{ selectedMateria()?.porcentajeAsistencia }}%</p>
            </div>
            <div class="text-[11px] text-warm-500 space-y-0.5 border-t border-warm-200/80 pt-2">
              <p>{{ selectedMateria()?.asistencias }} asistencias de {{ selectedMateria()?.totalClases }} clases</p>
              <p class="text-red-700 font-semibold">{{ selectedMateria()?.inasistencias }} fallas registradas</p>
            </div>
          </div>
        </div>

        <!-- Tabla Completa de Sesiones de Clase -->
        <div class="bg-white rounded-2xl border border-warm-200 shadow-warm-sm overflow-hidden">
          <div class="p-5 border-b border-warm-100 flex items-center justify-between">
            <div>
              <h3 class="font-serif font-bold text-lg text-warm-900">Historial Detallado de Sesiones</h3>
              <p class="text-xs text-warm-500">Listado cronológico de clases, estados y novedades de asistencia.</p>
            </div>
            <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-warm-100 text-warm-700">
              {{ sesiones().length }} sesiones registradas
            </span>
          </div>

          @if (loadingSesiones()) {
            <div class="p-6 space-y-3">
              @for (n of [1, 2, 3, 4]; track n) {
                <div class="h-16 bg-warm-100 rounded-xl animate-pulse"></div>
              }
            </div>
          } @else if (sesiones().length === 0) {
            <div class="p-12 text-center text-warm-400">
              <p class="text-sm">No hay registros de sesiones para esta asignatura.</p>
            </div>
          } @else {
            <div class="divide-y divide-warm-100">
              @for (sesion of sesiones(); track sesion.id) {
                <div class="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-warm-50/50 transition-colors">
                  <div class="space-y-1.5 flex-1 min-w-0">
                    <div class="flex items-center gap-3">
                      <span class="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-warm-100 text-warm-800">
                        Sesión #{{ sesion.numeroSesion }}
                      </span>
                      <span class="text-xs font-medium text-warm-500">{{ sesion.fecha }}</span>
                      <span class="text-warm-300">•</span>
                      <span class="text-xs text-warm-600">{{ sesion.horario }}</span>
                    </div>

                    <h4 class="font-bold text-sm text-warm-900 leading-snug">
                      {{ sesion.tema }}
                    </h4>

                    @if (sesion.justificacionEstudiante) {
                      <div class="p-3 rounded-xl bg-warm-50 border border-warm-200 text-xs text-warm-700 mt-1 space-y-1">
                        <div class="flex items-center gap-2">
                          @if (sesion.categoriaReclamo) {
                            <span class="px-2 py-0.5 rounded-md bg-amber-100/80 text-amber-900 font-semibold text-[11px]">
                              {{ sesion.categoriaReclamo }}
                            </span>
                          }
                          @if (sesion.soporteAdjuntoNombre) {
                            <span class="inline-flex items-center gap-1 text-primary-700 font-medium text-[11px] bg-primary-50 px-2 py-0.5 rounded-md border border-primary-200/60">
                              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                              </svg>
                              {{ sesion.soporteAdjuntoNombre }}
                            </span>
                          }
                        </div>
                        <p class="italic text-warm-800">
                          <strong class="font-semibold text-warm-900">Justificación enviada:</strong> "{{ sesion.justificacionEstudiante }}"
                        </p>
                      </div>
                    }

                    @if (sesion.respuestaDocente) {
                      <div class="p-2.5 rounded-xl bg-primary-50 border border-primary-200 text-xs text-primary-900 mt-1">
                        <strong class="text-primary-800">Respuesta del docente:</strong> "{{ sesion.respuestaDocente }}"
                      </div>
                    }
                  </div>

                  <!-- Estado y Botón de Reclamación / Retiro -->
                  <div class="flex flex-wrap items-center gap-2 shrink-0 sm:self-center">
                    <app-badge [variant]="getAsistenciaBadgeVariant(sesion.estadoAsistencia)" size="md">
                      {{ sesion.estadoAsistencia }}
                    </app-badge>

                    @if (sesion.estadoReclamo) {
                      <span
                        [class]="getReclamoStatusClasses(sesion.estadoReclamo)"
                        class="text-xs font-bold px-2.5 py-1 rounded-lg border"
                      >
                        Reclamo {{ sesion.estadoReclamo }}
                      </span>

                      @if (sesion.estadoReclamo === 'PENDIENTE') {
                        <button
                          type="button"
                          (click)="retirarReclamo(sesion)"
                          class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                          title="Retirar solicitud de revisión pendiente"
                        >
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Retirar
                        </button>
                      }
                    } @else if (sesion.estadoAsistencia === 'AUSENTE' || sesion.estadoAsistencia === 'RETARDO') {
                      <app-button
                        variant="primary"
                        size="sm"
                        (clicked)="iniciarReclamo(sesion)"
                      >
                        <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Radicar Reclamo
                      </app-button>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- 3. VISTA COMPLETA: FORMULARIO DE RADICACIÓN DE RECLAMO -->
      @if (vistaActual() === 'RECLAMO' && sesionReclamar() && selectedMateria()) {
        <!-- Barra Superior de Retorno -->
        <div class="flex items-center justify-between bg-white p-4 rounded-2xl border border-warm-200 shadow-warm-sm">
          <button
            type="button"
            (click)="volverADetalle()"
            class="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-warm-700 hover:text-warm-950 bg-warm-50 hover:bg-warm-100 border border-warm-200 px-3.5 py-2 rounded-xl transition-all shadow-xs"
          >
            <svg class="w-4 h-4 text-warm-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a {{ selectedMateria()?.nombre }}
          </button>

          <span class="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
            Radicación de Novedad
          </span>
        </div>

        <div class="bg-white p-6 sm:p-8 rounded-2xl border border-warm-200 shadow-warm-sm max-w-3xl mx-auto space-y-6">
          <div>
            <h2 class="font-serif font-bold text-2xl text-warm-900">
              Solicitud de Revisión y Justificación de Asistencia
            </h2>
            <p class="text-sm text-warm-600 mt-1">
              Diligencia la categoría, justificación y soportes correspondientes a la inasistencia o retardo de la sesión indicada. Esta solicitud será enviada directamente al docente titular para su evaluación.
            </p>
          </div>

          <!-- Ficha de la Sesión Afectada -->
          <div class="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-mono font-bold text-amber-900">
                Sesión #{{ sesionReclamar()?.numeroSesion }} — {{ sesionReclamar()?.fecha }} ({{ sesionReclamar()?.horario }})
              </span>
              <span class="px-2 py-0.5 rounded-full font-bold bg-white text-red-700 border border-red-200">
                Estado Actual: {{ sesionReclamar()?.estadoAsistencia }}
              </span>
            </div>
            <p class="text-amber-950 font-medium">Tema: {{ sesionReclamar()?.tema }}</p>
            <p class="text-amber-800">Docente a cargo: {{ selectedMateria()?.docente }}</p>
          </div>

          <!-- Formulario de Justificación -->
          <div class="space-y-4">
            <!-- Categoría de Inasistencia -->
            <app-form-field label="Categoría de Justificación" [required]="true">
              <select
                [(ngModel)]="categoriaSeleccionada"
                class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm text-warm-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              >
                @for (cat of categoriasDisponibles; track cat) {
                  <option [value]="cat">{{ cat }}</option>
                }
              </select>
            </app-form-field>

            <app-form-field label="Explicación detallada y justificación del reclamo" [required]="true">
              <textarea
                [(ngModel)]="justificacionTexto"
                rows="5"
                placeholder="Escribe aquí con claridad los motivos de tu ausencia o retardo (ejemplo: cita médica con constancia, calamidad doméstica, representación institucional, retraso en transporte)..."
                class="w-full p-4 bg-warm-50 border border-warm-200 rounded-xl text-sm text-warm-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 leading-relaxed"
              ></textarea>
            </app-form-field>

            <!-- Carga de Archivo Adjunto / Soporte Documental -->
            <div class="space-y-2">
              <label class="block text-xs font-semibold uppercase tracking-wider text-warm-700">
                Soporte Documental Adjunto (PDF, JPG, PNG - Máx. 10MB)
              </label>

              @if (archivoAdjunto()) {
                <div class="flex items-center justify-between p-3.5 bg-warm-50 border border-warm-200 rounded-xl">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p class="text-xs font-bold text-warm-900">{{ archivoAdjunto()?.nombre }}</p>
                      <p class="text-[11px] text-warm-500">{{ archivoAdjunto()?.tamanioKb }} KB • {{ archivoAdjunto()?.tipo }}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    (click)="removerAdjunto()"
                    class="p-1.5 text-warm-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Remover adjunto"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              } @else {
                <label
                  class="border-2 border-dashed border-warm-200 hover:border-primary-400 rounded-2xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer bg-warm-50/50 hover:bg-primary-50/20 transition-all text-center"
                >
                  <input
                    type="file"
                    class="hidden"
                    accept=".pdf,.png,.jpg,.jpeg"
                    (change)="onFileSelected($event)"
                  />
                  <div class="w-10 h-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <div>
                    <span class="text-xs font-semibold text-primary-700">Haz clic para adjuntar un documento</span>
                    <p class="text-[11px] text-warm-400 mt-0.5">Certificado médico, constancia laboral o justificación institucional</p>
                  </div>
                </label>
              }
            </div>

            <div class="p-3 bg-warm-50 rounded-xl border border-warm-200 text-xs text-warm-600 flex items-start gap-2.5">
              <svg class="w-4 h-4 text-warm-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                Al enviar la solicitud, el docente evaluará los soportes radicados y, de considerarlo procedente, ajustará tu asistencia a <strong>"Asistencia Justificada"</strong>.
              </span>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 pt-4 border-t border-warm-100">
            <app-button variant="secondary" size="md" (clicked)="volverADetalle()">
              Cancelar
            </app-button>
            <app-button
              variant="primary"
              size="md"
              [disabled]="!justificacionTexto.trim()"
              (clicked)="enviarReclamo()"
            >
              <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Radicar Reclamo
            </app-button>
          </div>
        </div>
      }

      <!-- 4. VISTA COMPLETA: SOLICITAR INSCRIPCIÓN / MATRÍCULA EN GRUPO -->
      @if (vistaActual() === 'SOLICITAR_MATRICULA') {
        <div class="flex items-center justify-between bg-white p-4 rounded-2xl border border-warm-200 shadow-warm-sm">
          <button
            type="button"
            (click)="volverALista()"
            class="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-warm-700 hover:text-warm-950 bg-warm-50 hover:bg-warm-100 border border-warm-200 px-3.5 py-2 rounded-xl transition-all shadow-xs"
          >
            <svg class="w-4 h-4 text-warm-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a Mis Materias
          </button>

          <span class="text-xs font-bold text-primary-800 bg-primary-50 border border-primary-200 px-3 py-1 rounded-full">
            Trámite de Matrícula
          </span>
        </div>

        <div class="bg-white p-6 sm:p-8 rounded-2xl border border-warm-200 shadow-warm-sm max-w-2xl mx-auto space-y-6">
          <div>
            <h2 class="font-serif font-bold text-2xl text-warm-900">
              Solicitud de Inscripción a Asignatura
            </h2>
            <p class="text-sm text-warm-600 mt-1">
              Selecciona el grupo ofertado en el que deseas solicitar cupo y escribe el motivo correspondiente para evaluación de Coordinación.
            </p>
          </div>

          <div class="space-y-4">
            <app-form-field label="Asignatura y Grupo a Solicitar" [required]="true">
              <select
                [(ngModel)]="solicitudCursoId"
                class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm font-semibold text-warm-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="">Selecciona una asignatura disponible...</option>
                @for (c of cursosDisponibles(); track c.id) {
                  <option [value]="c.id">
                    {{ c.code }} — {{ c.name }} ({{ c.section }}) • {{ c.schedule }} • Aula {{ c.room }}
                  </option>
                }
              </select>
            </app-form-field>

            <app-form-field label="Motivo y justificación de la solicitud" [required]="true">
              <textarea
                [(ngModel)]="solicitudMotivo"
                rows="5"
                placeholder="Explica los motivos de tu solicitud (ejemplo: cruce de horario con otra asignatura, nivelación académica, adelanto de créditos)..."
                class="w-full p-3.5 bg-warm-50 border border-warm-200 rounded-xl text-sm text-warm-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              ></textarea>
            </app-form-field>
          </div>

          <div class="flex items-center justify-end gap-3 pt-4 border-t border-warm-100">
            <app-button variant="secondary" size="md" (clicked)="volverALista()">
              Cancelar
            </app-button>
            <app-button
              variant="primary"
              size="md"
              [disabled]="!solicitudCursoId || !solicitudMotivo.trim()"
              (clicked)="enviarSolicitudMatricula()"
            >
              <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Enviar Solicitud
            </app-button>
          </div>
        </div>
      }

      <!-- 5. MODAL DE PRERREQUISITOS DE ASIGNATURA -->
      @if (modalPrerrequisitosVisible() && materiaPrerrequisitos()) {
        <div class="fixed inset-0 bg-warm-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div class="bg-white rounded-2xl border border-warm-200 shadow-warm-xl max-w-lg w-full overflow-hidden animate-scale-up">
            <div class="p-6 border-b border-warm-100 flex items-start justify-between bg-warm-50/50">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary-100 text-primary-900 border border-primary-200">
                    {{ materiaPrerrequisitos()?.codigo }}
                  </span>
                  <span class="text-xs font-semibold text-warm-500">Malla Curricular</span>
                </div>
                <h3 class="font-serif font-bold text-xl text-warm-900">
                  Prerrequisitos de Asignatura
                </h3>
                <p class="text-xs text-warm-600 mt-0.5">
                  {{ materiaPrerrequisitos()?.nombre }}
                </p>
              </div>
              <button
                type="button"
                (click)="cerrarModalPrerrequisitos()"
                class="p-1.5 rounded-lg text-warm-400 hover:text-warm-700 hover:bg-warm-100 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <p class="text-xs text-warm-600 leading-relaxed">
                Para cursar y validar efectivamente <strong>{{ materiaPrerrequisitos()?.nombre }}</strong>, debes haber aprobado o matriculado previamente las siguientes asignaturas:
              </p>

              @if (loadingPrerrequisitos()) {
                <div class="space-y-3">
                  @for (n of [1, 2]; track n) {
                    <div class="h-16 bg-warm-100 rounded-xl animate-pulse"></div>
                  }
                </div>
              } @else if (listaPrerrequisitos().length === 0) {
                <div class="p-8 text-center bg-warm-50 rounded-xl border border-warm-200/80">
                  <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p class="text-sm font-semibold text-warm-800">Esta asignatura no tiene prerrequisitos obligatorios.</p>
                  <p class="text-xs text-warm-500 mt-1">Puedes cursarla directamente según tu nivel de plan de estudios.</p>
                </div>
              } @else {
                <div class="space-y-3">
                  @for (req of listaPrerrequisitos(); track req.id) {
                    <div class="p-3.5 rounded-xl border border-warm-200/80 flex items-center justify-between gap-3 bg-white hover:border-primary-300 transition-colors">
                      <div class="space-y-0.5">
                        <div class="flex items-center gap-2">
                          <span class="text-xs font-mono font-bold text-warm-700 bg-warm-100 px-1.5 py-0.5 rounded">
                            {{ req.prerrequisitoCodigo }}
                          </span>
                          <span class="text-xs text-warm-400">•</span>
                          <span class="text-xs text-warm-500 font-medium">{{ req.creditos }} Créditos</span>
                        </div>
                        <h4 class="font-serif font-bold text-sm text-warm-900 leading-tight">
                          {{ req.prerrequisitoNombre }}
                        </h4>
                        <span class="text-[11px] text-warm-500 block">Tipo: {{ req.tipo }}</span>
                      </div>

                      <span
                        [class]="req.estadoAcademico === 'APROBADA' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'"
                        class="px-2.5 py-1 rounded-full text-xs font-bold border shrink-0 inline-flex items-center gap-1"
                      >
                        @if (req.estadoAcademico === 'APROBADA') {
                          <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Aprobada
                        } @else {
                          <svg class="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Requisito Pendiente
                        }
                      </span>
                    </div>
                  }
                </div>
              }
            </div>

            <div class="p-4 border-t border-warm-100 bg-warm-50/50 flex justify-end">
              <app-button variant="secondary" size="sm" (clicked)="cerrarModalPrerrequisitos()">
                Cerrar
              </app-button>
            </div>
          </div>
        </div>
      }
      <!-- 6. MODAL: AUTO-REGISTRO DE ASISTENCIA (HU176 - PIN / QR) -->
      @if (modalAutoAsistenciaVisible()) {
        <div class="fixed inset-0 bg-warm-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div class="bg-white rounded-3xl border border-warm-200 shadow-warm-2xl max-w-md w-full overflow-hidden animate-scale-up">
            <!-- Header Modal -->
            <div class="p-6 border-b border-warm-100 flex items-center justify-between bg-emerald-900 text-white">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-serif font-bold text-lg leading-tight">
                    Auto-Registro de Asistencia
                  </h3>
                  <p class="text-xs text-emerald-200">
                    Ingresa el PIN proyectado por tu docente en clase
                  </p>
                </div>
              </div>

              <button
                type="button"
                (click)="cerrarModalAutoAsistencia()"
                class="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Cuerpo del Formulario de Registro -->
            <div class="p-6 sm:p-7 space-y-5">
              <div class="text-center space-y-1">
                <p class="text-xs font-semibold text-warm-500 uppercase tracking-wider">
                  Código de Acceso de 6 Dígitos
                </p>
                <p class="text-xs text-warm-600">
                  Digita el PIN numérico o alfanumérico visible en el proyector de la clase.
                </p>
              </div>

              <!-- Input PIN Grande -->
              <div class="flex justify-center">
                <input
                  type="text"
                  maxlength="6"
                  [(ngModel)]="pinRegistro"
                  placeholder="000000"
                  class="w-56 text-center font-mono font-extrabold text-3xl tracking-widest py-3 px-4 bg-warm-50 border-2 border-warm-300 rounded-2xl text-warm-900 focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/20 uppercase"
                />
              </div>

              <!-- Opcional: Pegar Token QR Completo -->
              <div class="pt-2 border-t border-warm-100">
                <details class="text-xs text-warm-600">
                  <summary class="cursor-pointer font-semibold text-warm-700 hover:text-warm-950 select-none">
                    ¿Tienes un enlace o token QR completo?
                  </summary>
                  <div class="mt-2.5 space-y-1">
                    <input
                      type="text"
                      [(ngModel)]="tokenQrCompleto"
                      placeholder="UCO-QR-..."
                      class="w-full px-3 py-2 bg-warm-50 border border-warm-200 rounded-xl text-xs font-mono text-warm-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </details>
              </div>

              <!-- Indicación de Regla de Negocio -->
              <div class="p-3.5 rounded-xl bg-warm-50 border border-warm-200 text-xs text-warm-600 space-y-1">
                <p class="font-semibold text-warm-800 flex items-center gap-1.5">
                  <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Validación Automática de Matrícula
                </p>
                <p class="text-[11px] leading-relaxed">
                  El sistema verificará que te encuentres matriculado en el grupo de la sesión activa y registrará tu estado como <strong>PRESENTE</strong> de manera inmediata.
                </p>
              </div>
            </div>

            <!-- Footer con Botón de Enviar -->
            <div class="p-4 border-t border-warm-100 bg-warm-50/60 flex items-center justify-end gap-3">
              <app-button variant="secondary" size="sm" (clicked)="cerrarModalAutoAsistencia()">
                Cancelar
              </app-button>
              <button
                type="button"
                [disabled]="(!pinRegistro.trim() && !tokenQrCompleto.trim()) || procesandoAutoAsistencia()"
                (click)="enviarAutoAsistencia()"
                class="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-sm inline-flex items-center gap-2"
              >
                @if (procesandoAutoAsistencia()) {
                  <span class="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                  Validando...
                } @else {
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Registrar mi Asistencia
                }
              </button>
            </div>
          </div>
        </div>
      }

      <!-- 7. MODAL: MATRÍCULA A GRUPO POR CÓDIGO O PIN -->
      @if (modalMatriculaGrupoVisible()) {
        <div class="fixed inset-0 bg-warm-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div class="bg-white rounded-3xl border border-warm-200 shadow-warm-2xl max-w-md w-full overflow-hidden animate-scale-up">
            <!-- Header Modal Matrícula -->
            <div class="p-6 border-b border-warm-100 flex items-center justify-between bg-primary-900 text-white">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-primary-700 text-white flex items-center justify-center font-bold">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div>
                  <h3 class="font-serif font-bold text-lg leading-tight">
                    Matricúlate a un Grupo
                  </h3>
                  <p class="text-xs text-primary-200">
                    Ingresa el PIN o código proporcionado por tu docente
                  </p>
                </div>
              </div>

              <button
                type="button"
                (click)="cerrarModalMatriculaGrupo()"
                class="p-2 rounded-xl text-primary-200 hover:text-white hover:bg-primary-800 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Cuerpo del Formulario de Matrícula -->
            <div class="p-6 sm:p-7 space-y-5">
              <div class="text-center space-y-1">
                <p class="text-xs font-semibold text-warm-500 uppercase tracking-wider">
                  Código de Matrícula o PIN de Grupo
                </p>
                <p class="text-xs text-warm-600">
                  Digita el código institucional del grupo o el identificador que aparece en el proyector de tu clase.
                </p>
              </div>

              <!-- Input Código Matrícula Grande -->
              <div class="flex justify-center">
                <input
                  type="text"
                  [(ngModel)]="codigoMatricula"
                  placeholder="Ej: SIS-301 o código de grupo"
                  class="w-full text-center font-mono font-bold text-xl tracking-wider py-3 px-4 bg-warm-50 border-2 border-warm-300 rounded-2xl text-warm-900 focus:outline-none focus:border-primary-600 focus:ring-4 focus:ring-primary-500/20"
                />
              </div>

              <!-- Indicación de Regla de Negocio -->
              <div class="p-3.5 rounded-xl bg-primary-50/50 border border-primary-100 text-xs text-warm-600 space-y-1">
                <p class="font-semibold text-primary-900 flex items-center gap-1.5">
                  <svg class="w-4 h-4 text-primary-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Inscripción Inmediata
                </p>
                <p class="text-[11px] leading-relaxed">
                  Al confirmar la matrícula, la asignatura aparecerá en tu lista de materias activas y quedarás habilitado para registrar tu asistencia en todas las sesiones.
                </p>
              </div>
            </div>

            <!-- Footer con Botón de Enviar -->
            <div class="p-4 border-t border-warm-100 bg-warm-50/60 flex items-center justify-end gap-3">
              <app-button variant="secondary" size="sm" (clicked)="cerrarModalMatriculaGrupo()">
                Cancelar
              </app-button>
              <button
                type="button"
                [disabled]="!codigoMatricula.trim() || procesandoMatriculaGrupo()"
                (click)="enviarMatriculaPorCodigo()"
                class="px-5 py-2 text-xs font-bold text-white bg-primary-700 hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-sm inline-flex items-center gap-2"
              >
                @if (procesandoMatriculaGrupo()) {
                  <span class="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                  Inscribiendo...
                } @else {
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Confirmar Matrícula
                }
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class StudentCoursesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private studentService = inject(StudentManagementService);
  private claimService = inject(AttendanceClaimService);
  private authService = inject(AuthService);
  private coordinatorService = inject(CoordinatorManagementService);
  private courseService = inject(CourseService);
  private sessionService = inject(SessionService);
  private toast = inject(ToastService);

  vistaActual = signal<VistaEstudiante>('LISTA');
  materias = signal<MateriaEstudianteItem[]>([]);
  isLoading = signal<boolean>(true);

  // Auto-Registro de Asistencia (HU176)
  modalAutoAsistenciaVisible = signal<boolean>(false);
  pinRegistro = '';
  tokenQrCompleto = '';
  procesandoAutoAsistencia = signal<boolean>(false);

  // Matrícula por Código o PIN de Grupo
  modalMatriculaGrupoVisible = signal<boolean>(false);
  codigoMatricula = '';
  procesandoMatriculaGrupo = signal<boolean>(false);

  // Solicitud de Matrícula
  cursosDisponibles = signal<Course[]>([]);
  solicitudCursoId = '';
  solicitudMotivo = '';

  // Drill-down sesiones
  selectedMateria = signal<MateriaEstudianteItem | null>(null);
  sesiones = signal<SesionMateriaDetalle[]>([]);
  loadingSesiones = signal<boolean>(false);

  // Radicación reclamo
  sesionReclamar = signal<SesionMateriaDetalle | null>(null);
  justificacionTexto = '';
  categoriasDisponibles: CategoriaJustificacion[] = [
    'Médico / Salud',
    'Calamidad Doméstica',
    'Académico / Representación',
    'Fuerza Mayor',
    'Laboral',
    'Otro',
  ];
  categoriaSeleccionada: CategoriaJustificacion = 'Médico / Salud';
  archivoAdjunto = signal<SoporteAdjuntoItem | null>(null);

  // Prerrequisitos de Materia
  modalPrerrequisitosVisible = signal<boolean>(false);
  materiaPrerrequisitos = signal<MateriaEstudianteItem | null>(null);
  listaPrerrequisitos = signal<any[]>([]);
  loadingPrerrequisitos = signal<boolean>(false);

  totalCreditos = () => this.materias().reduce((sum, m) => sum + m.creditos, 0);

  promedioAsistencia = () => {
    if (this.materias().length === 0) return '0.0';
    const total = this.materias().reduce((sum, m) => sum + m.porcentajeAsistencia, 0);
    return (total / this.materias().length).toFixed(1);
  };

  totalFallas = () => this.materias().reduce((sum, m) => sum + m.inasistencias, 0);

  ngOnInit(): void {
    this.cargarMaterias();

    const paramMatricula = this.route.snapshot.queryParamMap.get('matricularGrupo');
    if (paramMatricula) {
      this.abrirModalMatriculaGrupo(paramMatricula);
    }
  }

  cargarMaterias(): void {
    this.isLoading.set(true);
    this.studentService.getMaterias().subscribe({
      next: (res) => {
        this.materias.set(res.datos || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toast.error('Error al cargar asignaturas matriculadas.');
      },
    });
  }

  verDetalleCompleto(materia: MateriaEstudianteItem): void {
    this.selectedMateria.set(materia);
    this.vistaActual.set('DETALLE');
    this.cargarSesiones(materia.id);
  }

  volverALista(): void {
    this.vistaActual.set('LISTA');
    this.selectedMateria.set(null);
  }

  abrirSolicitudMatricula(): void {
    this.solicitudCursoId = '';
    this.solicitudMotivo = '';
    this.courseService.getTeacherCourses().subscribe({
      next: (res) => {
        this.cursosDisponibles.set(res.datos || []);
        this.vistaActual.set('SOLICITAR_MATRICULA');
      },
      error: () => {
        this.toast.error('Error al cargar la oferta de asignaturas.');
      },
    });
  }

  enviarSolicitudMatricula(): void {
    const curso = this.cursosDisponibles().find((c) => c.id === this.solicitudCursoId);
    const currentUser = this.authService.currentUser();
    if (!curso || !this.solicitudMotivo.trim()) return;

    this.coordinatorService
      .crearSolicitudMatricula({
        estudianteId: currentUser?.id || 'EST-101',
        estudianteNombre: currentUser?.name || 'Estudiante UCO',
        estudianteCodigo: '202210101',
        estudianteCorreo: currentUser?.email || 'estudiante@uco.edu.co',
        cursoId: curso.id,
        cursoCodigo: curso.code,
        cursoNombre: curso.name,
        grupo: curso.section,
        motivo: this.solicitudMotivo.trim(),
      })
      .subscribe({
        next: (res) => {
          if (res.exitoso) {
            this.toast.success(res.mensajeUsuario || 'Solicitud radicada ante Coordinación.');
            this.volverALista();
          }
        },
        error: (err) => this.toast.error(getApiErrorMessage(err)),
      });
  }

  iniciarReclamo(sesion: SesionMateriaDetalle): void {
    this.sesionReclamar.set(sesion);
    this.justificacionTexto = '';
    this.categoriaSeleccionada = 'Médico / Salud';
    this.archivoAdjunto.set(null);
    this.vistaActual.set('RECLAMO');
  }

  volverADetalle(): void {
    this.vistaActual.set('DETALLE');
    this.sesionReclamar.set(null);
    this.archivoAdjunto.set(null);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.claimService.subirSoporte(file).subscribe({
        next: (res) => {
          if (res.exitoso && res.datos) {
            this.archivoAdjunto.set({
              nombre: res.datos.nombre,
              tipo: file.type || 'application/pdf',
              tamanioKb: Math.max(1, Math.round(file.size / 1024)),
              fechaSubida: new Date().toISOString().split('T')[0],
              urlSimulada: res.datos.url,
            });
            this.toast.success(`Archivo "${file.name}" cargado y almacenado correctamente.`);
          } else {
            this.toast.error('No fue posible almacenar el archivo adjunto.');
          }
        },
        error: () => {
          this.toast.error('Error al subir el archivo adjunto al servidor.');
        },
      });
    }
  }

  removerAdjunto(): void {
    this.archivoAdjunto.set(null);
  }

  retirarReclamo(sesion: SesionMateriaDetalle): void {
    if (!sesion.reclamoId) return;
    const materia = this.selectedMateria();
    if (!materia) return;

    this.claimService.eliminarReclamo(sesion.reclamoId, materia.id, sesion.id).subscribe({
      next: (res) => {
        if (res.exitoso) {
          this.toast.success(res.mensajeUsuario || 'Solicitud de revisión retirada.');
          this.cargarSesiones(materia.id);
        }
      },
      error: (err) => this.toast.error(getApiErrorMessage(err)),
    });
  }

  cargarSesiones(materiaId: string): void {
    this.loadingSesiones.set(true);
    this.claimService.getSesionesPorMateria(materiaId).subscribe({
      next: (res) => {
        this.sesiones.set(res.datos || []);
        this.loadingSesiones.set(false);
      },
      error: () => {
        this.loadingSesiones.set(false);
        this.toast.error('Error al cargar sesiones de la materia.');
      },
    });
  }

  enviarReclamo(): void {
    const sesion = this.sesionReclamar();
    const materia = this.selectedMateria();
    const currentUser = this.authService.currentUser();

    if (!sesion || !materia || !this.justificacionTexto.trim()) return;

    this.claimService
      .crearReclamo({
        estudianteId: currentUser?.id || 'estudiante-current',
        estudianteNombre: currentUser?.name || 'Estudiante UCO',
        estudianteCorreo: currentUser?.email || 'estudiante@uco.edu.co',
        materiaId: materia.id,
        materiaCodigo: materia.codigo,
        materiaNombre: materia.nombre,
        grupo: materia.grupo,
        sesionId: sesion.id,
        sesionNumero: sesion.numeroSesion,
        fechaSesion: sesion.fecha,
        estadoOriginal: sesion.estadoAsistencia,
        categoria: this.categoriaSeleccionada,
        soporteAdjunto: this.archivoAdjunto() || undefined,
        justificacionSolicitud: this.justificacionTexto.trim(),
      })
      .subscribe({
        next: (res) => {
          if (res.exitoso) {
            this.toast.success(res.mensajeUsuario || 'Reclamo enviado.');
            this.volverADetalle();
            this.cargarSesiones(materia.id);
          }
        },
        error: (err) => this.toast.error(getApiErrorMessage(err)),
      });
  }

  getBadgeVariant(estado: MateriaEstudianteItem['estado']): BadgeVariant {
    switch (estado) {
      case 'Al día':
        return 'success';
      case 'Riesgo':
        return 'warning';
      case 'Crítico':
        return 'danger';
      default:
        return 'neutral';
    }
  }

  getAsistenciaBadgeVariant(estado: EstadoAsistenciaSesion): BadgeVariant {
    switch (estado) {
      case 'PRESENTE':
        return 'success';
      case 'RETARDO':
        return 'warning';
      case 'AUSENTE':
        return 'danger';
      case 'JUSTIFICADA':
        return 'info';
      default:
        return 'neutral';
    }
  }

  getReclamoStatusClasses(estado: string): string {
    switch (estado) {
      case 'APROBADA':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'RECHAZADA':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  }

  getProgressColor(porcentaje: number): string {
    if (porcentaje >= 85) return 'bg-emerald-500';
    if (porcentaje >= 75) return 'bg-amber-500';
    return 'bg-red-500';
  }

  abrirPrerrequisitos(materia: MateriaEstudianteItem): void {
    this.materiaPrerrequisitos.set(materia);
    this.modalPrerrequisitosVisible.set(true);
    this.loadingPrerrequisitos.set(true);

    this.studentService.getPrerrequisitosMateria(materia.id).subscribe({
      next: (res) => {
        this.listaPrerrequisitos.set(res.datos || []);
        this.loadingPrerrequisitos.set(false);
      },
      error: () => {
        this.listaPrerrequisitos.set([]);
        this.loadingPrerrequisitos.set(false);
      },
    });
  }

  cerrarModalPrerrequisitos(): void {
    this.modalPrerrequisitosVisible.set(false);
    this.materiaPrerrequisitos.set(null);
    this.listaPrerrequisitos.set([]);
  }

  // --- AUTO-REGISTRO DE ASISTENCIA (HU176) ---
  abrirModalAutoAsistencia(): void {
    this.pinRegistro = '';
    this.tokenQrCompleto = '';
    this.modalAutoAsistenciaVisible.set(true);
  }

  cerrarModalAutoAsistencia(): void {
    this.modalAutoAsistenciaVisible.set(false);
    this.pinRegistro = '';
    this.tokenQrCompleto = '';
  }

  enviarAutoAsistencia(): void {
    const pin = this.pinRegistro.trim().toUpperCase();
    const token = this.tokenQrCompleto.trim();

    if (!pin && !token) {
      this.toast.error('Por favor ingresa el PIN de 6 caracteres o el token QR.');
      return;
    }

    this.procesandoAutoAsistencia.set(true);
    this.sessionService
      .registrarAutoAsistencia({
        codigoAcceso: pin || undefined,
        token: token || undefined,
      })
      .subscribe({
        next: (res: any) => {
          this.procesandoAutoAsistencia.set(false);
          const yaRegistrado = res?.datos?.yaRegistrado;
          if (yaRegistrado) {
            this.toast.info(res?.datos?.mensaje || 'Ya tenías tu asistencia registrada previamente para esta sesión.');
          } else {
            this.toast.success(res?.mensajeUsuario || res?.datos?.mensaje || '¡Asistencia registrada con éxito!');
          }
          this.cerrarModalAutoAsistencia();
          // Recargamos materias y sesiones para ver reflejado el cambio de asistencia
          this.cargarMaterias();
          const actual = this.selectedMateria();
          if (actual) {
            this.cargarSesiones(actual.id);
          }
        },
        error: (err) => {
          this.procesandoAutoAsistencia.set(false);
          this.toast.error(err?.error?.message || err?.message || 'El código ingresado no es válido o ha expirado.');
        },
      });
  }

  // --- MATRÍCULA A GRUPO POR CÓDIGO O PIN ---
  abrirModalMatriculaGrupo(codigoInicial?: string): void {
    this.codigoMatricula = codigoInicial || '';
    this.modalMatriculaGrupoVisible.set(true);
  }

  cerrarModalMatriculaGrupo(): void {
    this.modalMatriculaGrupoVisible.set(false);
    this.codigoMatricula = '';
  }

  enviarMatriculaPorCodigo(): void {
    const pin = this.codigoMatricula.trim();
    if (!pin) {
      this.toast.error('Por favor ingresa el código o PIN del grupo.');
      return;
    }

    this.procesandoMatriculaGrupo.set(true);
    this.studentService.matricularGrupo(pin).subscribe({
      next: (res) => {
        this.procesandoMatriculaGrupo.set(false);
        this.toast.success(res?.mensajeUsuario || '¡Matrícula confirmada exitosamente en el grupo!');
        this.cerrarModalMatriculaGrupo();
        this.cargarMaterias();
      },
      error: (err) => {
        this.procesandoMatriculaGrupo.set(false);
        this.toast.error(getApiErrorMessage(err));
      },
    });
  }
}
