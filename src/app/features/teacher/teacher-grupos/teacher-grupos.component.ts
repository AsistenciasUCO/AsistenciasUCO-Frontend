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

type VistaGrupos = 'LISTA' | 'FORM_GRUPO' | 'DETALLE_SESIONES' | 'FORM_SESION';

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
                        title="Modificar datos del grupo (HU044)"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar Grupo
                      </button>

                      <app-button
                        variant="secondary"
                        size="sm"
                        (clicked)="verSesionesGrupo(course)"
                      >
                        <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Sesiones & Horarios
                      </app-button>
                    </div>

                    <app-button variant="primary" size="sm" (clicked)="tomarAsistenciaGrupo(course)">
                      <svg class="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Asistencia
                    </app-button>
                  </div>
                </div>
              </app-card>
            }
          </div>
        }
      }

      <!-- 2. VISTA COMPLETA: FORMULARIO CREAR / EDITAR GRUPO (HU043, HU044) -->
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
              Define los parámetros de la asignatura, horario regular semanal, aula asignada y cupo de estudiantes (HU043, HU044).
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <app-form-field label="Código de la Asignatura" [required]="true">
              <input
                type="text"
                [(ngModel)]="grupoForm.code"
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
                  placeholder="Ej. Matemática Avanzada III"
                  class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </app-form-field>
            </div>

            <app-form-field label="Horario Regular Semanal" [required]="true">
              <input
                type="text"
                [(ngModel)]="grupoForm.schedule"
                placeholder="Ej. Lun, Mié 08:00 - 10:00 AM"
                class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </app-form-field>

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

      <!-- 3. VISTA COMPLETA: GESTIÓN DE SESIONES DEL GRUPO (HU056, HU045-HU049) -->
      @if (vistaActual() === 'DETALLE_SESIONES' && selectedCourse()) {
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

          <span class="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-warm-100 text-warm-800">
            {{ selectedCourse()?.code }} • {{ selectedCourse()?.section }}
          </span>
        </div>

        <!-- Ficha de Encabezado del Grupo -->
        <div class="bg-white p-6 rounded-2xl border border-warm-200 shadow-warm-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary-50 text-primary-800 border border-primary-200">
                {{ selectedCourse()?.code }}
              </span>
              <span class="text-xs font-bold text-warm-600">{{ selectedCourse()?.section }}</span>
            </div>
            <h2 class="font-serif font-bold text-2xl text-warm-900">{{ selectedCourse()?.name }}</h2>
            <p class="text-xs text-warm-600">
              Horario Regular: <strong>{{ selectedCourse()?.schedule }}</strong> • Aula: <strong>{{ selectedCourse()?.room }}</strong> • Docente: <strong>{{ selectedCourse()?.docenteName }}</strong>
            </p>
          </div>

          <div class="flex items-center gap-3 shrink-0">
            <app-button variant="primary" size="md" (clicked)="abrirCrearSesionExtraordinaria()">
              <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              + Programar Sesión Extraordinaria
            </app-button>
          </div>
        </div>

        <!-- Listado de Sesiones Programadas (HU056) -->
        <div class="bg-white rounded-2xl border border-warm-200 shadow-warm-sm overflow-hidden">
          <div class="p-5 border-b border-warm-100 flex items-center justify-between">
            <div>
              <h3 class="font-serif font-bold text-lg text-warm-900">Cronograma de Sesiones de Clase</h3>
              <p class="text-xs text-warm-500">Sesiones regulares programadas, reposiciones y sesiones extraordinarias registradas (HU056).</p>
            </div>
            <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-warm-100 text-warm-700">
              {{ sessions().length }} sesiones
            </span>
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
                    <app-badge [variant]="sesion.status === 'CONCLUIDA' ? 'neutral' : 'info'">
                      {{ sesion.status }}
                    </app-badge>

                    <button
                      type="button"
                      (click)="abrirEditarSesion(sesion)"
                      class="text-xs font-semibold text-primary-800 hover:text-primary-950 bg-primary-50 hover:bg-primary-100 border border-primary-200 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                      title="Modificar horario o aula de la sesión (HU048, HU049)"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Ajustar Horario / Aula
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- 4. VISTA COMPLETA: FORMULARIO SESIÓN (PROGRAMAR EXTRAORDINARIA / EDITAR BLOQUE) (HU045-HU049) -->
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
              Establece la fecha, horario de inicio y fin, aula y temática para este bloque de clase (HU045 a HU049).
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
    </div>
  `,
})
export class TeacherGruposComponent implements OnInit {
  private courseService = inject(CourseService);
  private sessionService = inject(SessionService);
  private router = inject(Router);
  private toast = inject(ToastService);

  vistaActual = signal<VistaGrupos>('LISTA');
  courses = signal<Course[]>([]);
  isLoading = signal<boolean>(true);
  searchQuery = '';

  // Formulario Grupo (HU043, HU044)
  modoFormGrupo: 'CREAR' | 'EDITAR' = 'CREAR';
  selectedGrupoId: string | null = null;
  grupoForm = {
    code: '',
    name: '',
    section: 'Grupo 01',
    schedule: 'Lun, Mié 08:00 - 10:00 AM',
    room: 'Aula A-204',
    cupoMaximo: 35,
    docenteName: 'Dra. María Elena Rostagno',
  };

  // Gestión de Sesiones (HU056, HU045-HU049)
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
    this.grupoForm = {
      code: '',
      name: '',
      section: `Grupo 0${this.courses().length + 1}`,
      schedule: 'Lun, Mié 08:00 - 10:00 AM',
      room: 'Aula A-204',
      cupoMaximo: 35,
      docenteName: 'Dra. María Elena Rostagno',
    };
    this.vistaActual.set('FORM_GRUPO');
  }

  abrirEditarGrupo(course: Course): void {
    this.modoFormGrupo = 'EDITAR';
    this.selectedGrupoId = course.id;
    this.grupoForm = {
      code: course.code,
      name: course.name,
      section: course.section,
      schedule: course.schedule,
      room: course.room,
      cupoMaximo: course.cupoMaximo || 35,
      docenteName: course.docenteName,
    };
    this.vistaActual.set('FORM_GRUPO');
  }

  guardarGrupo(): void {
    if (this.modoFormGrupo === 'CREAR') {
      this.courseService
        .crearGrupo({
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
              this.toast.success(res.mensajeUsuario || 'Grupo creado con éxito.');
              this.cargarGrupos();
              this.volverALista();
            }
          },
          error: () => this.toast.error('Error al crear grupo.'),
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
          error: () => this.toast.error('Error al modificar grupo.'),
        });
    }
  }

  volverALista(): void {
    this.vistaActual.set('LISTA');
    this.selectedCourse.set(null);
  }

  // --- NAVEGACIÓN SESIONES (HU056, HU045-HU049) ---
  verSesionesGrupo(course: Course): void {
    this.selectedCourse.set(course);
    this.vistaActual.set('DETALLE_SESIONES');
    this.cargarSesiones(course.id);
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
          error: () => this.toast.error('Error al programar sesión.'),
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
          error: () => this.toast.error('Error al actualizar sesión.'),
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
}
