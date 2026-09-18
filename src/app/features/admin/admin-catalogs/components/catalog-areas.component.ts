import { Component, ChangeDetectionStrategy, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AreaConocimientoItem, FacultadItem } from '../../../../core/models/role-management.model';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-catalog-areas',
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
              placeholder="Buscar área por código, nombre o facultad..."
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
            <span>Nueva Área de Conocimiento</span>
          </button>
        </div>

        @if (pagedAreas().length === 0) {
          <div class="bg-white rounded-2xl border border-warm-200 p-12 text-center shadow-warm-sm">
            <p class="text-sm text-warm-500">No se encontraron áreas de conocimiento con los criterios de búsqueda.</p>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            @for (area of pagedAreas(); track area.id) {
              <div class="bg-white border border-warm-200 rounded-2xl p-5 shadow-warm-sm hover:shadow-warm-md transition-all flex flex-col justify-between h-full">
                <div>
                  <div class="flex items-start justify-between gap-3 mb-3">
                    <span class="text-xs font-bold px-2.5 py-1 rounded-md bg-warm-100 text-warm-800 border border-warm-200 font-mono">
                      {{ area.codigo }}
                    </span>
                    <span
                      class="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                      [class]="area.estado === 'ACTIVO' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'"
                    >
                      {{ area.estado }}
                    </span>
                  </div>

                  <h3 class="font-bold text-warm-900 text-base mb-1">{{ area.nombre }}</h3>
                  <p class="text-xs text-primary-700 font-medium mb-1">{{ area.facultadNombre || 'Facultad General' }}</p>
                  <p class="text-xs text-warm-500 mb-4">
                    <span class="text-warm-400">Coordinador(a):</span> {{ area.coordinadorArea || 'No asignado' }}
                  </p>

                  <div class="py-3 border-y border-warm-100 mb-4 bg-warm-50/50 rounded-xl px-3 flex items-center justify-between">
                    <span class="text-[10px] text-warm-500 font-semibold uppercase">Asignaturas Nucleares</span>
                    <span class="text-sm font-bold text-warm-900">{{ area.totalAsignaturas || 8 }}</span>
                  </div>
                </div>

                <div class="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    (click)="editarArea(area)"
                    class="flex-1 py-2 px-3 bg-warm-100 hover:bg-warm-200 text-warm-800 rounded-xl text-xs font-semibold transition-colors text-center"
                  >
                    Editar Área
                  </button>
                  <button
                    type="button"
                    (click)="toggle.emit(area)"
                    class="p-2 text-warm-500 hover:text-warm-800 hover:bg-warm-100 rounded-xl transition-colors"
                    [title]="area.estado === 'ACTIVO' ? 'Desactivar Área' : 'Activar Área'"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </button>
                </div>
              </div>
            }
          </div>

          @if (areasFiltradas().length > pageSize()) {
            <div class="mt-6 flex justify-center">
              <app-pagination
                [currentPage]="currentPage()"
                [totalItems]="areasFiltradas().length"
                [pageSize]="pageSize()"
                (pageChange)="currentPage.set($event)"
              />
            </div>
          }
        }
      }

      <!-- FORMULARIO ÁREA DE CONOCIMIENTO -->
      @if (vista() === 'FORM') {
        <div class="bg-white border border-warm-200 rounded-2xl p-6 shadow-warm-sm max-w-xl mx-auto">
          <div class="flex items-center justify-between pb-4 border-b border-warm-100 mb-6">
            <div>
              <h2 class="text-lg font-serif font-bold text-warm-900">
                {{ areaEnEdicion ? 'Editar Área de Conocimiento' : 'Nueva Área de Conocimiento' }}
              </h2>
              <p class="text-xs text-warm-600">Agrupación temática curricular institucional.</p>
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
              <label class="block text-xs font-bold text-warm-700 uppercase mb-1">Facultad Perteneciente</label>
              <select
                [(ngModel)]="formArea.facultadId"
                class="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-sm focus:ring-2 focus:ring-primary-700/20 focus:border-primary-700 bg-white"
              >
                @for (f of facultades(); track f.id) {
                  <option [value]="f.id">{{ f.nombre }}</option>
                }
              </select>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-warm-700 uppercase mb-1">Código del Área</label>
                <input
                  type="text"
                  [(ngModel)]="formArea.codigo"
                  placeholder="Ej: AREA-BIO"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-sm focus:ring-2 focus:ring-primary-700/20 focus:border-primary-700"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-warm-700 uppercase mb-1">Coordinador de Área</label>
                <input
                  type="text"
                  [(ngModel)]="formArea.coordinadorArea"
                  placeholder="Docente o líder temático"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-sm focus:ring-2 focus:ring-primary-700/20 focus:border-primary-700"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-warm-700 uppercase mb-1">Nombre del Área</label>
              <input
                type="text"
                [(ngModel)]="formArea.nombre"
                placeholder="Ej: Área de Ciencias Biomédicas"
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
                [disabled]="!formArea.codigo.trim() || !formArea.nombre.trim()"
                (click)="guardar()"
                class="px-5 py-2.5 bg-primary-700 hover:bg-primary-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                Guardar Área
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class CatalogAreasComponent {
  areas = input.required<AreaConocimientoItem[]>();
  facultades = input.required<FacultadItem[]>();

  save = output<{ id?: string; datos: any }>();
  toggle = output<AreaConocimientoItem>();

  vista = signal<'LISTA' | 'FORM'>('LISTA');
  filtroTexto = signal('');
  currentPage = signal(1);
  pageSize = signal(6);

  areaEnEdicion: AreaConocimientoItem | null = null;
  formArea = {
    facultadId: '',
    codigo: '',
    nombre: '',
    coordinadorArea: '',
    estado: 'ACTIVO' as 'ACTIVO' | 'INACTIVO',
  };

  areasFiltradas = computed(() => {
    const q = this.filtroTexto().toLowerCase().trim();
    if (!q) return this.areas();
    return this.areas().filter(
      (a) =>
        a.codigo.toLowerCase().includes(q) ||
        a.nombre.toLowerCase().includes(q) ||
        (a.facultadNombre && a.facultadNombre.toLowerCase().includes(q))
    );
  });

  pagedAreas = computed(() => {
    const list = this.areasFiltradas();
    const start = (this.currentPage() - 1) * this.pageSize();
    return list.slice(start, start + this.pageSize());
  });

  abrirFormularioCrear(): void {
    this.areaEnEdicion = null;
    const facs = this.facultades();
    this.formArea = {
      facultadId: facs.length > 0 ? facs[0].id : '',
      codigo: '',
      nombre: '',
      coordinadorArea: '',
      estado: 'ACTIVO',
    };
    this.vista.set('FORM');
  }

  editarArea(area: AreaConocimientoItem): void {
    this.areaEnEdicion = area;
    this.formArea = {
      facultadId: area.facultadId,
      codigo: area.codigo,
      nombre: area.nombre,
      coordinadorArea: area.coordinadorArea || '',
      estado: area.estado,
    };
    this.vista.set('FORM');
  }

  guardar(): void {
    this.save.emit({
      id: this.areaEnEdicion?.id,
      datos: { ...this.formArea },
    });
    this.vista.set('LISTA');
  }
}
