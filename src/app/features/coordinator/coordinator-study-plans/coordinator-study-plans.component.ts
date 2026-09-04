import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoordinatorManagementService } from '../../../core/services/coordinator-management.service';
import {
  PlanEstudioItem,
  AsignaturaPlanItem,
  PeriodoAcademicoItem,
} from '../../../core/models/role-management.model';
import { CardComponent } from '../../../shared/components/card/card.component';
import { BadgeComponent, BadgeVariant } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { ToastService } from '../../../shared/components/toast/toast.component';

type PestanaCurricular = 'PLANES' | 'PERIODOS';
type SubVistaPlan = 'LISTA' | 'FORM_PLAN' | 'MALLA' | 'FORM_ASIGNATURA';

@Component({
  selector: 'app-coordinator-study-plans',
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
      <!-- Header Bento -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-warm-200/80 shadow-warm-sm">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-900 border border-primary-200">
              Coordinación de Programa
            </span>
            <span class="text-xs text-warm-400">•</span>
            <span class="text-xs font-medium text-warm-500">Gestión Curricular y Calendario</span>
          </div>
          <h1 class="font-serif font-bold text-2xl sm:text-3xl text-warm-900 tracking-tight">
            Estructura Curricular y Períodos Académicos
          </h1>
          <p class="text-sm text-warm-600 mt-1">
            Administra planes de estudio, mallas por semestres, asignaturas con prerrequisitos y vigencias de períodos académicos.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span class="px-3.5 py-1.5 rounded-xl bg-warm-100 text-xs font-bold text-warm-800 border border-warm-200">
            {{ planes().length }} Planes • {{ periodos().length }} Períodos
          </span>
        </div>
      </div>

      <!-- Barra de Pestañas Principales -->
      <div class="flex border-b border-warm-200 bg-white px-4 rounded-2xl shadow-warm-sm gap-2">
        <button
          type="button"
          (click)="cambiarPestana('PLANES')"
          [class.border-primary-700]="pestanaActiva() === 'PLANES'"
          [class.text-primary-800]="pestanaActiva() === 'PLANES'"
          [class.border-transparent]="pestanaActiva() !== 'PLANES'"
          [class.text-warm-500]="pestanaActiva() !== 'PLANES'"
          class="py-3 px-4 font-semibold text-sm border-b-2 transition-colors inline-flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Planes de Estudio & Malla (HU074-HU083)
        </button>

        <button
          type="button"
          (click)="cambiarPestana('PERIODOS')"
          [class.border-primary-700]="pestanaActiva() === 'PERIODOS'"
          [class.text-primary-800]="pestanaActiva() === 'PERIODOS'"
          [class.border-transparent]="pestanaActiva() !== 'PERIODOS'"
          [class.text-warm-500]="pestanaActiva() !== 'PERIODOS'"
          class="py-3 px-4 font-semibold text-sm border-b-2 transition-colors inline-flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Períodos Académicos (HU096-HU098)
        </button>
      </div>

      <!-- ========================================== -->
      <!-- PESTAÑA 1: PLANES DE ESTUDIO & MALLA       -->
      <!-- ========================================== -->
      @if (pestanaActiva() === 'PLANES') {
        <!-- 1.1 VISTA: LISTA DE PLANES -->
        @if (subVistaPlan() === 'LISTA') {
          <div class="flex justify-end">
            <app-button variant="primary" size="md" (clicked)="abrirCrearPlan()">
              <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              + Nuevo Plan de Estudio (HU074)
            </app-button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            @for (plan of planes(); track plan.id) {
              <app-card [hoverable]="true" padding="lg">
                <div class="flex flex-col h-full justify-between gap-5">
                  <div class="space-y-3">
                    <div class="flex items-start justify-between gap-3">
                      <div class="flex items-center gap-2">
                        <span class="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-warm-100 text-warm-800">
                          {{ plan.codigo }}
                        </span>
                        <app-badge [variant]="getPlanBadgeVariant(plan.estado)">
                          {{ plan.estado }}
                        </app-badge>
                      </div>

                      <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-800 border border-primary-200">
                        Año {{ plan.anioVigencia }}
                      </span>
                    </div>

                    <div>
                      <h3 class="font-serif font-bold text-xl text-warm-900 leading-snug">
                        {{ plan.nombre }}
                      </h3>
                      <p class="text-xs font-semibold text-primary-700 mt-0.5">
                        {{ plan.programa }} • {{ plan.facultad }}
                      </p>
                    </div>

                    <p class="text-xs text-warm-600 leading-relaxed line-clamp-2">
                      {{ plan.descripcion }}
                    </p>

                    <!-- Métricas Curriculares Bento -->
                    <div class="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-warm-50 border border-warm-100 text-center">
                      <div>
                        <span class="text-[11px] text-warm-400 block font-medium">Créditos</span>
                        <strong class="font-serif text-lg font-bold text-warm-900">{{ plan.totalCreditos }}</strong>
                      </div>
                      <div class="border-x border-warm-200">
                        <span class="text-[11px] text-warm-400 block font-medium">Duración</span>
                        <strong class="font-serif text-lg font-bold text-warm-900">{{ plan.totalSemestres }} Sem.</strong>
                      </div>
                      <div>
                        <span class="text-[11px] text-warm-400 block font-medium">Asignaturas</span>
                        <strong class="font-serif text-lg font-bold text-primary-800">{{ plan.totalAsignaturas }}</strong>
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center justify-between pt-3 border-t border-warm-100">
                    <button
                      type="button"
                      (click)="abrirEditarPlan(plan)"
                      class="text-xs font-semibold text-warm-600 hover:text-warm-900 px-2.5 py-1.5 rounded-lg hover:bg-warm-100 transition-colors inline-flex items-center gap-1"
                      title="Editar parámetros del plan (HU075, HU076)"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar Plan
                    </button>

                    <app-button variant="primary" size="sm" (clicked)="verMallaCurricular(plan)">
                      <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      Malla & Asignaturas (HU083)
                    </app-button>
                  </div>
                </div>
              </app-card>
            }
          </div>
        }

        <!-- 1.2 VISTA: FORMULARIO PLAN DE ESTUDIO (HU074, HU075, HU076) -->
        @if (subVistaPlan() === 'FORM_PLAN') {
          <div class="flex items-center justify-between bg-white p-4 rounded-2xl border border-warm-200 shadow-warm-sm">
            <button
              type="button"
              (click)="volverAListaPlanes()"
              class="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-warm-700 hover:text-warm-950 bg-warm-50 hover:bg-warm-100 border border-warm-200 px-3.5 py-2 rounded-xl transition-all shadow-xs"
            >
              <svg class="w-4 h-4 text-warm-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver a Planes de Estudio
            </button>

            <span class="text-xs font-bold text-primary-800 bg-primary-50 border border-primary-200 px-3 py-1 rounded-full">
              {{ modoFormPlan === 'CREAR' ? 'Nuevo Plan de Estudio (HU074)' : 'Modificar Plan (HU075)' }}
            </span>
          </div>

          <div class="bg-white p-6 sm:p-8 rounded-2xl border border-warm-200 shadow-warm-sm max-w-3xl mx-auto space-y-6">
            <div>
              <h2 class="font-serif font-bold text-2xl text-warm-900">
                {{ modoFormPlan === 'CREAR' ? 'Registro de Nuevo Plan de Estudio' : 'Edición de Plan de Estudio' }}
              </h2>
              <p class="text-sm text-warm-600 mt-1">
                Configura el código curricular, programa académico, facultad, duración en semestres y créditos totales.
              </p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <app-form-field label="Código del Plan" [required]="true">
                <input
                  type="text"
                  [(ngModel)]="planForm.codigo"
                  placeholder="Ej. PLAN-SIS-2027"
                  class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </app-form-field>

              <app-form-field label="Año de Vigencia" [required]="true">
                <input
                  type="number"
                  [(ngModel)]="planForm.anioVigencia"
                  class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </app-form-field>

              <div class="sm:col-span-2">
                <app-form-field label="Nombre Completo del Plan" [required]="true">
                  <input
                    type="text"
                    [(ngModel)]="planForm.nombre"
                    placeholder="Ej. Plan Curricular Ingeniería de Sistemas 2027"
                    class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </app-form-field>
              </div>

              <app-form-field label="Programa Académico" [required]="true">
                <input
                  type="text"
                  [(ngModel)]="planForm.programa"
                  class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </app-form-field>

              <app-form-field label="Facultad" [required]="true">
                <input
                  type="text"
                  [(ngModel)]="planForm.facultad"
                  class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </app-form-field>

              <app-form-field label="Total de Semestres" [required]="true">
                <input
                  type="number"
                  [(ngModel)]="planForm.totalSemestres"
                  min="1"
                  max="12"
                  class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </app-form-field>

              <app-form-field label="Total de Créditos" [required]="true">
                <input
                  type="number"
                  [(ngModel)]="planForm.totalCreditos"
                  min="20"
                  max="250"
                  class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </app-form-field>

              <div class="sm:col-span-2">
                <app-form-field label="Estado de Vigencia (HU076)" [required]="true">
                  <select
                    [(ngModel)]="planForm.estado"
                    class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm font-semibold text-warm-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    <option value="VIGENTE">VIGENTE (Activo para cohortes actuales)</option>
                    <option value="EN_TRANSICION">EN TRANSICIÓN (Fase de cierre progresivo)</option>
                    <option value="HISTORICO">HISTÓRICO (Solo consulta de egresados)</option>
                  </select>
                </app-form-field>
              </div>

              <div class="sm:col-span-2">
                <app-form-field label="Descripción del Enfoque Curricular">
                  <textarea
                    [(ngModel)]="planForm.descripcion"
                    rows="3"
                    class="w-full p-3 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  ></textarea>
                </app-form-field>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 pt-4 border-t border-warm-100">
              <app-button variant="secondary" size="md" (clicked)="volverAListaPlanes()">
                Cancelar
              </app-button>
              <app-button
                variant="primary"
                size="md"
                [disabled]="!planForm.codigo.trim() || !planForm.nombre.trim()"
                (clicked)="guardarPlan()"
              >
                <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {{ modoFormPlan === 'CREAR' ? 'Registrar Plan' : 'Guardar Cambios' }}
              </app-button>
            </div>
          </div>
        }

        <!-- 1.3 VISTA: MALLA CURRICULAR Y GESTIÓN DE ASIGNATURAS (HU077-HU083) -->
        @if (subVistaPlan() === 'MALLA' && selectedPlan()) {
          <div class="flex items-center justify-between bg-white p-4 rounded-2xl border border-warm-200 shadow-warm-sm">
            <button
              type="button"
              (click)="volverAListaPlanes()"
              class="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-warm-700 hover:text-warm-950 bg-warm-50 hover:bg-warm-100 border border-warm-200 px-3.5 py-2 rounded-xl transition-all shadow-xs"
            >
              <svg class="w-4 h-4 text-warm-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver a Planes de Estudio
            </button>

            <span class="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-warm-100 text-warm-800">
              {{ selectedPlan()?.codigo }} • Año {{ selectedPlan()?.anioVigencia }}
            </span>
          </div>

          <!-- Banner Resumen y Acciones Curriculares -->
          <div class="bg-white p-6 rounded-2xl border border-warm-200 shadow-warm-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <app-badge [variant]="getPlanBadgeVariant(selectedPlan()!.estado)">
                  {{ selectedPlan()?.estado }}
                </app-badge>
                <span class="text-xs text-warm-500">•</span>
                <span class="text-xs font-semibold text-primary-700">{{ selectedPlan()?.programa }}</span>
              </div>
              <h2 class="font-serif font-bold text-2xl text-warm-900">{{ selectedPlan()?.nombre }}</h2>
              <p class="text-xs text-warm-600">
                Duración: <strong>{{ selectedPlan()?.totalSemestres }} Semestres</strong> • Créditos: <strong>{{ selectedPlan()?.totalCreditos }}</strong> • Asignaturas: <strong>{{ asignaturas().length }}</strong>
              </p>
            </div>

            <!-- Botones de Acción Malla (HU077, HU078, HU079) -->
            <div class="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                (click)="agregarSemestre()"
                class="px-3 py-1.5 text-xs font-semibold text-warm-700 bg-warm-50 hover:bg-warm-100 border border-warm-200 rounded-xl transition-colors inline-flex items-center gap-1"
                title="Aumentar duración del plan en un semestre (HU077)"
              >
                + Semestre (HU077)
              </button>

              <button
                type="button"
                (click)="eliminarSemestreVacio()"
                class="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors inline-flex items-center gap-1"
                title="Eliminar último semestre si no contiene asignaturas (HU078)"
              >
                - Semestre Vacío (HU078)
              </button>

              <app-button variant="primary" size="sm" (clicked)="abrirCrearAsignatura()">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                + Nueva Asignatura (HU079)
              </app-button>
            </div>
          </div>

          <!-- Filtros de Asignaturas -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="sm:col-span-2 relative">
              <input
                type="text"
                [(ngModel)]="searchAsignatura"
                placeholder="Buscar asignatura por nombre, código o área curricular..."
                class="w-full pl-10 pr-4 py-2.5 bg-white border border-warm-200 rounded-xl text-sm text-warm-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 shadow-warm-sm"
              />
              <svg class="w-4 h-4 text-warm-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div>
              <select
                [(ngModel)]="selectedSemestre"
                class="w-full px-3.5 py-2.5 bg-white border border-warm-200 rounded-xl text-sm text-warm-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 shadow-warm-sm"
              >
                <option value="0">Todos los semestres</option>
                @for (sem of semestresDisponibles(); track sem) {
                  <option [value]="sem">Semestre {{ sem }}</option>
                }
              </select>
            </div>
          </div>

          <!-- Malla Curricular en Tarjetas (HU083) -->
          @if (filteredAsignaturas().length === 0) {
            <div class="bg-white rounded-2xl border border-warm-200 p-12 text-center shadow-warm-sm">
              <p class="text-sm text-warm-500">No hay asignaturas registradas para este filtro o semestre.</p>
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              @for (asig of filteredAsignaturas(); track asig.id) {
                <div class="p-4 rounded-2xl bg-white border border-warm-200/90 shadow-warm-sm flex flex-col justify-between gap-3 hover:border-primary-400/80 transition-all">
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-warm-100 text-warm-800">
                        {{ asig.codigo }}
                      </span>
                      <span class="text-xs font-bold text-primary-800 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-200">
                        Semestre {{ asig.semestre }}
                      </span>
                    </div>

                    <h4 class="font-serif font-bold text-base text-warm-900 leading-snug">
                      {{ asig.nombre }}
                    </h4>

                    <div class="text-xs space-y-1 text-warm-600">
                      <p><span class="text-warm-400 font-medium">Área:</span> {{ asig.area }}</p>
                      <p><span class="text-warm-400 font-medium">Componente:</span> {{ asig.componente }}</p>
                      @if (asig.prerrequisitos.length > 0) {
                        <p class="text-amber-800 font-medium">
                          Prerrequisitos: {{ asig.prerrequisitos.join(', ') }}
                        </p>
                      } @else {
                        <p class="text-warm-400 italic">Sin prerrequisitos</p>
                      }
                    </div>
                  </div>

                  <div class="flex items-center justify-between pt-2.5 border-t border-warm-100 text-xs">
                    <div class="flex items-center gap-1.5">
                      <button
                        type="button"
                        (click)="abrirEditarAsignatura(asig)"
                        class="p-1 text-warm-500 hover:text-primary-700 rounded hover:bg-warm-100"
                        title="Modificar asignatura y prerrequisitos (HU080, HU082)"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        (click)="eliminarAsignatura(asig)"
                        class="p-1 text-warm-400 hover:text-red-700 rounded hover:bg-red-50"
                        title="Desvincular del plan (HU081)"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <span class="font-bold text-warm-900 bg-warm-100 px-2 py-0.5 rounded">
                      {{ asig.creditos }} Créditos
                    </span>
                  </div>
                </div>
              }
            </div>
          }
        }

        <!-- 1.4 VISTA: FORMULARIO ASIGNATURA (HU079, HU080, HU082) -->
        @if (subVistaPlan() === 'FORM_ASIGNATURA' && selectedPlan()) {
          <div class="flex items-center justify-between bg-white p-4 rounded-2xl border border-warm-200 shadow-warm-sm">
            <button
              type="button"
              (click)="volverAMalla()"
              class="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-warm-700 hover:text-warm-950 bg-warm-50 hover:bg-warm-100 border border-warm-200 px-3.5 py-2 rounded-xl transition-all shadow-xs"
            >
              <svg class="w-4 h-4 text-warm-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver a Malla Curricular
            </button>

            <span class="text-xs font-bold text-primary-800 bg-primary-50 border border-primary-200 px-3 py-1 rounded-full">
              {{ modoFormAsignatura === 'CREAR' ? 'Nueva Asignatura (HU079)' : 'Modificar Asignatura (HU080)' }}
            </span>
          </div>

          <div class="bg-white p-6 sm:p-8 rounded-2xl border border-warm-200 shadow-warm-sm max-w-2xl mx-auto space-y-6">
            <div>
              <h2 class="font-serif font-bold text-2xl text-warm-900">
                {{ modoFormAsignatura === 'CREAR' ? 'Registro de Asignatura en el Plan' : 'Edición de Asignatura Curricular' }}
              </h2>
              <p class="text-sm text-warm-600 mt-1">
                Define el código, nombre, semestre de ubicación, créditos, horas y prerrequisitos académicos (HU079, HU082).
              </p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <app-form-field label="Código de la Asignatura" [required]="true">
                <input
                  type="text"
                  [(ngModel)]="asigForm.codigo"
                  placeholder="Ej. SIS-301"
                  class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </app-form-field>

              <app-form-field label="Semestre de Ubicación" [required]="true">
                <input
                  type="number"
                  [(ngModel)]="asigForm.semestre"
                  min="1"
                  [max]="selectedPlan()?.totalSemestres || 10"
                  class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </app-form-field>

              <div class="sm:col-span-2">
                <app-form-field label="Nombre de la Asignatura" [required]="true">
                  <input
                    type="text"
                    [(ngModel)]="asigForm.nombre"
                    placeholder="Ej. Bases de Datos Avanzadas"
                    class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </app-form-field>
              </div>

              <app-form-field label="Créditos Académicos" [required]="true">
                <input
                  type="number"
                  [(ngModel)]="asigForm.creditos"
                  min="1"
                  max="10"
                  class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </app-form-field>

              <app-form-field label="Horas Semanales Presenciales" [required]="true">
                <input
                  type="number"
                  [(ngModel)]="asigForm.horasSemanales"
                  min="1"
                  max="20"
                  class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </app-form-field>

              <app-form-field label="Área de Conocimiento">
                <input
                  type="text"
                  [(ngModel)]="asigForm.area"
                  placeholder="Ej. Ingeniería de Software, Hardware"
                  class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </app-form-field>

              <app-form-field label="Componente Curricular">
                <select
                  [(ngModel)]="asigForm.componente"
                  class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="Obligatoria">Obligatoria</option>
                  <option value="Electiva">Electiva</option>
                  <option value="Complementaria">Complementaria</option>
                </select>
              </app-form-field>

              <div class="sm:col-span-2">
                <app-form-field label="Prerrequisitos Académicos (HU082)">
                  <input
                    type="text"
                    [(ngModel)]="asigFormPrerreqTexto"
                    placeholder="Códigos separados por coma (ej. SIS-101, SIS-201)"
                    class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </app-form-field>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 pt-4 border-t border-warm-100">
              <app-button variant="secondary" size="md" (clicked)="volverAMalla()">
                Cancelar
              </app-button>
              <app-button
                variant="primary"
                size="md"
                [disabled]="!asigForm.codigo.trim() || !asigForm.nombre.trim()"
                (clicked)="guardarAsignatura()"
              >
                <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {{ modoFormAsignatura === 'CREAR' ? 'Agregar Asignatura' : 'Guardar Cambios' }}
              </app-button>
            </div>
          </div>
        }
      }

      <!-- ========================================== -->
      <!-- PESTAÑA 2: PERÍODOS ACADÉMICOS (HU096-098) -->
      <!-- ========================================== -->
      @if (pestanaActiva() === 'PERIODOS') {
        <div class="space-y-6">
          <div class="flex items-center justify-between bg-white p-5 rounded-2xl border border-warm-200 shadow-warm-sm">
            <div>
              <h3 class="font-serif font-bold text-lg text-warm-900">Calendario de Períodos Académicos</h3>
              <p class="text-xs text-warm-500">Configuración de ciclos lectivos, fechas límites y activación de períodos (HU096-HU098).</p>
            </div>

            <app-button variant="primary" size="sm" (clicked)="abrirModalCrearPeriodo()">
              <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              + Nuevo Período Académico (HU096)
            </app-button>
          </div>

          <!-- Grid de Períodos -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            @for (periodo of periodos(); track periodo.id) {
              <app-card [hoverable]="true" padding="md">
                <div class="space-y-4">
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-warm-100 text-warm-800">
                        {{ periodo.codigo }}
                      </span>
                      @if (periodo.esActual) {
                        <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-primary-100 text-primary-800">
                          ACTUAL
                        </span>
                      }
                    </div>

                    <app-badge [variant]="periodo.estado === 'ACTIVO' ? 'success' : (periodo.estado === 'PLANEACION' ? 'warning' : 'neutral')">
                      {{ periodo.estado }}
                    </app-badge>
                  </div>

                  <div>
                    <h4 class="font-serif font-bold text-base text-warm-900">{{ periodo.nombre }}</h4>
                  </div>

                  <div class="p-3 rounded-xl bg-warm-50 border border-warm-100 text-xs space-y-1.5">
                    <div class="flex items-center justify-between">
                      <span class="text-warm-500">Fecha de Inicio:</span>
                      <strong class="text-warm-900">{{ periodo.fechaInicio }}</strong>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-warm-500">Fecha de Cierre:</span>
                      <strong class="text-warm-900">{{ periodo.fechaFin }}</strong>
                    </div>
                    <div class="flex items-center justify-between text-amber-800">
                      <span class="font-medium">Límite Registro Notas:</span>
                      <strong>{{ periodo.fechaLimiteNotas }}</strong>
                    </div>
                  </div>

                  <div class="flex items-center justify-between pt-2 border-t border-warm-100 text-xs">
                    <button
                      type="button"
                      (click)="alternarEstadoPeriodo(periodo)"
                      class="font-semibold text-primary-700 hover:text-primary-900"
                      title="Cambiar estado de vigencia del período (HU098)"
                    >
                      Cambiar Estado (HU098)
                    </button>
                    <button
                      type="button"
                      (click)="abrirEditarPeriodo(periodo)"
                      class="text-warm-600 hover:text-warm-950 font-medium"
                      title="Modificar fechas del período (HU097)"
                    >
                      Editar Fechas
                    </button>
                  </div>
                </div>
              </app-card>
            }
          </div>

          <!-- Formulario Inline Período -->
          @if (mostrarModalPeriodo()) {
            <div class="bg-white p-6 rounded-2xl border border-primary-200 shadow-warm-md max-w-xl mx-auto space-y-4">
              <div class="flex items-center justify-between">
                <h4 class="font-serif font-bold text-base text-warm-900">
                  {{ modoFormPeriodo === 'CREAR' ? 'Apertura de Nuevo Período' : 'Modificación de Período' }}
                </h4>
                <button (click)="mostrarModalPeriodo.set(false)" class="text-warm-400 hover:text-warm-700 text-xs font-bold">
                  ✕ Cerrar
                </button>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <app-form-field label="Código del Período" [required]="true">
                  <input
                    type="text"
                    [(ngModel)]="periodoForm.codigo"
                    placeholder="Ej. 2027-1"
                    class="w-full px-3 py-2 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </app-form-field>

                <app-form-field label="Estado del Período" [required]="true">
                  <select
                    [(ngModel)]="periodoForm.estado"
                    class="w-full px-3 py-2 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    <option value="PLANEACION">PLANEACION</option>
                    <option value="ACTIVO">ACTIVO</option>
                    <option value="CERRADO">CERRADO</option>
                  </select>
                </app-form-field>

                <div class="sm:col-span-2">
                  <app-form-field label="Nombre Descriptivo" [required]="true">
                    <input
                      type="text"
                      [(ngModel)]="periodoForm.nombre"
                      placeholder="Ej. Primer Semestre Académico 2027"
                      class="w-full px-3 py-2 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                  </app-form-field>
                </div>

                <app-form-field label="Fecha de Inicio" [required]="true">
                  <input
                    type="date"
                    [(ngModel)]="periodoForm.fechaInicio"
                    class="w-full px-3 py-2 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </app-form-field>

                <app-form-field label="Fecha de Fin" [required]="true">
                  <input
                    type="date"
                    [(ngModel)]="periodoForm.fechaFin"
                    class="w-full px-3 py-2 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                </app-form-field>

                <div class="sm:col-span-2">
                  <app-form-field label="Fecha Límite Cierre de Notas / Asistencias" [required]="true">
                    <input
                      type="date"
                      [(ngModel)]="periodoForm.fechaLimiteNotas"
                      class="w-full px-3 py-2 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                  </app-form-field>
                </div>
              </div>

              <div class="flex items-center justify-end gap-3 pt-2">
                <app-button variant="secondary" size="sm" (clicked)="mostrarModalPeriodo.set(false)">
                  Cancelar
                </app-button>
                <app-button
                  variant="primary"
                  size="sm"
                  [disabled]="!periodoForm.codigo.trim() || !periodoForm.nombre.trim()"
                  (clicked)="guardarPeriodo()"
                >
                  Guardar Período
                </app-button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class CoordinatorStudyPlansComponent implements OnInit {
  private coordService = inject(CoordinatorManagementService);
  private toast = inject(ToastService);

  pestanaActiva = signal<PestanaCurricular>('PLANES');

  // Subvistas Planes
  subVistaPlan = signal<SubVistaPlan>('LISTA');
  planes = signal<PlanEstudioItem[]>([]);
  isLoading = signal<boolean>(true);

  // Formulario Plan
  modoFormPlan: 'CREAR' | 'EDITAR' = 'CREAR';
  selectedPlanId: string | null = null;
  planForm = {
    codigo: '',
    nombre: '',
    anioVigencia: 2026,
    programa: 'Ingeniería de Sistemas',
    facultad: 'Facultad de Ingeniería',
    totalSemestres: 10,
    totalCreditos: 160,
    estado: 'VIGENTE' as 'VIGENTE' | 'EN_TRANSICION' | 'HISTORICO',
    descripcion: '',
  };

  // Malla Curricular
  selectedPlan = signal<PlanEstudioItem | null>(null);
  asignaturas = signal<AsignaturaPlanItem[]>([]);
  searchAsignatura = '';
  selectedSemestre = '0';

  // Formulario Asignatura
  modoFormAsignatura: 'CREAR' | 'EDITAR' = 'CREAR';
  selectedAsigId: string | null = null;
  asigForm = {
    codigo: '',
    nombre: '',
    creditos: 3,
    semestre: 1,
    area: 'Ingeniería de Software',
    componente: 'Obligatoria' as 'Obligatoria' | 'Electiva' | 'Complementaria',
    horasSemanales: 4,
  };
  asigFormPrerreqTexto = '';

  // Períodos Académicos
  periodos = signal<PeriodoAcademicoItem[]>([]);
  mostrarModalPeriodo = signal<boolean>(false);
  modoFormPeriodo: 'CREAR' | 'EDITAR' = 'CREAR';
  selectedPeriodoId: string | null = null;
  periodoForm = {
    codigo: '',
    nombre: '',
    fechaInicio: '2027-02-01',
    fechaFin: '2027-06-20',
    fechaLimiteNotas: '2027-06-25',
    estado: 'PLANEACION' as 'ACTIVO' | 'PLANEACION' | 'CERRADO',
  };

  filteredAsignaturas = computed(() => {
    const query = this.searchAsignatura.toLowerCase().trim();
    const sem = Number(this.selectedSemestre);

    return this.asignaturas().filter((item) => {
      const matchQuery =
        !query ||
        item.nombre.toLowerCase().includes(query) ||
        item.codigo.toLowerCase().includes(query) ||
        item.area.toLowerCase().includes(query);

      const matchSemestre = sem === 0 || item.semestre === sem;

      return matchQuery && matchSemestre;
    });
  });

  semestresDisponibles = computed(() => {
    const total = this.selectedPlan()?.totalSemestres || 10;
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  ngOnInit(): void {
    this.cargarPlanes();
    this.cargarPeriodos();
  }

  cambiarPestana(p: PestanaCurricular): void {
    this.pestanaActiva.set(p);
  }

  // --- PLANES DE ESTUDIO (HU074, HU075, HU076) ---
  cargarPlanes(): void {
    this.isLoading.set(true);
    this.coordService.getPlanesEstudio().subscribe({
      next: (res) => {
        this.planes.set(res.datos || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toast.error('Error al cargar planes de estudio.');
      },
    });
  }

  abrirCrearPlan(): void {
    this.modoFormPlan = 'CREAR';
    this.selectedPlanId = null;
    this.planForm = {
      codigo: `PLAN-SIS-${new Date().getFullYear() + 1}`,
      nombre: `Plan de Estudio Ingeniería de Sistemas ${new Date().getFullYear() + 1}`,
      anioVigencia: new Date().getFullYear() + 1,
      programa: 'Ingeniería de Sistemas',
      facultad: 'Facultad de Ingeniería',
      totalSemestres: 10,
      totalCreditos: 160,
      estado: 'VIGENTE',
      descripcion: 'Enfoque en desarrollo de software, computación en la nube y analítica.',
    };
    this.subVistaPlan.set('FORM_PLAN');
  }

  abrirEditarPlan(plan: PlanEstudioItem): void {
    this.modoFormPlan = 'EDITAR';
    this.selectedPlanId = plan.id;
    this.planForm = {
      codigo: plan.codigo,
      nombre: plan.nombre,
      anioVigencia: plan.anioVigencia,
      programa: plan.programa,
      facultad: plan.facultad,
      totalSemestres: plan.totalSemestres,
      totalCreditos: plan.totalCreditos,
      estado: plan.estado,
      descripcion: plan.descripcion,
    };
    this.subVistaPlan.set('FORM_PLAN');
  }

  guardarPlan(): void {
    if (this.modoFormPlan === 'CREAR') {
      this.coordService
        .crearPlanEstudio({
          ...this.planForm,
        })
        .subscribe({
          next: (res) => {
            if (res.exitoso) {
              this.toast.success(res.mensajeUsuario || 'Plan de estudio creado con éxito.');
              this.cargarPlanes();
              this.volverAListaPlanes();
            }
          },
          error: () => this.toast.error('Error al crear plan de estudio.'),
        });
    } else if (this.selectedPlanId) {
      this.coordService
        .actualizarPlanEstudio(this.selectedPlanId, {
          ...this.planForm,
        })
        .subscribe({
          next: (res) => {
            if (res.exitoso) {
              this.toast.success(res.mensajeUsuario || 'Plan de estudio actualizado.');
              this.cargarPlanes();
              this.volverAListaPlanes();
            }
          },
          error: () => this.toast.error('Error al actualizar plan de estudio.'),
        });
    }
  }

  volverAListaPlanes(): void {
    this.subVistaPlan.set('LISTA');
    this.selectedPlan.set(null);
  }

  // --- MALLA CURRICULAR Y ASIGNATURAS (HU077-HU083) ---
  verMallaCurricular(plan: PlanEstudioItem): void {
    this.selectedPlan.set(plan);
    this.subVistaPlan.set('MALLA');
    this.cargarAsignaturas(plan.id);
  }

  cargarAsignaturas(planId: string): void {
    this.coordService.getAsignaturasPorPlan(planId).subscribe({
      next: (res) => this.asignaturas.set(res.datos || []),
      error: () => this.toast.error('Error al cargar asignaturas del plan.'),
    });
  }

  agregarSemestre(): void {
    const plan = this.selectedPlan();
    if (!plan) return;
    const nuevoTotal = plan.totalSemestres + 1;
    this.coordService.actualizarPlanEstudio(plan.id, { totalSemestres: nuevoTotal }).subscribe({
      next: (res) => {
        if (res.exitoso) {
          this.toast.success(`Semestre ${nuevoTotal} agregado al plan.`);
          this.selectedPlan.set({ ...plan, totalSemestres: nuevoTotal });
          this.cargarPlanes();
        }
      },
    });
  }

  eliminarSemestreVacio(): void {
    const plan = this.selectedPlan();
    if (!plan || plan.totalSemestres <= 1) return;
    const ultimoSem = plan.totalSemestres;
    const tieneAsignaturas = this.asignaturas().some((a) => a.semestre === ultimoSem);

    if (tieneAsignaturas) {
      this.toast.error(`El semestre ${ultimoSem} tiene asignaturas asignadas. Reubícalas o elimínalas primero.`);
      return;
    }

    const nuevoTotal = ultimoSem - 1;
    this.coordService.actualizarPlanEstudio(plan.id, { totalSemestres: nuevoTotal }).subscribe({
      next: (res) => {
        if (res.exitoso) {
          this.toast.success(`Semestre ${ultimoSem} vacío eliminado.`);
          this.selectedPlan.set({ ...plan, totalSemestres: nuevoTotal });
          this.cargarPlanes();
        }
      },
    });
  }

  abrirCrearAsignatura(): void {
    this.modoFormAsignatura = 'CREAR';
    this.selectedAsigId = null;
    this.asigForm = {
      codigo: '',
      nombre: '',
      creditos: 3,
      semestre: 1,
      area: 'Ingeniería de Software',
      componente: 'Obligatoria',
      horasSemanales: 4,
    };
    this.asigFormPrerreqTexto = '';
    this.subVistaPlan.set('FORM_ASIGNATURA');
  }

  abrirEditarAsignatura(asig: AsignaturaPlanItem): void {
    this.modoFormAsignatura = 'EDITAR';
    this.selectedAsigId = asig.id;
    this.asigForm = {
      codigo: asig.codigo,
      nombre: asig.nombre,
      creditos: asig.creditos,
      semestre: asig.semestre,
      area: asig.area,
      componente: asig.componente,
      horasSemanales: asig.horasSemanales,
    };
    this.asigFormPrerreqTexto = asig.prerrequisitos.join(', ');
    this.subVistaPlan.set('FORM_ASIGNATURA');
  }

  guardarAsignatura(): void {
    const plan = this.selectedPlan();
    if (!plan) return;

    const prerreqs = this.asigFormPrerreqTexto
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (this.modoFormAsignatura === 'CREAR') {
      this.coordService
        .crearAsignaturaPlan(plan.id, {
          ...this.asigForm,
          prerrequisitos: prerreqs,
        })
        .subscribe({
          next: (res) => {
            if (res.exitoso) {
              this.toast.success(res.mensajeUsuario || 'Asignatura registrada en el plan.');
              this.cargarAsignaturas(plan.id);
              this.cargarPlanes();
              this.volverAMalla();
            }
          },
          error: () => this.toast.error('Error al registrar asignatura.'),
        });
    } else if (this.selectedAsigId) {
      this.coordService
        .actualizarAsignaturaPlan(plan.id, this.selectedAsigId, {
          ...this.asigForm,
          prerrequisitos: prerreqs,
        })
        .subscribe({
          next: (res) => {
            if (res.exitoso) {
              this.toast.success(res.mensajeUsuario || 'Asignatura modificada.');
              this.cargarAsignaturas(plan.id);
              this.volverAMalla();
            }
          },
          error: () => this.toast.error('Error al actualizar asignatura.'),
        });
    }
  }

  eliminarAsignatura(asig: AsignaturaPlanItem): void {
    const plan = this.selectedPlan();
    if (!plan) return;

    if (confirm(`¿Estás seguro de que deseas desvincular la asignatura ${asig.nombre} (${asig.codigo})?`)) {
      this.coordService.eliminarAsignaturaPlan(plan.id, asig.id).subscribe({
        next: (res) => {
          if (res.exitoso) {
            this.toast.success(res.mensajeUsuario || 'Asignatura eliminada.');
            this.cargarAsignaturas(plan.id);
            this.cargarPlanes();
          }
        },
        error: () => this.toast.error('Error al eliminar asignatura.'),
      });
    }
  }

  volverAMalla(): void {
    this.subVistaPlan.set('MALLA');
  }

  // --- PERÍODOS ACADÉMICOS (HU096-HU098) ---
  cargarPeriodos(): void {
    this.coordService.getPeriodosAcademicos().subscribe({
      next: (res) => this.periodos.set(res.datos || []),
    });
  }

  abrirModalCrearPeriodo(): void {
    this.modoFormPeriodo = 'CREAR';
    this.selectedPeriodoId = null;
    this.periodoForm = {
      codigo: '2027-1',
      nombre: 'Primer Semestre Académico 2027',
      fechaInicio: '2027-02-01',
      fechaFin: '2027-06-20',
      fechaLimiteNotas: '2027-06-25',
      estado: 'PLANEACION',
    };
    this.mostrarModalPeriodo.set(true);
  }

  abrirEditarPeriodo(periodo: PeriodoAcademicoItem): void {
    this.modoFormPeriodo = 'EDITAR';
    this.selectedPeriodoId = periodo.id;
    this.periodoForm = {
      codigo: periodo.codigo,
      nombre: periodo.nombre,
      fechaInicio: periodo.fechaInicio,
      fechaFin: periodo.fechaFin,
      fechaLimiteNotas: periodo.fechaLimiteNotas,
      estado: periodo.estado,
    };
    this.mostrarModalPeriodo.set(true);
  }

  guardarPeriodo(): void {
    if (this.modoFormPeriodo === 'CREAR') {
      this.coordService.crearPeriodoAcademico(this.periodoForm).subscribe({
        next: (res) => {
          if (res.exitoso) {
            this.toast.success(res.mensajeUsuario || 'Período académico creado.');
            this.mostrarModalPeriodo.set(false);
            this.cargarPeriodos();
          }
        },
        error: () => this.toast.error('Error al crear período académico.'),
      });
    } else if (this.selectedPeriodoId) {
      this.coordService.actualizarPeriodoAcademico(this.selectedPeriodoId, this.periodoForm).subscribe({
        next: (res) => {
          if (res.exitoso) {
            this.toast.success(res.mensajeUsuario || 'Período académico actualizado.');
            this.mostrarModalPeriodo.set(false);
            this.cargarPeriodos();
          }
        },
        error: () => this.toast.error('Error al actualizar período académico.'),
      });
    }
  }

  alternarEstadoPeriodo(periodo: PeriodoAcademicoItem): void {
    const nuevoEstado = periodo.estado === 'ACTIVO' ? 'CERRADO' : (periodo.estado === 'PLANEACION' ? 'ACTIVO' : 'PLANEACION');
    this.coordService.actualizarPeriodoAcademico(periodo.id, { estado: nuevoEstado }).subscribe({
      next: (res) => {
        if (res.exitoso) {
          this.toast.success(`Período ${periodo.codigo} actualizado a ${nuevoEstado}.`);
          this.cargarPeriodos();
        }
      },
    });
  }

  getPlanBadgeVariant(estado: PlanEstudioItem['estado']): BadgeVariant {
    switch (estado) {
      case 'VIGENTE':
        return 'success';
      case 'EN_TRANSICION':
        return 'warning';
      case 'HISTORICO':
        return 'neutral';
      default:
        return 'neutral';
    }
  }
}
