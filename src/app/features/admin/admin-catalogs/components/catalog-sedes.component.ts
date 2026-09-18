import { Component, ChangeDetectionStrategy, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SedeInstitucionalItem } from '../../../../core/models/role-management.model';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-catalog-sedes',
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
              placeholder="Buscar sede por código, nombre o municipio..."
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
            <span>Nueva Sede</span>
          </button>
        </div>

        @if (pagedSedes().length === 0) {
          <div class="bg-white rounded-2xl border border-warm-200 p-12 text-center shadow-warm-sm">
            <p class="text-sm text-warm-500">No se encontraron sedes con los criterios de búsqueda.</p>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            @for (sede of pagedSedes(); track sede.id) {
              <div class="bg-white border border-warm-200 rounded-2xl p-5 shadow-warm-sm hover:shadow-warm-md transition-all flex flex-col justify-between h-full">
                <div>
                  <div class="flex items-start justify-between gap-3 mb-3">
                    <span class="text-xs font-bold px-2.5 py-1 rounded-md bg-warm-100 text-warm-800 border border-warm-200 font-mono">
                      {{ sede.codigo }}
                    </span>
                    <span
                      class="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                      [class]="sede.estado === 'ACTIVO' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'"
                    >
                      {{ sede.estado }}
                    </span>
                  </div>

                  <h3 class="font-bold text-warm-900 text-base mb-1">{{ sede.nombre }}</h3>
                  <p class="text-xs text-warm-600 mb-4 flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5 text-warm-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{{ sede.direccion }} ({{ sede.municipio }})</span>
                  </p>

                  <div class="grid grid-cols-2 gap-3 py-3 border-y border-warm-100 mb-4 bg-warm-50/50 rounded-xl px-3">
                    <div>
                      <span class="text-[10px] text-warm-500 font-semibold uppercase block">Bloques</span>
                      <span class="text-sm font-bold text-warm-900">{{ sede.totalBloques || 1 }}</span>
                    </div>
                    <div>
                      <span class="text-[10px] text-warm-500 font-semibold uppercase block">Aulas Totales</span>
                      <span class="text-sm font-bold text-warm-900">{{ sede.totalAulas || 10 }}</span>
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    (click)="editarSede(sede)"
                    class="flex-1 py-2 px-3 bg-warm-100 hover:bg-warm-200 text-warm-800 rounded-xl text-xs font-semibold transition-colors text-center"
                  >
                    Editar Sede
                  </button>
                  <button
                    type="button"
                    (click)="toggle.emit(sede)"
                    class="p-2 text-warm-500 hover:text-warm-800 hover:bg-warm-100 rounded-xl transition-colors"
                    [title]="sede.estado === 'ACTIVO' ? 'Desactivar Sede' : 'Activar Sede'"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </button>
                </div>
              </div>
            }
          </div>

          @if (sedesFiltradas().length > pageSize()) {
            <div class="mt-6 flex justify-center">
              <app-pagination
                [currentPage]="currentPage()"
                [totalItems]="sedesFiltradas().length"
                [pageSize]="pageSize()"
                (pageChange)="currentPage.set($event)"
              />
            </div>
          }
        }
      }

      <!-- FORMULARIO SEDE -->
      @if (vista() === 'FORM') {
        <div class="bg-white border border-warm-200 rounded-2xl p-6 shadow-warm-sm max-w-xl mx-auto">
          <div class="flex items-center justify-between pb-4 border-b border-warm-100 mb-6">
            <div>
              <h2 class="text-lg font-serif font-bold text-warm-900">
                {{ sedeEnEdicion ? 'Editar Sede Universitaria' : 'Nueva Sede Institucional' }}
              </h2>
              <p class="text-xs text-warm-600">Configuración de campus universitario y sedes regionales.</p>
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
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-warm-700 uppercase mb-1">Código Sede</label>
                <input
                  type="text"
                  [(ngModel)]="formSede.codigo"
                  placeholder="Ej: SED-SONSON"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-sm focus:ring-2 focus:ring-primary-700/20 focus:border-primary-700"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-warm-700 uppercase mb-1">Municipio / Ciudad</label>
                <input
                  type="text"
                  [(ngModel)]="formSede.municipio"
                  placeholder="Ej: Sonsón"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-sm focus:ring-2 focus:ring-primary-700/20 focus:border-primary-700"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-warm-700 uppercase mb-1">Nombre Completo de la Sede</label>
              <input
                type="text"
                [(ngModel)]="formSede.nombre"
                placeholder="Ej: Sede Sonsón Páramo de Sonsón"
                class="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-sm focus:ring-2 focus:ring-primary-700/20 focus:border-primary-700"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-warm-700 uppercase mb-1">Dirección</label>
                <input
                  type="text"
                  [(ngModel)]="formSede.direccion"
                  placeholder="Ej: Carrera 6 # 7-12"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-sm focus:ring-2 focus:ring-primary-700/20 focus:border-primary-700"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-warm-700 uppercase mb-1">Teléfono Institucional</label>
                <input
                  type="text"
                  [(ngModel)]="formSede.telefono"
                  placeholder="Ej: (604) 869 1234"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-sm focus:ring-2 focus:ring-primary-700/20 focus:border-primary-700"
                />
              </div>
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
                [disabled]="!formSede.codigo.trim() || !formSede.nombre.trim()"
                (click)="guardar()"
                class="px-5 py-2.5 bg-primary-700 hover:bg-primary-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                Guardar Sede
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class CatalogSedesComponent {
  sedes = input.required<SedeInstitucionalItem[]>();

  save = output<{ id?: string; datos: any }>();
  toggle = output<SedeInstitucionalItem>();

  vista = signal<'LISTA' | 'FORM'>('LISTA');
  filtroTexto = signal('');
  currentPage = signal(1);
  pageSize = signal(6);

  sedeEnEdicion: SedeInstitucionalItem | null = null;
  formSede = {
    codigo: '',
    nombre: '',
    direccion: '',
    municipio: '',
    telefono: '',
    estado: 'ACTIVO' as 'ACTIVO' | 'INACTIVO',
  };

  sedesFiltradas = computed(() => {
    const q = this.filtroTexto().toLowerCase().trim();
    if (!q) return this.sedes();
    return this.sedes().filter(
      (s) =>
        s.codigo.toLowerCase().includes(q) ||
        s.nombre.toLowerCase().includes(q) ||
        s.municipio.toLowerCase().includes(q)
    );
  });

  pagedSedes = computed(() => {
    const list = this.sedesFiltradas();
    const start = (this.currentPage() - 1) * this.pageSize();
    return list.slice(start, start + this.pageSize());
  });

  abrirFormularioCrear(): void {
    this.sedeEnEdicion = null;
    this.formSede = {
      codigo: '',
      nombre: '',
      direccion: '',
      municipio: '',
      telefono: '',
      estado: 'ACTIVO',
    };
    this.vista.set('FORM');
  }

  editarSede(sede: SedeInstitucionalItem): void {
    this.sedeEnEdicion = sede;
    this.formSede = {
      codigo: sede.codigo,
      nombre: sede.nombre,
      direccion: sede.direccion,
      municipio: sede.municipio,
      telefono: sede.telefono,
      estado: sede.estado,
    };
    this.vista.set('FORM');
  }

  guardar(): void {
    this.save.emit({
      id: this.sedeEnEdicion?.id,
      datos: { ...this.formSede },
    });
    this.vista.set('LISTA');
  }
}
