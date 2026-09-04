import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
            <app-button variant="primary" size="sm" (clicked)="abrirSolicitudMatricula()">
              <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Solicitar Inscripción (HU026)
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
                    <app-button variant="secondary" size="sm" (clicked)="verDetalleCompleto(materia)">
                      <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Ver Detalle Completo
                    </app-button>
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
                          title="Retirar solicitud de revisión pendiente (HU039)"
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
            <!-- Categoría de Inasistencia (HU011, HU015) -->
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

            <!-- Carga de Archivo Adjunto / Soporte Documental (HU011) -->
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

      <!-- 4. VISTA COMPLETA: SOLICITAR INSCRIPCIÓN / MATRÍCULA EN GRUPO (HU026) -->
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
            Trámite de Matrícula (HU026)
          </span>
        </div>

        <div class="bg-white p-6 sm:p-8 rounded-2xl border border-warm-200 shadow-warm-sm max-w-2xl mx-auto space-y-6">
          <div>
            <h2 class="font-serif font-bold text-2xl text-warm-900">
              Solicitud de Inscripción a Asignatura
            </h2>
            <p class="text-sm text-warm-600 mt-1">
              Selecciona el grupo ofertado en el que deseas solicitar cupo y escribe el motivo correspondiente para evaluación de Coordinación (HU026).
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
    </div>
  `,
})
export class StudentCoursesComponent implements OnInit {
  private studentService = inject(StudentManagementService);
  private claimService = inject(AttendanceClaimService);
  private authService = inject(AuthService);
  private coordinatorService = inject(CoordinatorManagementService);
  private courseService = inject(CourseService);
  private toast = inject(ToastService);

  vistaActual = signal<VistaEstudiante>('LISTA');
  materias = signal<MateriaEstudianteItem[]>([]);
  isLoading = signal<boolean>(true);

  // Solicitud de Matrícula (HU026)
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

  totalCreditos = () => this.materias().reduce((sum, m) => sum + m.creditos, 0);

  promedioAsistencia = () => {
    if (this.materias().length === 0) return '0.0';
    const total = this.materias().reduce((sum, m) => sum + m.porcentajeAsistencia, 0);
    return (total / this.materias().length).toFixed(1);
  };

  totalFallas = () => this.materias().reduce((sum, m) => sum + m.inasistencias, 0);

  ngOnInit(): void {
    this.cargarMaterias();
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
        error: () => this.toast.error('Error al enviar solicitud de matrícula.'),
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
      this.archivoAdjunto.set({
        nombre: file.name,
        tipo: file.type || 'application/pdf',
        tamanioKb: Math.max(1, Math.round(file.size / 1024)),
        fechaSubida: new Date().toISOString().split('T')[0],
      });
      this.toast.success(`Archivo "${file.name}" cargado correctamente.`);
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
      error: () => this.toast.error('Error al retirar la solicitud de revisión.'),
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
        error: () => this.toast.error('Error al enviar reclamo.'),
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
}
