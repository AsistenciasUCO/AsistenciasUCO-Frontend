import { Component, ChangeDetectionStrategy, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EspacioFisicoItem, SedeInstitucionalItem } from '../../../../core/models/role-management.model';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-catalog-espacios',
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
              placeholder="Buscar espacio por código, bloque o características..."
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
            <span>Nuevo Espacio Físico</span>
          </button>
        </div>

        <!-- BARRA DE FILTROS AVANZADOS (HU020, HU144) -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-warm-50/80 rounded-2xl border border-warm-200 shadow-warm-xs">
          <div>
            <label class="block text-[11px] font-bold text-warm-600 uppercase mb-1">Filtrar por Sede</label>
            <select
              [ngModel]="filtroSedeId()"
              (ngModelChange)="filtroSedeId.set($event)"
              class="w-full px-3 py-2 bg-white border border-warm-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-700/20"
            >
              <option value="TODAS">Todas las Sedes Universitarias</option>
              @for (sede of sedes(); track sede.id) {
                <option [value]="sede.id">{{ sede.nombre }}</option>
              }
            </select>
          </div>

          <div>
            <label class="block text-[11px] font-bold text-warm-600 uppercase mb-1">Tipo de Espacio</label>
            <select
              [ngModel]="filtroTipoEspacio()"
              (ngModelChange)="filtroTipoEspacio.set($event)"
              class="w-full px-3 py-2 bg-white border border-warm-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-700/20"
            >
              <option value="TODOS">Todos los Tipos</option>
              <option value="Aula de Clase">Aula de Clase</option>
              <option value="Laboratorio de Cómputo">Laboratorio de Cómputo</option>
              <option value="Auditorio">Auditorio</option>
              <option value="Sala de Estudio">Sala de Estudio</option>
            </select>
          </div>

          <div>
            <label class="block text-[11px] font-bold text-warm-600 uppercase mb-1">Estado Operativo</label>
            <select
              [ngModel]="filtroEstadoEspacio()"
              (ngModelChange)="filtroEstadoEspacio.set($event)"
              class="w-full px-3 py-2 bg-white border border-warm-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-700/20"
            >
              <option value="TODOS">Todos los Estados</option>
              <option value="DISPONIBLE">Disponible</option>
              <option value="MANTENIMIENTO">En Mantenimiento</option>
              <option value="INACTIVO">Inactivo</option>
            </select>
          </div>
        </div>

        <div class="bg-white border border-warm-200 rounded-2xl overflow-hidden shadow-warm-sm">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-warm-50 border-b border-warm-200 text-xs font-bold text-warm-600 uppercase tracking-wider">
                <tr>
                  <th class="px-5 py-3.5">Código Aula</th>
                  <th class="px-5 py-3.5">Sede y Ubicación</th>
                  <th class="px-5 py-3.5">Tipo de Espacio</th>
                  <th class="px-5 py-3.5 text-center">Capacidad</th>
                  <th class="px-5 py-3.5">Equipamiento</th>
                  <th class="px-5 py-3.5 text-center">Estado</th>
                  <th class="px-5 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-warm-100">
                @if (pagedEspacios().length === 0) {
                  <tr>
                    <td colspan="7" class="px-5 py-8 text-center text-warm-500 text-sm">
                      No se encontraron espacios físicos con los filtros actuales.
                    </td>
                  </tr>
                } @else {
                  @for (espacio of pagedEspacios(); track espacio.id) {
                    <tr class="hover:bg-warm-50/70 transition-colors">
                      <td class="px-5 py-4 font-mono font-bold text-primary-800 text-xs">
                        {{ espacio.codigo }}
                      </td>
                      <td class="px-5 py-4">
                        <div class="font-medium text-warm-900">{{ espacio.sedeNombre || 'Campus Central' }}</div>
                        <div class="text-xs text-warm-500">{{ espacio.bloque }} - {{ espacio.piso }}</div>
                      </td>
                      <td class="px-5 py-4">
                        <span class="text-xs font-semibold px-2.5 py-1 rounded-md bg-warm-100 text-warm-700">
                          {{ espacio.tipo }}
                        </span>
                      </td>
                      <td class="px-5 py-4 text-center font-bold text-warm-900">
                        {{ espacio.capacidad }} personas
                      </td>
                      <td class="px-5 py-4">
                        <div class="flex items-center gap-2">
                          @if (espacio.tieneProyector) {
                            <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200" title="Proyector disponible">
                              VideoBeam
                            </span>
                          }
                          @if (espacio.tieneAireAcondicionado) {
                            <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-50 text-cyan-700 border border-cyan-200" title="Climatizado">
                              Aire Acond.
                            </span>
                          }
                        </div>
                      </td>
                      <td class="px-5 py-4 text-center">
                        <span
                          class="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                          [class]="espacio.estado === 'DISPONIBLE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
                        >
                          {{ espacio.estado }}
                        </span>
                      </td>
                      <td class="px-5 py-4 text-right">
                        <button
                          type="button"
                          (click)="editarEspacio(espacio)"
                          class="px-3 py-1.5 text-xs font-semibold text-primary-700 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>

          @if (espaciosFiltrados().length > pageSize()) {
            <div class="p-4 border-t border-warm-100 flex justify-center bg-warm-50/50">
              <app-pagination
                [currentPage]="currentPage()"
                [totalItems]="espaciosFiltrados().length"
                [pageSize]="pageSize()"
                (pageChange)="currentPage.set($event)"
              />
            </div>
          }
        </div>
      }

      <!-- FORMULARIO ESPACIO FÍSICO -->
      @if (vista() === 'FORM') {
        <div class="bg-white border border-warm-200 rounded-2xl p-6 shadow-warm-sm max-w-2xl mx-auto">
          <div class="flex items-center justify-between pb-4 border-b border-warm-100 mb-6">
            <div>
              <h2 class="text-lg font-serif font-bold text-warm-900">
                {{ espacioEnEdicion ? 'Editar Espacio Físico' : 'Registrar Nuevo Espacio / Aula' }}
              </h2>
              <p class="text-xs text-warm-600">Parámetros de infraestructura, aforo y facilidades tecnológicas.</p>
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
                <label class="block text-xs font-bold text-warm-700 uppercase mb-1">Sede Perteneciente</label>
                <select
                  [(ngModel)]="formEspacio.sedeId"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-sm focus:ring-2 focus:ring-primary-700/20 focus:border-primary-700 bg-white"
                >
                  @for (s of sedes(); track s.id) {
                    <option [value]="s.id">{{ s.nombre }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-warm-700 uppercase mb-1">Código de Aula / Espacio</label>
                <input
                  type="text"
                  [(ngModel)]="formEspacio.codigo"
                  placeholder="Ej: B2-304"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-sm focus:ring-2 focus:ring-primary-700/20 focus:border-primary-700"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label class="block text-xs font-bold text-warm-700 uppercase mb-1">Bloque / Edificio</label>
                <input
                  type="text"
                  [(ngModel)]="formEspacio.bloque"
                  placeholder="Ej: Bloque 2"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-sm focus:ring-2 focus:ring-primary-700/20 focus:border-primary-700"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-warm-700 uppercase mb-1">Piso</label>
                <input
                  type="text"
                  [(ngModel)]="formEspacio.piso"
                  placeholder="Ej: Piso 3"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-sm focus:ring-2 focus:ring-primary-700/20 focus:border-primary-700"
                />
              </div>
              <div>
                <label class="block text-xs font-bold text-warm-700 uppercase mb-1">Capacidad Máxima</label>
                <input
                  type="number"
                  [(ngModel)]="formEspacio.capacidad"
                  min="1"
                  max="300"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-sm focus:ring-2 focus:ring-primary-700/20 focus:border-primary-700"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-warm-700 uppercase mb-1">Tipo de Espacio</label>
                <select
                  [(ngModel)]="formEspacio.tipo"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-sm focus:ring-2 focus:ring-primary-700/20 focus:border-primary-700 bg-white"
                >
                  <option value="AULA_REGULAR">Aula Regular de Clases</option>
                  <option value="LABORATORIO">Laboratorio Especializado</option>
                  <option value="SALA_SISTEMAS">Sala de Cómputo</option>
                  <option value="AUDITORIO">Auditorio Magistral</option>
                  <option value="TALLER">Taller de Prácticas</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-warm-700 uppercase mb-1">Estado del Espacio</label>
                <select
                  [(ngModel)]="formEspacio.estado"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-sm focus:ring-2 focus:ring-primary-700/20 focus:border-primary-700 bg-white"
                >
                  <option value="DISPONIBLE">DISPONIBLE</option>
                  <option value="MANTENIMIENTO">EN MANTENIMIENTO</option>
                  <option value="INACTIVO">INACTIVO</option>
                </select>
              </div>
            </div>

            <div class="flex items-center gap-6 py-2">
              <label class="flex items-center gap-2 text-xs font-semibold text-warm-800 cursor-pointer">
                <input
                  type="checkbox"
                  [(ngModel)]="formEspacio.tieneProyector"
                  class="rounded text-primary-700 focus:ring-primary-700/20 w-4 h-4"
                />
                <span>Cuenta con VideoBeam / Proyector</span>
              </label>

              <label class="flex items-center gap-2 text-xs font-semibold text-warm-800 cursor-pointer">
                <input
                  type="checkbox"
                  [(ngModel)]="formEspacio.tieneAireAcondicionado"
                  class="rounded text-primary-700 focus:ring-primary-700/20 w-4 h-4"
                />
                <span>Aire Acondicionado</span>
              </label>
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
                [disabled]="!formEspacio.codigo.trim() || !formEspacio.bloque.trim()"
                (click)="guardar()"
                class="px-5 py-2.5 bg-primary-700 hover:bg-primary-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                Guardar Espacio
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class CatalogEspaciosComponent {
  espacios = input.required<EspacioFisicoItem[]>();
  sedes = input.required<SedeInstitucionalItem[]>();

  save = output<{ id?: string; datos: any }>();

  vista = signal<'LISTA' | 'FORM'>('LISTA');
  filtroTexto = signal('');
  filtroSedeId = signal('TODAS');
  filtroTipoEspacio = signal('TODOS');
  filtroEstadoEspacio = signal('TODOS');

  currentPage = signal(1);
  pageSize = signal(8);

  espacioEnEdicion: EspacioFisicoItem | null = null;
  formEspacio = {
    sedeId: '',
    codigo: '',
    bloque: '',
    piso: '',
    tipo: 'AULA_REGULAR' as 'AULA_REGULAR' | 'LABORATORIO' | 'AUDITORIO' | 'SALA_SISTEMAS' | 'TALLER',
    capacidad: 30,
    tieneProyector: true,
    tieneAireAcondicionado: false,
    estado: 'DISPONIBLE' as 'DISPONIBLE' | 'MANTENIMIENTO' | 'INACTIVO',
  };

  espaciosFiltrados = computed(() => {
    const q = this.filtroTexto().toLowerCase().trim();
    const sede = this.filtroSedeId();
    const tipo = this.filtroTipoEspacio();
    const estado = this.filtroEstadoEspacio();

    return this.espacios().filter((e) => {
      const matchQ =
        !q ||
        e.codigo.toLowerCase().includes(q) ||
        e.bloque.toLowerCase().includes(q) ||
        e.tipo.toLowerCase().includes(q) ||
        (e.sedeNombre && e.sedeNombre.toLowerCase().includes(q));

      const matchSede = sede === 'TODAS' || e.sedeId === sede || (e.sedeNombre && e.sedeNombre.includes(sede));
      const matchTipo = tipo === 'TODOS' || e.tipo.toLowerCase().includes(tipo.toLowerCase());
      const matchEstado = estado === 'TODOS' || e.estado === estado;

      return matchQ && matchSede && matchTipo && matchEstado;
    });
  });

  pagedEspacios = computed(() => {
    const list = this.espaciosFiltrados();
    const start = (this.currentPage() - 1) * this.pageSize();
    return list.slice(start, start + this.pageSize());
  });

  abrirFormularioCrear(): void {
    this.espacioEnEdicion = null;
    const sedesActuales = this.sedes();
    this.formEspacio = {
      sedeId: sedesActuales.length > 0 ? sedesActuales[0].id : '',
      codigo: '',
      bloque: '',
      piso: '',
      tipo: 'AULA_REGULAR',
      capacidad: 30,
      tieneProyector: true,
      tieneAireAcondicionado: false,
      estado: 'DISPONIBLE',
    };
    this.vista.set('FORM');
  }

  editarEspacio(espacio: EspacioFisicoItem): void {
    this.espacioEnEdicion = espacio;
    this.formEspacio = {
      sedeId: espacio.sedeId,
      codigo: espacio.codigo,
      bloque: espacio.bloque,
      piso: espacio.piso,
      tipo: (espacio.tipo as any) || 'AULA_REGULAR',
      capacidad: espacio.capacidad,
      tieneProyector: espacio.tieneProyector,
      tieneAireAcondicionado: espacio.tieneAireAcondicionado,
      estado: espacio.estado,
    };
    this.vista.set('FORM');
  }

  guardar(): void {
    this.save.emit({
      id: this.espacioEnEdicion?.id,
      datos: { ...this.formEspacio },
    });
    this.vista.set('LISTA');
  }
}
