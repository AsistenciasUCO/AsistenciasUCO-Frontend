import { Component, ChangeDetectionStrategy, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  FacultadItem,
  PlanEstudioItem,
  AsignaturaPlanItem,
} from '../../../../core/models/role-management.model';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-catalog-facultades',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, PaginationComponent],
  template: `
    <div class="space-y-6">
      @if (vista() === 'LISTA') {
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <!-- SEARCH BAR -->
          <div class="relative flex-1">
            <input
              type="text"
              [ngModel]="filtroTexto()"
              (ngModelChange)="filtroTexto.set($event)"
              placeholder="Buscar facultad por código, nombre o decano..."
              class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700/20 focus:border-primary-700 bg-white"
            />
            <svg class="w-4 h-4 text-warm-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <button
            type="button"
            (click)="abrirFormularioCrear()"
            class="px-4 py-2.5 bg-primary-700 text-white rounded-xl text-sm font-semibold hover:bg-primary-800 shadow-sm transition-all flex items-center gap-2 shrink-0"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Nueva Facultad</span>
          </button>
        </div>

        @if (pagedFacultades().length === 0) {
          <div class="bg-white rounded-2xl border border-warm-200 p-12 text-center shadow-warm-sm">
            <p class="text-sm text-warm-500">No se encontraron facultades con los criterios de búsqueda.</p>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            @for (fac of pagedFacultades(); track fac.id) {
              <div class="bg-white border border-warm-200 rounded-2xl p-5 shadow-warm-sm hover:shadow-warm-md transition-all flex flex-col justify-between h-full">
                <div>
                  <div class="flex items-start justify-between gap-3 mb-3">
                    <span class="text-xs font-bold px-2.5 py-1 rounded-md bg-warm-100 text-warm-800 border border-warm-200 font-mono">
                      {{ fac.codigo }}
                    </span>
                    <span
                      class="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                      [class]="fac.estado === 'ACTIVO' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'"
                    >
                      {{ fac.estado }}
                    </span>
                  </div>

                  <h3 class="font-bold text-warm-900 text-base mb-1">{{ fac.nombre }}</h3>
                  <p class="text-xs text-warm-600 mb-4">
                    <span class="text-warm-400">Decano(a):</span> {{ fac.decanoNombre || 'No asignado' }}
                  </p>

                  <div class="grid grid-cols-2 gap-3 py-3 border-y border-warm-100 mb-4 bg-warm-50/50 rounded-xl px-3">
                    <div>
                      <span class="text-[10px] text-warm-500 font-semibold uppercase block">Programas</span>
                      <span class="text-sm font-bold text-warm-900">{{ fac.totalProgramas || 4 }}</span>
                    </div>
                    <div>
                      <span class="text-[10px] text-warm-500 font-semibold uppercase block">Estudiantes</span>
                      <span class="text-sm font-bold text-warm-900">{{ fac.totalEstudiantes || 320 }}</span>
                    </div>
                  </div>
                </div>

                <div class="flex flex-col gap-2 pt-2">
                  <button
                    type="button"
                    (click)="verProgramasFacultad(fac)"
                    class="w-full py-2 px-3 bg-primary-50 hover:bg-primary-100 text-primary-900 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <svg class="w-3.5 h-3.5 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span>Ver Programas y Planes (HU108)</span>
                  </button>

                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      (click)="editarFacultad(fac)"
                      class="flex-1 py-2 px-3 bg-warm-100 hover:bg-warm-200 text-warm-800 rounded-xl text-xs font-semibold transition-colors text-center"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      (click)="toggle.emit(fac)"
                      class="p-2 text-warm-500 hover:text-warm-800 hover:bg-warm-100 rounded-xl transition-colors"
                      [title]="fac.estado === 'ACTIVO' ? 'Desactivar Facultad' : 'Activar Facultad'"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>

          @if (facultadesFiltradas().length > pageSize()) {
            <div class="mt-6 flex justify-center">
              <app-pagination
                [currentPage]="currentPage()"
                [totalItems]="facultadesFiltradas().length"
                [pageSize]="pageSize()"
                (pageChange)="currentPage.set($event)"
              />
            </div>
          }
        }
      }

      <!-- FORMULARIO FACULTAD -->
      @if (vista() === 'FORM') {
        <div class="bg-white border border-warm-200 rounded-2xl p-6 shadow-warm-sm max-w-xl mx-auto">
          <div class="flex items-center justify-between pb-4 border-b border-warm-100 mb-6">
            <div>
              <h2 class="text-lg font-serif font-bold text-warm-900">
                {{ facultadEnEdicion ? 'Editar Facultad' : 'Crear Nueva Facultad' }}
              </h2>
              <p class="text-xs text-warm-600">Estructura organizacional y decanaturas.</p>
            </div>
            <button
              type="button"
              (click)="vista.set('LISTA')"
              class="px-3.5 py-1.5 rounded-xl border border-warm-200 text-xs font-semibold text-warm-700 hover:bg-warm-100 transition-colors flex items-center gap-1.5"
            >
              ← Volver
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-warm-700 uppercase mb-1">Código de Facultad</label>
              <input
                type="text"
                [(ngModel)]="formFacultad.codigo"
                placeholder="Ej: FAC-SALUD"
                class="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-sm focus:ring-2 focus:ring-primary-700/20 focus:border-primary-700"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-warm-700 uppercase mb-1">Nombre de la Facultad</label>
              <input
                type="text"
                [(ngModel)]="formFacultad.nombre"
                placeholder="Ej: Facultad de Ciencias de la Salud"
                class="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-sm focus:ring-2 focus:ring-primary-700/20 focus:border-primary-700"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-warm-700 uppercase mb-1">Decano Encargado</label>
              <input
                type="text"
                [(ngModel)]="formFacultad.decanoNombre"
                placeholder="Nombre del decano designado"
                class="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-sm focus:ring-2 focus:ring-primary-700/20 focus:border-primary-700"
              />
            </div>

            <div class="flex items-center justify-end gap-3 pt-4 border-t border-warm-100">
              <button
                type="button"
                (click)="vista.set('LISTA')"
                class="px-4 py-2 text-xs font-semibold text-warm-600 hover:text-warm-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                [disabled]="!formFacultad.codigo.trim() || !formFacultad.nombre.trim()"
                (click)="guardar()"
                class="px-5 py-2.5 bg-primary-700 hover:bg-primary-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                Guardar Facultad
              </button>
            </div>
          </div>
        </div>
      }

      <!-- MODAL: PROGRAMAS ACADÉMICOS Y PLANES DE ESTUDIO (HU107, HU108, HU112, HU119) -->
      @if (facultadSeleccionada()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-warm-950/40 backdrop-blur-xs animate-fade-in">
          <div class="bg-white border border-warm-200 rounded-3xl max-w-3xl w-full shadow-warm-xl overflow-hidden animate-slide-down">
            <div class="p-6 bg-warm-50 border-b border-warm-200/80 flex items-start justify-between">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-primary-100 text-primary-900 border border-primary-200">
                    {{ facultadSeleccionada()?.codigo }}
                  </span>
                  <span class="text-xs font-semibold text-warm-500">Programas Académicos Oficiales</span>
                </div>
                <h3 class="font-serif font-bold text-xl text-warm-900">{{ facultadSeleccionada()?.nombre }}</h3>
              </div>
              <button
                type="button"
                (click)="cerrarModalFacultad()"
                class="p-2 text-warm-400 hover:text-warm-700 rounded-full hover:bg-warm-200/60 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="p-6 max-h-[70vh] overflow-y-auto space-y-6">
              @if (!planVisualizado()) {
                <div class="space-y-4">
                  <p class="text-xs text-warm-600">
                    Selecciona un programa para explorar su malla curricular y asignaturas vigentes:
                  </p>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    @for (prog of obtenerProgramasDeFacultad(facultadSeleccionada()!); track prog.codigo) {
                      <div class="border border-warm-200 rounded-2xl p-4 bg-warm-50/40 hover:bg-warm-50 hover:border-primary-300 transition-all flex flex-col justify-between">
                        <div>
                          <div class="flex items-center justify-between mb-2">
                            <span class="font-mono text-xs font-bold text-primary-800 bg-white px-2 py-0.5 rounded border border-warm-200">
                              {{ prog.codigo }}
                            </span>
                            <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {{ prog.nivel }}
                            </span>
                          </div>
                          <h4 class="font-bold text-warm-900 text-sm mb-1">{{ prog.nombre }}</h4>
                          <p class="text-xs text-warm-500 mb-3">{{ prog.modalidad }} • {{ prog.totalSemestres }} Semestres</p>
                          <div class="text-[11px] text-warm-600 space-y-0.5 mb-4">
                            <div>Créditos Totales: <strong class="text-warm-800">{{ prog.totalCreditos }}</strong></div>
                            <div>Asignaturas: <strong class="text-warm-800">{{ prog.totalAsignaturas }}</strong></div>
                          </div>
                        </div>
                        <button
                          type="button"
                          (click)="verPlanEstudio(prog)"
                          class="w-full py-2 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                        >
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                          </svg>
                          <span>Malla Curricular</span>
                        </button>
                      </div>
                    }
                  </div>
                </div>
              } @else {
                <div class="space-y-4 animate-fade-in">
                  <div class="flex items-center justify-between pb-3 border-b border-warm-200">
                    <div>
                      <span class="text-xs font-bold text-primary-700 uppercase tracking-wider block">Plan de Estudios</span>
                      <h4 class="font-serif font-bold text-lg text-warm-900">{{ planVisualizado()?.nombre }}</h4>
                      <p class="text-xs text-warm-500">{{ planVisualizado()?.programa }} • Código: {{ planVisualizado()?.codigo }}</p>
                    </div>
                    <button
                      type="button"
                      (click)="planVisualizado.set(null)"
                      class="px-3 py-1.5 rounded-xl border border-warm-200 text-xs font-semibold text-warm-700 hover:bg-warm-100 transition-colors"
                    >
                      ← Volver a Programas
                    </button>
                  </div>

                  <div class="overflow-x-auto border border-warm-200 rounded-2xl">
                    <table class="w-full text-left text-xs">
                      <thead class="bg-warm-50 border-b border-warm-200 font-bold text-warm-600 uppercase">
                        <tr>
                          <th class="px-4 py-3">Código</th>
                          <th class="px-4 py-3">Asignatura</th>
                          <th class="px-4 py-3 text-center">Semestre</th>
                          <th class="px-4 py-3 text-center">Créditos</th>
                          <th class="px-4 py-3">Prerrequisitos</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-warm-100">
                        @for (asig of asignaturasPlan(); track asig.id) {
                          <tr class="hover:bg-warm-50/60 transition-colors">
                            <td class="px-4 py-2.5 font-mono font-bold text-primary-800">{{ asig.codigo }}</td>
                            <td class="px-4 py-2.5 font-semibold text-warm-900">{{ asig.nombre }}</td>
                            <td class="px-4 py-2.5 text-center">{{ asig.semestre }}°</td>
                            <td class="px-4 py-2.5 text-center font-bold text-warm-800">{{ asig.creditos }}</td>
                            <td class="px-4 py-2.5 text-warm-600">
                              {{ asig.prerrequisitos.length > 0 ? asig.prerrequisitos.join(', ') : 'Ninguno' }}
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              }
            </div>

            <div class="p-4 bg-warm-50 border-t border-warm-200/80 flex justify-end">
              <button
                type="button"
                (click)="cerrarModalFacultad()"
                class="px-5 py-2 bg-warm-200 hover:bg-warm-300 text-warm-800 rounded-xl text-xs font-semibold transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class CatalogFacultadesComponent {
  facultades = input.required<FacultadItem[]>();
  planes = input.required<PlanEstudioItem[]>();
  getAsignaturasPlan = input.required<(planId: string) => AsignaturaPlanItem[]>();

  save = output<{ id?: string; datos: any }>();
  toggle = output<FacultadItem>();

  vista = signal<'LISTA' | 'FORM'>('LISTA');
  filtroTexto = signal('');
  currentPage = signal(1);
  pageSize = signal(6);

  facultadEnEdicion: FacultadItem | null = null;
  formFacultad = {
    codigo: '',
    nombre: '',
    decanoNombre: '',
    estado: 'ACTIVO' as 'ACTIVO' | 'INACTIVO',
  };

  facultadSeleccionada = signal<FacultadItem | null>(null);
  planVisualizado = signal<PlanEstudioItem | null>(null);
  asignaturasPlan = signal<AsignaturaPlanItem[]>([]);

  facultadesFiltradas = computed(() => {
    const q = this.filtroTexto().toLowerCase().trim();
    if (!q) return this.facultades();
    return this.facultades().filter(
      (f) =>
        f.codigo.toLowerCase().includes(q) ||
        f.nombre.toLowerCase().includes(q) ||
        (f.decanoNombre && f.decanoNombre.toLowerCase().includes(q))
    );
  });

  pagedFacultades = computed(() => {
    const list = this.facultadesFiltradas();
    const start = (this.currentPage() - 1) * this.pageSize();
    return list.slice(start, start + this.pageSize());
  });

  abrirFormularioCrear(): void {
    this.facultadEnEdicion = null;
    this.formFacultad = {
      codigo: '',
      nombre: '',
      decanoNombre: '',
      estado: 'ACTIVO',
    };
    this.vista.set('FORM');
  }

  editarFacultad(fac: FacultadItem): void {
    this.facultadEnEdicion = fac;
    this.formFacultad = {
      codigo: fac.codigo,
      nombre: fac.nombre,
      decanoNombre: fac.decanoNombre || '',
      estado: fac.estado,
    };
    this.vista.set('FORM');
  }

  guardar(): void {
    this.save.emit({
      id: this.facultadEnEdicion?.id,
      datos: { ...this.formFacultad },
    });
    this.vista.set('LISTA');
  }

  verProgramasFacultad(fac: FacultadItem): void {
    this.facultadSeleccionada.set(fac);
    this.planVisualizado.set(null);
  }

  cerrarModalFacultad(): void {
    this.facultadSeleccionada.set(null);
    this.planVisualizado.set(null);
  }

  verPlanEstudio(prog: any): void {
    const planes = this.planes();
    const plan = planes.find((p: PlanEstudioItem) => p.id === prog.planEstudioId) || planes[0];
    this.planVisualizado.set(plan || null);
    if (plan) {
      this.asignaturasPlan.set(this.getAsignaturasPlan()(plan.id));
    } else {
      this.asignaturasPlan.set([]);
    }
  }

  obtenerProgramasDeFacultad(fac: FacultadItem): any[] {
    return [
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
        planEstudioNombre: 'Plan Curricular 2024 (Acreditación de Alta Calidad)',
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
        planEstudioNombre: 'Plan Curricular 2020 (Sostenibilidad)',
      },
    ];
  }
}
