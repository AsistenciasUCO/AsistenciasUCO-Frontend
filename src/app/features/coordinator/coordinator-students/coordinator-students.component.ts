import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoordinatorManagementService } from '../../../core/services/coordinator-management.service';
import { CourseService } from '../../../core/services/course.service';
import {
  EstudianteDirectorioItem,
  SolicitudMatriculaItem,
} from '../../../core/models/role-management.model';
import { Course } from '../../../core/models/course.model';
import { CardComponent } from '../../../shared/components/card/card.component';
import { BadgeComponent, BadgeVariant } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { ToastService } from '../../../shared/components/toast/toast.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { getApiErrorMessage } from '../../../core/api/errors/api-error.util';

type PestanaModulo = 'DIRECTORIO' | 'MATRICULA_GRUPO' | 'SOLICITUDES';

@Component({
  selector: 'app-coordinator-students',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    BadgeComponent,
    ButtonComponent,
    FormFieldComponent,
    AvatarComponent,
    PaginationComponent,
  ],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- Header Bento -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-warm-200/80 shadow-warm-sm">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200">
              Coordinación de Programa
            </span>
            <span class="text-xs text-warm-400">•</span>
            <span class="text-xs font-medium text-warm-500">Gestión Académica de Estudiantes</span>
          </div>
          <h1 class="font-serif font-bold text-2xl sm:text-3xl text-warm-900 tracking-tight">
            Directorio Estudiantil y Matrícula
          </h1>
          <p class="text-sm text-warm-600 mt-1">
            Búsqueda institucional de alumnos, control de inscripciones por grupo y aprobación de solicitudes de cupo.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span class="px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200">
            {{ totalSolicitudesPendientes() }} Solicitudes Pendientes
          </span>
        </div>
      </div>

      <!-- Barra de Pestañas Principales -->
      <div class="flex border-b border-warm-200 bg-white px-4 rounded-2xl shadow-warm-sm gap-2">
        <button
          type="button"
          (click)="pestanaActiva.set('DIRECTORIO')"
          [class.border-primary-700]="pestanaActiva() === 'DIRECTORIO'"
          [class.text-primary-800]="pestanaActiva() === 'DIRECTORIO'"
          [class.border-transparent]="pestanaActiva() !== 'DIRECTORIO'"
          [class.text-warm-500]="pestanaActiva() !== 'DIRECTORIO'"
          class="py-3 px-4 font-semibold text-sm border-b-2 transition-colors inline-flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Directorio Institucional
        </button>

        <button
          type="button"
          (click)="pestanaActiva.set('MATRICULA_GRUPO')"
          [class.border-primary-700]="pestanaActiva() === 'MATRICULA_GRUPO'"
          [class.text-primary-800]="pestanaActiva() === 'MATRICULA_GRUPO'"
          [class.border-transparent]="pestanaActiva() !== 'MATRICULA_GRUPO'"
          [class.text-warm-500]="pestanaActiva() !== 'MATRICULA_GRUPO'"
          class="py-3 px-4 font-semibold text-sm border-b-2 transition-colors inline-flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          Matrícula por Grupo
        </button>

        <button
          type="button"
          (click)="pestanaActiva.set('SOLICITUDES')"
          [class.border-primary-700]="pestanaActiva() === 'SOLICITUDES'"
          [class.text-primary-800]="pestanaActiva() === 'SOLICITUDES'"
          [class.border-transparent]="pestanaActiva() !== 'SOLICITUDES'"
          [class.text-warm-500]="pestanaActiva() !== 'SOLICITUDES'"
          class="py-3 px-4 font-semibold text-sm border-b-2 transition-colors inline-flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Solicitudes de Cupo
        </button>
      </div>

      <!-- 1. PESTAÑA: DIRECTORIO INSTITUCIONAL DE ESTUDIANTES -->
      @if (pestanaActiva() === 'DIRECTORIO') {
        <!-- Filtros de Directorio -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="sm:col-span-2 relative">
            <input
              type="text"
              [(ngModel)]="searchDirectorio"
              placeholder="Buscar estudiante por documento, código universitario o nombre..."
              class="w-full pl-10 pr-4 py-2.5 bg-white border border-warm-200 rounded-xl text-sm text-warm-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 shadow-warm-sm"
            />
            <svg class="w-4 h-4 text-warm-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div>
            <select
              [(ngModel)]="filtroEstadoDirectorio"
              class="w-full px-3.5 py-2.5 bg-white border border-warm-200 rounded-xl text-sm text-warm-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 shadow-warm-sm"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="ACTIVO">Solo Activos</option>
              <option value="INACTIVO">Solo Inactivos</option>
              <option value="BLOQUEADO">Bloqueados</option>
            </select>
          </div>
        </div>

        <!-- Grid de Tarjetas de Estudiante -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          @for (est of paginatedDirectorio(); track est.id) {
            <app-card [hoverable]="true" padding="md">
              <div class="flex flex-col h-full justify-between gap-3">
                <div>
                  <div class="flex items-start justify-between gap-2 mb-2">
                    <span class="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-warm-100 text-warm-700">
                      Cód. {{ est.codigo }}
                    </span>
                    <app-badge [variant]="est.estadoMatricula === 'ACTIVO' ? 'success' : (est.estadoMatricula === 'BLOQUEADO' ? 'danger' : 'neutral')">
                      {{ est.estadoMatricula }}
                    </app-badge>
                  </div>

                  <div class="flex items-center gap-3 my-2">
                    <app-avatar [name]="est.nombreCompleto" size="lg"></app-avatar>
                    <div class="min-w-0">
                      <h3 class="font-serif font-bold text-base text-warm-900 truncate">
                        {{ est.nombreCompleto }}
                      </h3>
                      <p class="text-xs text-warm-500 truncate">{{ est.correo }}</p>
                      <p class="text-xs text-warm-400 mt-0.5">Doc. {{ est.documento }}</p>
                    </div>
                  </div>

                  <div class="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-warm-50 text-xs border border-warm-100 my-2">
                    <div>
                      <span class="text-warm-400 block text-[10px]">Semestre</span>
                      <span class="font-semibold text-warm-900">{{ est.semestreActual }}° Semestre</span>
                    </div>
                    <div>
                      <span class="text-warm-400 block text-[10px]">Programa</span>
                      <span class="font-semibold text-warm-900 truncate block">{{ est.programa }}</span>
                    </div>
                  </div>

                  <div class="space-y-1 text-xs pt-1">
                    <div class="flex items-center justify-between">
                      <span class="text-warm-500">Estado Financiero</span>
                      <span class="font-semibold text-emerald-700">Al Día</span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-warm-500">Promedio Ponderado</span>
                      <span class="font-bold text-primary-700">{{ est.promedioAcumulado || '4.0' }}</span>
                    </div>
                  </div>
                </div>

                <div class="flex items-center justify-between pt-2 border-t border-warm-100 text-xs text-warm-500">
                  <span>{{ est.gruposInscritos?.length || 0 }} asignaturas matriculadas</span>
                  <span class="text-primary-700 font-semibold">UCO Estudiante</span>
                </div>
              </div>
            </app-card>
          }
        </div>

        <!-- Paginador del Directorio -->
        <app-pagination
          [totalItems]="filteredDirectorio().length"
          [pageSize]="pageSizeDirectorio"
          [currentPage]="currentPageDirectorio"
          (pageChange)="currentPageDirectorio = $event"
          (pageSizeChange)="onPageSizeDirectorioChange($event)"
        ></app-pagination>
      }

      <!-- 2. PESTAÑA: MATRÍCULA POR GRUPO -->
      @if (pestanaActiva() === 'MATRICULA_GRUPO') {
        <!-- Selector de Grupo Académico -->
        <div class="bg-white p-5 rounded-2xl border border-warm-200 shadow-warm-sm space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex-1 min-w-0">
              <label class="block text-xs font-bold uppercase tracking-wider text-warm-500 mb-1">
                Seleccionar Asignatura y Grupo:
              </label>
              <select
                [ngModel]="selectedCourseId()"
                (ngModelChange)="onSelectCourse($event)"
                class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm font-semibold text-warm-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                @for (c of courses(); track c.id) {
                  <option [value]="c.id">
                    {{ c.code }} — {{ c.name }} ({{ c.section }}) • Aula {{ c.room }}
                  </option>
                }
              </select>
            </div>

            @if (selectedCourse(); as curso) {
              <div class="p-3 bg-warm-50 border border-warm-200 rounded-xl flex items-center gap-4 text-xs shrink-0">
                <div>
                  <span class="text-warm-500 block">Docente Titular</span>
                  <strong class="text-warm-900">{{ curso.docenteName }}</strong>
                </div>
                <div>
                  <span class="text-warm-500 block">Capacidad de Cupos</span>
                  <strong class="text-primary-800">{{ enrolledStudents().length }} / {{ curso.cupoMaximo || 35 }}</strong>
                </div>
              </div>
            }
          </div>

          <!-- Botón Matricular Estudiante en Grupo -->
          <div class="flex items-center justify-end pt-2 border-t border-warm-100">
            <app-button variant="primary" size="sm" (clicked)="abrirModalMatricular()">
              <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              + Matricular Estudiante en este Grupo
            </app-button>
          </div>
        </div>

        <!-- Tabla de Estudiantes Matriculados -->
        <div class="bg-white rounded-2xl border border-warm-200 shadow-warm-sm overflow-hidden">
          <div class="p-5 border-b border-warm-100 flex items-center justify-between">
            <div>
              <h3 class="font-serif font-bold text-lg text-warm-900">Estudiantes Matriculados en el Grupo</h3>
              <p class="text-xs text-warm-500">Listado oficial de alumnos habilitados para asistencia en este grupo.</p>
            </div>
            <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-warm-100 text-warm-700">
              {{ enrolledStudents().length }} estudiantes
            </span>
          </div>

          @if (enrolledStudents().length === 0) {
            <div class="p-12 text-center text-warm-400">
              <p class="text-sm">No hay estudiantes matriculados en este grupo.</p>
            </div>
          } @else {
            <div class="divide-y divide-warm-100">
              @for (est of enrolledStudents(); track est.id) {
                <div class="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-warm-50/50 transition-colors">
                  <div class="flex items-center gap-3 min-w-0">
                    <app-avatar [name]="est.nombreCompleto" size="md"></app-avatar>
                    <div class="min-w-0">
                      <h4 class="font-serif font-bold text-sm text-warm-900 truncate">
                        {{ est.nombreCompleto }}
                      </h4>
                      <p class="text-xs text-warm-500">
                        Cód. {{ est.codigo }} • Doc. {{ est.documento }} • {{ est.programa }}
                      </p>
                    </div>
                  </div>

                  <!-- Acción Retirar de Grupo -->
                  <button
                    type="button"
                    (click)="retirarEstudiante(est)"
                    class="text-xs font-semibold text-red-700 hover:text-red-950 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1 shrink-0"
                    title="Retirar estudiante de este grupo académico"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Retirar del Grupo
                  </button>
                </div>
              }
            </div>
          }
        </div>

        <!-- Formulario Inline / Sección para Matricular Nuevo Estudiante -->
        @if (mostrarModalMatricular()) {
          <div class="bg-white p-6 rounded-2xl border border-primary-200 shadow-warm-md space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="font-serif font-bold text-base text-warm-900">
                  Matricular Alumno en {{ selectedCourse()?.name }}
                </h4>
                <p class="text-xs text-warm-500">Selecciona un estudiante del directorio activo para registrarlo en el grupo.</p>
              </div>
              <button (click)="mostrarModalMatricular.set(false)" class="text-warm-400 hover:text-warm-700 text-xs font-bold">
                ✕ Cerrar
              </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="sm:col-span-2">
                <app-form-field label="Estudiante a Matricular">
                  <select
                    [(ngModel)]="estudianteAMatricularId"
                    class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm text-warm-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    <option value="">Selecciona un estudiante...</option>
                    @for (est of estudiantesDisponiblesParaGrupo(); track est.id) {
                      <option [value]="est.id">
                        {{ est.nombreCompleto }} (Cód. {{ est.codigo }}) — {{ est.programa }}
                      </option>
                    }
                  </select>
                </app-form-field>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 pt-2">
              <app-button variant="secondary" size="sm" (clicked)="mostrarModalMatricular.set(false)">
                Cancelar
              </app-button>
              <app-button
                variant="primary"
                size="sm"
                [disabled]="!estudianteAMatricularId"
                (clicked)="confirmarMatriculaEstudiante()"
              >
                Confirmar Matrícula
              </app-button>
            </div>
          </div>
        }
      }

      <!-- 3. PESTAÑA: SOLICITUDES DE CUPO / INSCRIPCIÓN -->
      @if (pestanaActiva() === 'SOLICITUDES') {
        <div class="space-y-4">
          <!-- Filtro de Solicitudes -->
          <div class="flex items-center justify-between bg-white p-4 rounded-2xl border border-warm-200 shadow-warm-sm">
            <span class="text-xs font-bold uppercase tracking-wider text-warm-500">
              Filtrar Solicitudes de Inscripción:
            </span>

            <select
              [(ngModel)]="filtroEstadoSolicitudes"
              class="px-3.5 py-1.5 bg-warm-50 border border-warm-200 rounded-xl text-xs font-semibold text-warm-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="TODOS">Todas las solicitudes</option>
              <option value="PENDIENTE">Solo Pendientes</option>
              <option value="APROBADA">Aprobadas</option>
              <option value="RECHAZADA">Rechazadas</option>
            </select>
          </div>

          <!-- Listado de Solicitudes -->
          <div class="space-y-4">
            @for (sol of paginatedSolicitudes(); track sol.id) {
              <app-card padding="md">
                <div class="space-y-4">
                  <div class="flex flex-wrap items-start justify-between gap-2">
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-warm-100 text-warm-700">
                        RAD-#{{ sol.id.slice(0, 8).toUpperCase() }}
                      </span>
                      <app-badge [variant]="getSolicitudBadgeVariant(sol.estado)">
                        {{ sol.estado }}
                      </app-badge>
                    </div>

                    <span class="text-xs text-warm-400">
                      Radicada el {{ sol.fechaSolicitud }}
                    </span>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <!-- Estudiante Solicitante -->
                    <div class="flex items-center gap-3 p-3 rounded-xl bg-warm-50 border border-warm-100">
                      <app-avatar [name]="sol.estudianteNombre" size="md"></app-avatar>
                      <div class="min-w-0">
                        <h4 class="font-serif font-bold text-sm text-warm-900 truncate">
                          {{ sol.estudianteNombre }}
                        </h4>
                        <p class="text-xs text-warm-500">Cód. {{ sol.estudianteCodigo }}</p>
                      </div>
                    </div>

                    <!-- Asignatura Solicitada -->
                    <div class="p-3 rounded-xl bg-warm-50 border border-warm-100 text-xs space-y-0.5">
                      <span class="text-warm-400 block text-[11px]">Asignatura y Grupo Solicitado</span>
                      <strong class="text-warm-900 block">{{ sol.cursoNombre }} ({{ sol.cursoCodigo }})</strong>
                      <span class="text-warm-600">{{ sol.grupo }}</span>
                    </div>
                  </div>

                  <div class="p-3 rounded-xl bg-warm-50/70 border border-warm-200 text-xs text-warm-700">
                    <strong class="text-warm-900">Motivo del estudiante:</strong> "{{ sol.motivo }}"
                  </div>

                  <!-- Acciones de Decisión para Pendientes -->
                  @if (sol.estado === 'PENDIENTE') {
                    <div class="pt-3 border-t border-warm-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <input
                        type="text"
                        [(ngModel)]="feedbackSolicitud[sol.id]"
                        placeholder="Observación de Coordinación (opcional)..."
                        class="flex-1 px-3 py-1.5 bg-warm-50 border border-warm-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      />

                      <div class="flex items-center gap-2 shrink-0">
                        <app-button
                          variant="danger"
                          size="sm"
                          (clicked)="resolverSolicitud(sol, 'RECHAZADA')"
                        >
                          Rechazar Cupo
                        </app-button>
                        <app-button
                          variant="primary"
                          size="sm"
                          (clicked)="resolverSolicitud(sol, 'APROBADA')"
                        >
                          Aprobar Cupo & Matricular
                        </app-button>
                      </div>
                    </div>
                  } @else {
                    <div class="text-xs text-warm-500 italic pt-1">
                      Resolución de Coordinación: "{{ sol.respuestaCoordinador }}" ({{ sol.fechaRespuesta }})
                    </div>
                  }
                </div>
              </app-card>
            }
          </div>

          <!-- Paginador de Solicitudes -->
          <app-pagination
            [totalItems]="filteredSolicitudes().length"
            [pageSize]="pageSizeSolicitudes"
            [currentPage]="currentPageSolicitudes"
            (pageChange)="currentPageSolicitudes = $event"
            (pageSizeChange)="onPageSizeSolicitudesChange($event)"
          ></app-pagination>
        </div>
      }
    </div>
  `,
})
export class CoordinatorStudentsComponent implements OnInit {
  private coordinatorService = inject(CoordinatorManagementService);
  private courseService = inject(CourseService);
  private toast = inject(ToastService);

  pestanaActiva = signal<PestanaModulo>('DIRECTORIO');

  // Directorio
  directorio = signal<EstudianteDirectorioItem[]>([]);
  searchDirectorio = '';
  filtroEstadoDirectorio = 'TODOS';

  // Matrícula por Grupo
  courses = signal<Course[]>([]);
  selectedCourseId = signal<string>('crs-1');
  enrolledStudents = signal<EstudianteDirectorioItem[]>([]);
  mostrarModalMatricular = signal<boolean>(false);
  estudianteAMatricularId = '';

  // Solicitudes de Cupo
  solicitudes = signal<SolicitudMatriculaItem[]>([]);
  filtroEstadoSolicitudes = 'TODOS';
  feedbackSolicitud: Record<string, string> = {};

  // Paginación Directorio
  currentPageDirectorio = 1;
  pageSizeDirectorio = 6;

  // Paginación Solicitudes
  currentPageSolicitudes = 1;
  pageSizeSolicitudes = 5;

  selectedCourse = computed(() => {
    return this.courses().find((c) => c.id === this.selectedCourseId()) || null;
  });

  totalSolicitudesPendientes = computed(() => {
    return this.solicitudes().filter((s) => s.estado === 'PENDIENTE').length;
  });

  filteredDirectorio = computed(() => {
    const q = this.searchDirectorio.toLowerCase().trim();
    const estado = this.filtroEstadoDirectorio;

    return this.directorio().filter((e) => {
      const matchQ =
        !q ||
        e.nombreCompleto.toLowerCase().includes(q) ||
        e.codigo.toLowerCase().includes(q) ||
        e.documento.includes(q);
      const matchEstado = estado === 'TODOS' || e.estadoMatricula === estado;
      return matchQ && matchEstado;
    });
  });

  paginatedDirectorio = computed(() => {
    const items = this.filteredDirectorio();
    const start = (this.currentPageDirectorio - 1) * this.pageSizeDirectorio;
    return items.slice(start, start + this.pageSizeDirectorio);
  });

  filteredSolicitudes = computed(() => {
    const estado = this.filtroEstadoSolicitudes;
    if (estado === 'TODOS') return this.solicitudes();
    return this.solicitudes().filter((s) => s.estado === estado);
  });

  paginatedSolicitudes = computed(() => {
    const items = this.filteredSolicitudes();
    const start = (this.currentPageSolicitudes - 1) * this.pageSizeSolicitudes;
    return items.slice(start, start + this.pageSizeSolicitudes);
  });

  onPageSizeDirectorioChange(newSize: number): void {
    this.pageSizeDirectorio = newSize;
    this.currentPageDirectorio = 1;
  }

  onPageSizeSolicitudesChange(newSize: number): void {
    this.pageSizeSolicitudes = newSize;
    this.currentPageSolicitudes = 1;
  }

  estudiantesDisponiblesParaGrupo = computed(() => {
    const enrolledIds = new Set(this.enrolledStudents().map((e) => e.id));
    return this.directorio().filter((e) => e.estadoMatricula === 'ACTIVO' && !enrolledIds.has(e.id));
  });

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    // 1. Cargar Directorio
    this.coordinatorService.getEstudiantesDirectorio().subscribe({
      next: (res) => this.directorio.set(res.datos || []),
    });

    // 2. Cargar Cursos
    this.courseService.getTeacherCourses().subscribe({
      next: (res) => {
        const list = res.datos || [];
        this.courses.set(list);
        if (list.length > 0 && !this.selectedCourseId()) {
          this.selectedCourseId.set(list[0].id);
        }
        if (this.selectedCourseId()) {
          this.cargarEstudiantesGrupo(this.selectedCourseId());
        }
      },
    });

    // 3. Cargar Solicitudes
    this.coordinatorService.getSolicitudesMatricula().subscribe({
      next: (res) => this.solicitudes.set(res.datos || []),
    });
  }

  onSelectCourse(cursoId: string): void {
    this.selectedCourseId.set(cursoId);
    this.cargarEstudiantesGrupo(cursoId);
  }

  cargarEstudiantesGrupo(cursoId: string): void {
    this.coordinatorService.getEstudiantesPorGrupo(cursoId).subscribe({
      next: (res) => this.enrolledStudents.set(res.datos || []),
    });
  }

  abrirModalMatricular(): void {
    this.estudianteAMatricularId = '';
    this.mostrarModalMatricular.set(true);
  }

  confirmarMatriculaEstudiante(): void {
    const cursoId = this.selectedCourseId();
    if (!cursoId || !this.estudianteAMatricularId) return;

    // Validación preventiva en lista local
    const yaEnGrupo = this.enrolledStudents().some((e) => e.id === this.estudianteAMatricularId);
    if (yaEnGrupo) {
      this.toast.warning('El estudiante ya se encuentra matriculado en este grupo académico.');
      return;
    }

    this.coordinatorService.matricularEstudianteGrupo(cursoId, this.estudianteAMatricularId).subscribe({
      next: (res) => {
        if (res.exitoso) {
          this.toast.success(res.mensajeUsuario || 'Estudiante matriculado exitosamente.');
          this.mostrarModalMatricular.set(false);
          this.cargarEstudiantesGrupo(cursoId);
          this.coordinatorService.getEstudiantesDirectorio().subscribe((r) => this.directorio.set(r.datos || []));
        }
      },
      error: (err) => {
        const msg = getApiErrorMessage(err);
        this.toast.warning(msg);
      },
    });
  }

  retirarEstudiante(est: EstudianteDirectorioItem): void {
    const cursoId = this.selectedCourseId();
    if (!cursoId) return;

    if (confirm(`¿Estás seguro de que deseas retirar a ${est.nombreCompleto} de este grupo?`)) {
      this.coordinatorService.retirarEstudianteGrupo(cursoId, est.id).subscribe({
        next: (res) => {
          if (res.exitoso) {
            this.toast.success(res.mensajeUsuario || 'Estudiante retirado.');
            this.cargarEstudiantesGrupo(cursoId);
            this.coordinatorService.getEstudiantesDirectorio().subscribe((r) => this.directorio.set(r.datos || []));
          }
        },
        error: (err) => this.toast.error(getApiErrorMessage(err)),
      });
    }
  }

  resolverSolicitud(sol: SolicitudMatriculaItem, accion: 'APROBADA' | 'RECHAZADA'): void {
    const comentario = this.feedbackSolicitud[sol.id] || '';
    this.coordinatorService.resolverSolicitudMatricula(sol.id, accion, comentario).subscribe({
      next: (res) => {
        if (res.exitoso) {
          this.toast.success(res.mensajeUsuario || 'Solicitud procesada.');
          this.coordinatorService.getSolicitudesMatricula().subscribe((r) => this.solicitudes.set(r.datos || []));
          if (this.selectedCourseId()) {
            this.cargarEstudiantesGrupo(this.selectedCourseId());
          }
        }
      },
      error: (err) => this.toast.error(getApiErrorMessage(err)),
    });
  }

  getSolicitudBadgeVariant(estado: string): BadgeVariant {
    switch (estado) {
      case 'APROBADA':
        return 'success';
      case 'RECHAZADA':
        return 'danger';
      default:
        return 'warning';
    }
  }
}
