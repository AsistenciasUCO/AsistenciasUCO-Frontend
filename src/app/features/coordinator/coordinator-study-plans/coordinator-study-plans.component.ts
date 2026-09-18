import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoordinatorManagementService } from '../../../core/services/coordinator-management.service';
import {
  PlanEstudioItem,
  AsignaturaPlanItem,
  PeriodoAcademicoItem,
} from '../../../core/models/role-management.model';
import { ToastService } from '../../../shared/components/toast/toast.component';
import { getApiErrorMessage } from '../../../core/api/errors/api-error.util';
import { StudyPlansListComponent } from './components/study-plans-list.component';
import { StudyPlanFormComponent } from './components/study-plan-form.component';
import { StudyPlanMeshComponent } from './components/study-plan-mesh.component';
import { SubjectFormComponent } from './components/subject-form.component';
import { AcademicPeriodsTabComponent } from './components/academic-periods-tab.component';

type PestanaCurricular = 'PLANES' | 'PERIODOS';
type SubVistaPlan = 'LISTA' | 'FORM_PLAN' | 'MALLA' | 'FORM_ASIGNATURA';

@Component({
  selector: 'app-coordinator-study-plans',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    StudyPlansListComponent,
    StudyPlanFormComponent,
    StudyPlanMeshComponent,
    SubjectFormComponent,
    AcademicPeriodsTabComponent,
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
          Planes de Estudio & Malla
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
          Períodos Académicos
        </button>
      </div>

      <!-- PESTAÑA 1: PLANES DE ESTUDIO & MALLA -->
      @if (pestanaActiva() === 'PLANES') {
        @if (subVistaPlan() === 'LISTA') {
          <app-study-plans-list
            [planes]="planes()"
            (createPlan)="abrirCrearPlan()"
            (editPlan)="abrirEditarPlan($event)"
            (toggleEstado)="toggleEstadoPlan($event)"
            (viewMalla)="verMallaCurricular($event)"
          />
        }

        @if (subVistaPlan() === 'FORM_PLAN') {
          <app-study-plan-form
            [modo]="modoFormPlan"
            [plan]="selectedPlan()"
            (save)="guardarPlan($event)"
            (cancel)="subVistaPlan.set('LISTA')"
          />
        }

        @if (subVistaPlan() === 'MALLA' && selectedPlan()) {
          <app-study-plan-mesh
            [plan]="selectedPlan()!"
            [asignaturas]="asignaturas()"
            (back)="subVistaPlan.set('LISTA')"
            (addSemester)="agregarSemestre()"
            (removeSemester)="eliminarSemestreVacio()"
            (createSubject)="abrirCrearAsignatura()"
            (editSubject)="abrirEditarAsignatura($event)"
            (deleteSubject)="eliminarAsignatura($event)"
          />
        }

        @if (subVistaPlan() === 'FORM_ASIGNATURA' && selectedPlan()) {
          <app-subject-form
            [plan]="selectedPlan()!"
            [modo]="modoFormAsignatura"
            [asignatura]="selectedAsignatura()"
            [asignaturasPlan]="asignaturas()"
            (save)="guardarAsignatura($event)"
            (cancel)="subVistaPlan.set('MALLA')"
          />
        }
      }

      <!-- PESTAÑA 2: PERÍODOS ACADÉMICOS -->
      @if (pestanaActiva() === 'PERIODOS') {
        <app-academic-periods-tab
          [periodos]="periodos()"
          (savePeriodo)="guardarPeriodo($event)"
          (togglePeriodo)="alternarEstadoPeriodo($event)"
        />
      }
    </div>
  `,
})
export class CoordinatorStudyPlansComponent implements OnInit {
  private coordService = inject(CoordinatorManagementService);
  private toast = inject(ToastService);

  pestanaActiva = signal<PestanaCurricular>('PLANES');
  subVistaPlan = signal<SubVistaPlan>('LISTA');

  planes = signal<PlanEstudioItem[]>([]);
  periodos = signal<PeriodoAcademicoItem[]>([]);
  asignaturas = signal<AsignaturaPlanItem[]>([]);

  selectedPlan = signal<PlanEstudioItem | null>(null);
  selectedAsignatura = signal<AsignaturaPlanItem | null>(null);

  modoFormPlan: 'CREAR' | 'EDITAR' = 'CREAR';
  modoFormAsignatura: 'CREAR' | 'EDITAR' = 'CREAR';

  ngOnInit(): void {
    this.cargarPlanes();
    this.cargarPeriodos();
  }

  cambiarPestana(pestana: PestanaCurricular): void {
    this.pestanaActiva.set(pestana);
    if (pestana === 'PLANES') {
      this.subVistaPlan.set('LISTA');
    }
  }

  cargarPlanes(): void {
    this.coordService.getPlanesEstudio().subscribe({
      next: (res) => this.planes.set(res.datos || []),
      error: (err) => this.toast.error(getApiErrorMessage(err)),
    });
  }

  cargarPeriodos(): void {
    this.coordService.getPeriodosAcademicos().subscribe({
      next: (res) => this.periodos.set(res.datos || []),
      error: (err) => this.toast.error(getApiErrorMessage(err)),
    });
  }

  cargarAsignaturas(planId: string): void {
    this.coordService.getAsignaturasPorPlan(planId).subscribe({
      next: (res) => this.asignaturas.set(res.datos || []),
      error: (err) => this.toast.error(getApiErrorMessage(err)),
    });
  }

  abrirCrearPlan(): void {
    this.modoFormPlan = 'CREAR';
    this.selectedPlan.set(null);
    this.subVistaPlan.set('FORM_PLAN');
  }

  abrirEditarPlan(plan: PlanEstudioItem): void {
    this.modoFormPlan = 'EDITAR';
    this.selectedPlan.set(plan);
    this.subVistaPlan.set('FORM_PLAN');
  }

  guardarPlan(datos: Partial<PlanEstudioItem>): void {
    if (this.modoFormPlan === 'CREAR') {
      this.coordService.crearPlanEstudio(datos).subscribe({
        next: (res) => {
          if (res.exitoso) {
            this.toast.success(res.mensajeUsuario || 'Plan de estudio registrado.');
            this.cargarPlanes();
            this.subVistaPlan.set('LISTA');
          }
        },
        error: (err) => this.toast.error(getApiErrorMessage(err)),
      });
    } else if (this.selectedPlan()) {
      this.coordService.actualizarPlanEstudio(this.selectedPlan()!.id, datos).subscribe({
        next: (res) => {
          if (res.exitoso) {
            this.toast.success(res.mensajeUsuario || 'Plan de estudio modificado.');
            this.cargarPlanes();
            this.subVistaPlan.set('LISTA');
          }
        },
        error: (err) => this.toast.error(getApiErrorMessage(err)),
      });
    }
  }

  toggleEstadoPlan(plan: PlanEstudioItem): void {
    this.coordService.toggleEstadoPlanEstudio(plan.id).subscribe({
      next: (res) => {
        if (res.exitoso) {
          this.toast.success(res.mensajeUsuario || 'Estado del plan de estudio actualizado.');
          this.cargarPlanes();
        }
      },
      error: (err) => this.toast.error(getApiErrorMessage(err)),
    });
  }

  verMallaCurricular(plan: PlanEstudioItem): void {
    this.selectedPlan.set(plan);
    this.subVistaPlan.set('MALLA');
    this.cargarAsignaturas(plan.id);
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
      error: (err) => this.toast.error(getApiErrorMessage(err)),
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
      error: (err) => this.toast.error(getApiErrorMessage(err)),
    });
  }

  abrirCrearAsignatura(): void {
    this.modoFormAsignatura = 'CREAR';
    this.selectedAsignatura.set(null);
    this.subVistaPlan.set('FORM_ASIGNATURA');
  }

  abrirEditarAsignatura(asig: AsignaturaPlanItem): void {
    this.modoFormAsignatura = 'EDITAR';
    this.selectedAsignatura.set(asig);
    this.subVistaPlan.set('FORM_ASIGNATURA');
  }

  guardarAsignatura(event: { datos: Partial<AsignaturaPlanItem>; id?: string }): void {
    const plan = this.selectedPlan();
    if (!plan) return;

    if (this.modoFormAsignatura === 'CREAR') {
      this.coordService.crearAsignaturaPlan(plan.id, event.datos).subscribe({
        next: (res) => {
          if (res.exitoso) {
            this.toast.success(res.mensajeUsuario || 'Asignatura registrada en el plan.');
            this.cargarAsignaturas(plan.id);
            this.cargarPlanes();
            this.subVistaPlan.set('MALLA');
          }
        },
        error: (err) => this.toast.error(getApiErrorMessage(err)),
      });
    } else if (event.id) {
      this.coordService.actualizarAsignaturaPlan(plan.id, event.id, event.datos).subscribe({
        next: (res) => {
          if (res.exitoso) {
            this.toast.success(res.mensajeUsuario || 'Asignatura modificada.');
            this.cargarAsignaturas(plan.id);
            this.subVistaPlan.set('MALLA');
          }
        },
        error: (err) => this.toast.error(getApiErrorMessage(err)),
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
        error: (err) => this.toast.error(getApiErrorMessage(err)),
      });
    }
  }

  guardarPeriodo(event: { modo: 'CREAR' | 'EDITAR'; id?: string; datos: any }): void {
    if (event.modo === 'CREAR') {
      this.coordService.crearPeriodoAcademico(event.datos).subscribe({
        next: (res) => {
          if (res.exitoso) {
            this.toast.success(res.mensajeUsuario || 'Período académico creado.');
            this.cargarPeriodos();
          }
        },
        error: (err) => this.toast.error(getApiErrorMessage(err)),
      });
    } else if (event.id) {
      this.coordService.actualizarPeriodoAcademico(event.id, event.datos).subscribe({
        next: (res) => {
          if (res.exitoso) {
            this.toast.success(res.mensajeUsuario || 'Período académico actualizado.');
            this.cargarPeriodos();
          }
        },
        error: (err) => this.toast.error(getApiErrorMessage(err)),
      });
    }
  }

  alternarEstadoPeriodo(periodo: PeriodoAcademicoItem): void {
    this.coordService.toggleEstadoPeriodoAcademico(periodo.id).subscribe({
      next: (res) => {
        if (res.exitoso) {
          const nuevo = res.datos?.estado || (periodo.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO');
          this.toast.success(res.mensajeUsuario || `Período ${periodo.codigo} actualizado a ${nuevo}.`);
          this.cargarPeriodos();
        }
      },
      error: () => {
        const nuevoEstado = periodo.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
        this.coordService.actualizarPeriodoAcademico(periodo.id, { estado: nuevoEstado as any }).subscribe({
          next: (res) => {
            if (res.exitoso) {
              this.toast.success(`Período ${periodo.codigo} actualizado a ${nuevoEstado}.`);
              this.cargarPeriodos();
            }
          },
          error: (err) => this.toast.error(getApiErrorMessage(err)),
        });
      },
    });
  }
}
