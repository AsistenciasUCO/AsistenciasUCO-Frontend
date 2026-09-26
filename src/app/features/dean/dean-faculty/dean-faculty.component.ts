import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseService } from '../../../core/services/course.service';
import { SessionService } from '../../../core/services/session.service';
import { AdminManagementService } from '../../../core/services/admin-management.service';
import { CoordinatorManagementService } from '../../../core/services/coordinator-management.service';
import { Course } from '../../../core/models/course.model';
import { ClassSession } from '../../../core/models/attendance.model';
import {
  PlanEstudioItem,
  AsignaturaPlanItem,
} from '../../../core/models/role-management.model';
import { CardComponent } from '../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

type TabDecanoFacultad = 'GRUPOS' | 'ESTRUCTURA' | 'PERIODOS';
type SubVistaDecano = 'LISTA' | 'DETALLE_GRUPO';

@Component({
  selector: 'app-dean-faculty',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    BadgeComponent,
    ButtonComponent,
    PaginationComponent,
  ],
  template: `
    <div class="space-y-6 animate-fade-in">
      <!-- 1. VISTA: TABLERO GENERAL DE LA FACULTAD -->
      @if (subVista() === 'LISTA') {
        <!-- Header Bento -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-warm-200/80 shadow-warm-sm">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent-100 text-accent-900 border border-accent-200">
                Decanatura Institucional
              </span>
              <span class="text-xs text-warm-400">•</span>
              <span class="text-xs font-medium text-warm-500">Supervisión Académica y Curricular</span>
            </div>
            <h1 class="font-serif font-bold text-2xl sm:text-3xl text-warm-900 tracking-tight">
              Facultad, Grupos y Calendario Académico
            </h1>
            <p class="text-sm text-warm-600 mt-1">
              Supervisión de grupos activos, docentes titulares, espacios asignados, áreas temáticas y períodos lectivos.
            </p>
          </div>

          <div class="flex items-center gap-3">
            <span class="px-3.5 py-1.5 rounded-xl bg-warm-100 text-xs font-bold text-warm-800 border border-warm-200">
              Facultad de Ingeniería
            </span>
          </div>
        </div>

        <!-- Barra de Pestañas -->
        <div class="flex border-b border-warm-200 bg-white px-4 rounded-2xl shadow-warm-sm gap-2">
          <button
            type="button"
            (click)="tabActiva.set('GRUPOS')"
            [class]="tabActiva() === 'GRUPOS' ? 'border-primary-700 text-primary-900 font-bold border-b-2' : 'text-warm-500 hover:text-warm-800'"
            class="px-4 py-3 text-sm flex items-center gap-2 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            <span>Grupos de la Facultad ({{ courses().length }})</span>
          </button>

          <button
            type="button"
            (click)="tabActiva.set('ESTRUCTURA')"
            [class]="tabActiva() === 'ESTRUCTURA' ? 'border-primary-700 text-primary-900 font-bold border-b-2' : 'text-warm-500 hover:text-warm-800'"
            class="px-4 py-3 text-sm flex items-center gap-2 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            <span>Estructura, Sedes y Áreas</span>
          </button>

          <button
            type="button"
            (click)="tabActiva.set('PERIODOS')"
            [class]="tabActiva() === 'PERIODOS' ? 'border-primary-700 text-primary-900 font-bold border-b-2' : 'text-warm-500 hover:text-warm-800'"
            class="px-4 py-3 text-sm flex items-center gap-2 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span>Períodos Académicos Institucionales</span>
          </button>
        </div>

        <!-- ================= PESTAÑA 1: GRUPOS ACADÉMICOS DE LA FACULTAD ================= -->
        @if (tabActiva() === 'GRUPOS') {
          <div class="space-y-4">
            <!-- Métricas Bento -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="p-4 rounded-2xl bg-white border border-warm-200 shadow-warm-sm flex items-center gap-4">
                <div class="w-11 h-11 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center shrink-0">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <div>
                  <span class="text-xs text-warm-500 font-medium">Grupos en Facultad</span>
                  <p class="text-2xl font-serif font-bold text-warm-900">{{ courses().length }}</p>
                </div>
              </div>

              <div class="p-4 rounded-2xl bg-white border border-warm-200 shadow-warm-sm flex items-center gap-4">
                <div class="w-11 h-11 rounded-xl bg-accent-100 text-accent-800 flex items-center justify-center shrink-0">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                </div>
                <div>
                  <span class="text-xs text-warm-500 font-medium">Estudiantes en Formación</span>
                  <p class="text-2xl font-serif font-bold text-warm-900">{{ totalEstudiantes() }}</p>
                </div>
              </div>

              <div class="p-4 rounded-2xl bg-white border border-warm-200 shadow-warm-sm flex items-center gap-4">
                <div class="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <span class="text-xs text-warm-500 font-medium">Cupo Total Ofertado</span>
                  <p class="text-2xl font-serif font-bold text-emerald-700">{{ totalCupos() }} cupos</p>
                </div>
              </div>
            </div>

            <!-- Buscador de Grupos -->
            <div class="relative">
              <input
                type="text"
                [(ngModel)]="searchGroup"
                placeholder="Filtrar por código de materia, nombre, docente o aula..."
                class="w-full pl-10 pr-4 py-2.5 bg-white border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
              <svg class="w-4 h-4 text-warm-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>

            <!-- Tabla de Grupos para Decano -->
            <div class="bg-white rounded-2xl border border-warm-200 shadow-warm-sm overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-left text-sm">
                  <thead class="bg-warm-50 border-b border-warm-200 text-xs font-bold text-warm-600 uppercase tracking-wider">
                    <tr>
                      <th class="px-5 py-3.5">Asignatura & Grupo</th>
                      <th class="px-5 py-3.5">Docente Asignado</th>
                      <th class="px-5 py-3.5">Horario & Aula</th>
                      <th class="px-5 py-3.5 text-center">Inscritos / Aforo</th>
                      <th class="px-5 py-3.5 text-center">Estado</th>
                      <th class="px-5 py-3.5 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-warm-100">
                    @for (c of paginatedCourses(); track c.id) {
                      <tr class="hover:bg-warm-50/70 transition-colors">
                        <td class="px-5 py-4">
                          <div class="font-bold text-warm-900">{{ c.name }}</div>
                          <div class="text-xs text-warm-500 font-mono">{{ c.code }} • {{ c.section }}</div>
                        </td>
                        <td class="px-5 py-4">
                          <div class="text-[10px] text-warm-500">Cátedra Institucional</div>
                        </td>
                        <td class="px-5 py-4">
                          <div class="text-xs font-semibold text-warm-800">{{ c.schedule }}</div>
                          <div class="text-[10px] text-warm-500">Aula: {{ c.room || 'Por definir' }}</div>
                        </td>
                        <td class="px-5 py-4 text-center">
                          <span class="font-bold text-warm-900 text-xs">{{ c.enrolledStudentsCount }} / {{ c.cupoMaximo || 30 }}</span>
                          <div class="w-20 bg-warm-200 rounded-full h-1.5 mx-auto mt-1 overflow-hidden">
                            <div
                              class="bg-primary-700 h-1.5 rounded-full"
                              [style.width.%]="((c.enrolledStudentsCount / (c.cupoMaximo || 30)) * 100)"
                            ></div>
                          </div>
                        </td>
                        <td class="px-5 py-4 text-center">
                          <app-badge variant="success" size="sm">Habilitado</app-badge>
                        </td>
                        <td class="px-5 py-4 text-right">
                          <button
                            type="button"
                            (click)="abrirDetalleGrupo(c)"
                            class="px-3 py-1.5 text-xs font-bold text-primary-800 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors inline-flex items-center gap-1"
                          >
                            Ver Sesiones & Alumnos →
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Paginador de Grupos -->
            <app-pagination
              [totalItems]="filteredCourses().length"
              [pageSize]="pageSizeCourses"
              [currentPage]="currentPageCourses"
              (pageChange)="currentPageCourses = $event"
              (pageSizeChange)="onPageSizeCoursesChange($event)"
            ></app-pagination>
          </div>
        }

        <!-- ================= PESTAÑA 2: ESTRUCTURA, SEDES Y ÁREAS ================= -->
        @if (tabActiva() === 'ESTRUCTURA') {
          <div class="space-y-6">
            <!-- Ficha Institucional de la Facultad -->
            <div class="bg-white p-6 rounded-2xl border border-warm-200 shadow-warm-sm grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="space-y-2">
                <span class="text-[10px] uppercase font-bold text-warm-400">Unidad Académica Mayor</span>
                <h3 class="font-serif font-bold text-xl text-warm-900">Facultad de Ingeniería</h3>
                <p class="text-xs text-warm-600 leading-relaxed">
                  Líder en formación de ingenieros con alta rigurosidad científica, ética y compromiso con la transformación digital de la región del Oriente Antioqueño.
                </p>
              </div>

              <div class="space-y-3 bg-warm-50 p-4 rounded-xl border border-warm-100 text-xs">
                <div class="flex justify-between pb-1.5 border-b border-warm-200/60">
                  <span class="text-warm-500">Decano(a) Responsable:</span>
                  <span class="font-bold text-warm-900">Dr. Roberto Gómez Bolaños</span>
                </div>
                <div class="flex justify-between pb-1.5 border-b border-warm-200/60">
                  <span class="text-warm-500">Sede Principal:</span>
                  <span class="font-semibold text-warm-800">Campus Rionegro (Sector 3)</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-warm-500">Programas Adscritos:</span>
                  <span class="font-bold text-primary-800">Ing. de Sistemas, Industrial, Ambiental</span>
                </div>
              </div>

              <div class="space-y-3 bg-warm-50 p-4 rounded-xl border border-warm-100 text-xs">
                <div class="flex justify-between pb-1.5 border-b border-warm-200/60">
                  <span class="text-warm-500">Total Áreas Temáticas:</span>
                  <span class="font-bold text-warm-900">{{ areas().length }}</span>
                </div>
                <div class="flex justify-between pb-1.5 border-b border-warm-200/60">
                  <span class="text-warm-500">Total Espacios Físicos:</span>
                  <span class="font-bold text-warm-900">{{ espacios().length }} aulas/labs</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-warm-500">Estado de Facultad:</span>
                  <span class="text-xs font-bold text-emerald-700">ACTIVA Y VIGENTE</span>
                </div>
              </div>
            </div>

            <!-- Programas Académicos y Planes de Estudio de la Facultad (HU107, HU108, HU112, HU119) -->
            <div>
              <div class="flex items-center justify-between mb-3">
                <div>
                  <h3 class="font-serif font-bold text-lg text-warm-900">Programas Académicos de la Facultad</h3>
                  <p class="text-xs text-warm-500">Mallas curriculares, modalidades formativas y planes de estudio vigentes.</p>
                </div>
                <span class="text-xs font-bold px-3 py-1 rounded-full bg-primary-50 text-primary-800 border border-primary-200">
                  {{ programasFacultad().length }} Programas Activos
                </span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                @for (prog of programasFacultad(); track prog.codigo) {
                  <div class="bg-white p-5 rounded-2xl border border-warm-200 shadow-warm-sm hover:border-primary-300 transition-all flex flex-col justify-between h-full space-y-3">
                    <div>
                      <div class="flex items-center justify-between gap-2 mb-1.5">
                        <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-warm-100 text-warm-800">{{ prog.codigo }}</span>
                        <span class="text-xs font-semibold px-2 py-0.5 rounded-full"
                              [class]="prog.estado === 'ACTIVO' ? 'bg-emerald-100 text-emerald-800' : 'bg-warm-200 text-warm-700'">
                          {{ prog.estado }}
                        </span>
                      </div>
                      <h4 class="font-serif font-bold text-base text-warm-900">{{ prog.nombre }}</h4>
                      <p class="text-xs text-warm-500 mt-0.5">{{ prog.nivel }} • {{ prog.modalidad }}</p>
                    </div>

                    <div class="grid grid-cols-3 gap-2 py-2.5 border-y border-warm-100 text-xs text-warm-700 bg-warm-50/60 rounded-xl px-3 text-center">
                      <div>
                        <span class="text-[10px] text-warm-400 font-bold uppercase block">Créditos</span>
                        <span class="font-bold text-warm-900">{{ prog.totalCreditos }}</span>
                      </div>
                      <div>
                        <span class="text-[10px] text-warm-400 font-bold uppercase block">Semestres</span>
                        <span class="font-bold text-warm-900">{{ prog.totalSemestres }}</span>
                      </div>
                      <div>
                        <span class="text-[10px] text-warm-400 font-bold uppercase block">Asignaturas</span>
                        <span class="font-bold text-warm-900">{{ prog.totalAsignaturas || 54 }}</span>
                      </div>
                    </div>

                    <div class="pt-1">
                      <button
                        type="button"
                        (click)="verPlanEstudio(prog)"
                        class="w-full py-2 px-3 bg-primary-50 hover:bg-primary-100 text-primary-900 rounded-xl text-xs font-bold border border-primary-200 transition-colors inline-flex items-center justify-center gap-1.5"
                      >
                        <svg class="w-3.5 h-3.5 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Ver Plan de Estudios & Asignaturas →
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Áreas de Conocimiento de la Facultad -->
            <div>
              <h3 class="font-serif font-bold text-lg text-warm-900 mb-3">Áreas Temáticas y de Conocimiento</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                @for (a of areas(); track a.id) {
                  <div class="bg-white p-4 rounded-xl border border-warm-200 shadow-warm-sm space-y-2 flex flex-col justify-between h-full">
                    <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-warm-100 text-warm-700 w-fit">{{ a.codigo }}</span>
                    <h4 class="font-bold text-sm text-warm-900">{{ a.nombre }}</h4>
                    <p class="text-xs text-warm-500">Líder: <strong class="text-warm-800">{{ a.coordinadorArea || 'Por asignar' }}</strong></p>
                  </div>
                }
              </div>
            </div>

            <!-- Sedes y Campus Operativos -->
            <div>
              <h3 class="font-serif font-bold text-lg text-warm-900 mb-3">Sedes Universitarias donde Opera la Facultad</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                @for (s of sedes(); track s.id) {
                  <div class="bg-white p-5 rounded-2xl border border-warm-200 shadow-warm-sm space-y-2 flex flex-col justify-between h-full">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary-50 text-primary-800">{{ s.codigo }}</span>
                      <app-badge variant="success" size="sm">{{ s.estado }}</app-badge>
                    </div>
                    <h4 class="font-bold text-base text-warm-900">{{ s.nombre }}</h4>
                    <p class="text-xs text-warm-600">{{ s.direccion }} ({{ s.municipio }})</p>
                    <p class="text-xs text-warm-400">Teléfono: {{ s.telefono }}</p>
                  </div>
                }
              </div>
            </div>
          </div>
        }

        <!-- ================= PESTAÑA 3: PERÍODOS ACADÉMICOS INSTITUCIONALES ================= -->
        @if (tabActiva() === 'PERIODOS') {
          <div class="space-y-4">
            <div class="bg-white p-5 rounded-2xl border border-warm-200 shadow-warm-sm">
              <h3 class="font-serif font-bold text-lg text-warm-900">Calendario Académico y Vigencias</h3>
              <p class="text-xs text-warm-500">Consulta de semestres académicos activos, fechas de corte de asistencia y planeación lectiva.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
              @for (p of periodos(); track p.id) {
                <div class="bg-white p-5 rounded-2xl border border-warm-200 shadow-warm-sm space-y-3 flex flex-col justify-between h-full">
                  <div>
                    <div class="flex items-center justify-between gap-2 mb-2">
                      <span class="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-warm-100 text-warm-800">{{ p.codigo }}</span>
                      <app-badge [variant]="p.estado === 'ACTIVO' ? 'success' : (p.estado === 'PLANEACION' ? 'warning' : 'neutral')">
                        {{ p.estado }}
                      </app-badge>
                    </div>
                    <h4 class="font-bold text-base text-warm-900">{{ p.nombre }}</h4>
                    <div class="space-y-1 text-xs text-warm-600 pt-2 border-t border-warm-100 mt-2">
                      <p>Inicio: <strong>{{ p.fechaInicio }}</strong></p>
                      <p>Finalización: <strong>{{ p.fechaFin }}</strong></p>
                    </div>
                  </div>

                  @if (p.esActual) {
                    <div class="p-2 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                      <span class="text-[11px] font-bold text-emerald-800">● Período Académico en Curso</span>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        }
      }

      <!-- 2. VISTA COMPLETA: DETALLE DEL GRUPO SELECCIONADO PARA DECANO -->
      @if (subVista() === 'DETALLE_GRUPO' && selectedCourse()) {
        <!-- Barra de Retorno -->
        <div class="flex items-center justify-between bg-white p-4 rounded-2xl border border-warm-200 shadow-warm-sm">
          <button
            type="button"
            (click)="subVista.set('LISTA')"
            class="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-warm-700 hover:text-warm-950 bg-warm-50 hover:bg-warm-100 border border-warm-200 px-3.5 py-2 rounded-xl transition-all shadow-xs"
          >
            <svg class="w-4 h-4 text-warm-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Volver a Grupos de la Facultad
          </button>

          <span class="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-warm-100 text-warm-800">
            {{ selectedCourse()?.code }} • {{ selectedCourse()?.section }}
          </span>
        </div>

        <!-- Ficha Resumen del Grupo -->
        <div class="bg-white p-6 rounded-2xl border border-warm-200 shadow-warm-sm grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="md:col-span-3 space-y-2">
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary-50 text-primary-800 border border-primary-200">
                {{ selectedCourse()?.code }}
              </span>
              <span class="text-xs font-bold text-warm-600">{{ selectedCourse()?.section }}</span>
            </div>
            <h2 class="font-serif font-bold text-2xl text-warm-900">{{ selectedCourse()?.name }}</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-warm-600 pt-2 border-t border-warm-100">
              <div>
                <span class="text-warm-400 block text-[11px]">Horario Regular</span>
                <strong class="text-warm-800">{{ selectedCourse()?.schedule }}</strong>
              </div>
              <div>
                <span class="text-warm-400 block text-[11px]">Aula Asignada</span>
                <strong class="text-warm-800">{{ selectedCourse()?.room || 'Aula Central' }}</strong>
              </div>
            </div>
          </div>

          <div class="p-4 rounded-xl bg-warm-50 border border-warm-100 flex flex-col justify-between text-center">
            <div>
              <span class="text-xs text-warm-500 font-medium">Aforo Ocupado</span>
              <p class="text-3xl font-serif font-bold text-primary-800 my-1">
                {{ selectedCourse()?.enrolledStudentsCount }} / {{ selectedCourse()?.cupoMaximo || 30 }}
              </p>
            </div>
            <div class="text-[11px] text-warm-500 pt-2 border-t border-warm-200/80">
              <span>Cupo Ofertado Facultad</span>
            </div>
          </div>
        </div>

        <!-- Cronograma de Sesiones del Grupo -->
        <div class="bg-white rounded-2xl border border-warm-200 shadow-warm-sm overflow-hidden">
          <div class="p-5 border-b border-warm-100 flex items-center justify-between">
            <div>
              <h3 class="font-serif font-bold text-lg text-warm-900">Sesiones de Clase Registradas</h3>
              <p class="text-xs text-warm-500">Cronograma de clases del grupo, asistencias consolidadas y aulas utilizadas.</p>
            </div>
            <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-warm-100 text-warm-700">
              {{ sessions().length }} sesiones
            </span>
          </div>

          <div class="divide-y divide-warm-100">
            @for (s of sessions(); track s.id) {
              <div class="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-warm-50/50 transition-colors">
                <div class="space-y-1 flex-1 min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="text-xs font-mono font-bold px-2.5 py-0.5 rounded-md bg-warm-100 text-warm-800">#{{ s.sessionNumber }}</span>
                    <span class="text-xs font-medium text-warm-600">{{ s.date }}</span>
                    <span class="text-warm-300">•</span>
                    <span class="text-xs font-mono font-bold text-warm-800">{{ s.startTime }} - {{ s.endTime }}</span>
                    <span class="text-warm-300">•</span>
                    <span class="text-xs text-warm-600 bg-warm-100/60 px-2 py-0.5 rounded-md">Aula: {{ selectedCourse()?.room }}</span>
                  </div>
                  <h4 class="font-bold text-sm text-warm-900">{{ s.title }}</h4>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- MODAL: PLAN DE ESTUDIOS Y ASIGNATURAS POR SEMESTRE (HU108, HU084) -->
      @if (planVisualizado()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-warm-950/40 backdrop-blur-xs animate-fade-in">
          <div class="bg-white border border-warm-200 rounded-3xl max-w-3xl w-full shadow-warm-xl overflow-hidden animate-slide-down">
            <!-- Header Modal -->
            <div class="p-6 bg-warm-50 border-b border-warm-200/80 flex items-start justify-between">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-primary-100 text-primary-900 border border-primary-200">
                    {{ planVisualizado()?.codigo }}
                  </span>
                  <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {{ planVisualizado()?.estado }}
                  </span>
                </div>
                <h3 class="font-serif font-bold text-2xl text-warm-900">
                  {{ planVisualizado()?.nombre }}
                </h3>
                <p class="text-xs text-warm-600 mt-1">
                  Programa: <strong>{{ planVisualizado()?.programa }}</strong> • {{ planVisualizado()?.totalCreditos }} créditos en {{ planVisualizado()?.totalSemestres }} semestres
                </p>
              </div>

              <button
                type="button"
                (click)="cerrarPlanEstudio()"
                class="text-warm-400 hover:text-warm-700 p-1.5 rounded-xl hover:bg-warm-100 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Body Modal -->
            <div class="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <p class="text-xs text-warm-600 leading-relaxed bg-warm-50 p-3.5 rounded-xl border border-warm-100">
                {{ planVisualizado()?.descripcion }}
              </p>

              <div class="flex items-center justify-between">
                <h4 class="font-serif font-bold text-base text-warm-900">
                  Malla Curricular de Asignaturas
                </h4>
                <span class="text-xs font-bold px-2.5 py-1 rounded-lg bg-warm-100 text-warm-800">
                  {{ asignaturasPlan().length }} Asignaturas
                </span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                @for (asig of asignaturasPlan(); track asig.id) {
                  <div class="p-3 bg-white rounded-xl border border-warm-200 shadow-warm-xs flex justify-between items-center text-xs">
                    <div>
                      <div class="flex items-center gap-1.5">
                        <span class="font-mono font-bold text-primary-800">{{ asig.codigo }}</span>
                        <span class="font-bold text-warm-900">{{ asig.nombre }}</span>
                      </div>
                      <div class="text-[10px] text-warm-500 mt-0.5">
                        Semestre {{ asig.semestre }} • Área: {{ asig.area }}
                      </div>
                    </div>
                    <span class="px-2 py-1 rounded-md bg-warm-100 text-warm-800 font-bold text-[11px] shrink-0">
                      {{ asig.creditos }} cr.
                    </span>
                  </div>
                }
              </div>
            </div>

            <!-- Footer Modal -->
            <div class="p-4 bg-warm-50 border-t border-warm-200 flex justify-end">
              <button
                type="button"
                (click)="cerrarPlanEstudio()"
                class="px-4 py-2 bg-warm-200 hover:bg-warm-300 text-warm-800 font-semibold text-xs rounded-xl transition-colors"
              >
                Cerrar Plan
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class DeanFacultyComponent implements OnInit {
  private courseService = inject(CourseService);
  private sessionService = inject(SessionService);
  private adminService = inject(AdminManagementService);
  private coordService = inject(CoordinatorManagementService);

  tabActiva = signal<TabDecanoFacultad>('GRUPOS');
  subVista = signal<SubVistaDecano>('LISTA');
  searchGroup = '';

  courses = signal<Course[]>([]);
  sedes = this.adminService.sedes;
  espacios = this.adminService.espacios;
  facultades = this.adminService.facultades;
  areas = this.adminService.areas;
  periodos = this.coordService.periodos;

  selectedCourse = signal<Course | null>(null);
  sessions = signal<ClassSession[]>([]);

  planVisualizado = signal<PlanEstudioItem | null>(null);
  asignaturasPlan = signal<AsignaturaPlanItem[]>([]);

  programasFacultad = signal<any[]>([
    {
      codigo: 'PRG-SIS',
      nombre: 'Ingeniería de Sistemas',
      nivel: 'Pregrado Profesional',
      modalidad: 'Presencial Diurna',
      totalCreditos: 160,
      totalSemestres: 10,
      totalAsignaturas: 54,
      estado: 'ACTIVO',
      planEstudioId: 'PLAN-SIS-2024',
    },
    {
      codigo: 'PRG-IND',
      nombre: 'Ingeniería Industrial',
      nivel: 'Pregrado Profesional',
      modalidad: 'Presencial Diurna/Nocturna',
      totalCreditos: 165,
      totalSemestres: 10,
      totalAsignaturas: 56,
      estado: 'ACTIVO',
      planEstudioId: 'PLAN-SIS-2020',
    },
    {
      codigo: 'PRG-ELE',
      nombre: 'Ingeniería Electrónica',
      nivel: 'Pregrado Profesional',
      modalidad: 'Presencial Diurna',
      totalCreditos: 162,
      totalSemestres: 10,
      totalAsignaturas: 52,
      estado: 'ACTIVO',
      planEstudioId: 'PLAN-SIS-2024',
    },
    {
      codigo: 'PRG-AGR',
      nombre: 'Ingeniería Agroindustrial',
      nivel: 'Pregrado Profesional',
      modalidad: 'Presencial Diurna',
      totalCreditos: 158,
      totalSemestres: 10,
      totalAsignaturas: 50,
      estado: 'ACTIVO',
      planEstudioId: 'PLAN-SIS-2020',
    },
  ]);

  // Paginación Grupos
  currentPageCourses = 1;
  pageSizeCourses = 6;

  filteredCourses = computed(() => {
    const q = this.searchGroup.toLowerCase().trim();
    if (!q) return this.courses();
    return this.courses().filter(
      (c: Course) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        (c.room && c.room.toLowerCase().includes(q))
    );
  });

  paginatedCourses = computed(() => {
    const items = this.filteredCourses();
    const start = (this.currentPageCourses - 1) * this.pageSizeCourses;
    return items.slice(start, start + this.pageSizeCourses);
  });

  onPageSizeCoursesChange(newSize: number): void {
    this.pageSizeCourses = newSize;
    this.currentPageCourses = 1;
  }

  totalEstudiantes = computed(() =>
    this.courses().reduce((sum: number, c: Course) => sum + (c.enrolledStudentsCount || 0), 0)
  );

  totalCupos = computed(() =>
    this.courses().reduce((sum: number, c: Course) => sum + (c.cupoMaximo || 30), 0)
  );

  ngOnInit(): void {
    this.courseService.getTeacherCourses().subscribe({
      next: (res) => this.courses.set(res.datos || []),
    });
  }

  abrirDetalleGrupo(curso: Course): void {
    this.selectedCourse.set(curso);
    this.sessionService.getSessionsByGroup(curso.id).subscribe({
      next: (res) => this.sessions.set(res.datos || []),
    });
    this.subVista.set('DETALLE_GRUPO');
  }

  verPlanEstudio(prog: any): void {
    const planes: PlanEstudioItem[] = this.coordService.planes();
    const plan = planes.find((p: PlanEstudioItem) => p.id === prog.planEstudioId) || planes[0];
    this.planVisualizado.set(plan || null);
    if (plan) {
      this.asignaturasPlan.set(this.coordService.getAsignaturasPlan(plan.id));
    } else {
      this.asignaturasPlan.set([]);
    }
  }

  cerrarPlanEstudio(): void {
    this.planVisualizado.set(null);
  }
}
