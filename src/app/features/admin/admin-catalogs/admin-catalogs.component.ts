import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminManagementService } from '../../../core/services/admin-management.service';
import { ToastService } from '../../../shared/components/toast/toast.component';
import {
  SedeInstitucionalItem,
  EspacioFisicoItem,
  FacultadItem,
  AreaConocimientoItem,
} from '../../../core/models/role-management.model';

type TabCatalogo = 'SEDES' | 'ESPACIOS' | 'FACULTADES' | 'AREAS';
type SubVista = 'LISTA' | 'FORM_SEDE' | 'FORM_ESPACIO' | 'FORM_FACULTAD' | 'FORM_AREA';

@Component({
  selector: 'app-admin-catalogs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- ================= HEADER & BREADCRUMB ================= -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 text-xs font-semibold text-warm-500 uppercase tracking-wider mb-1">
            <span>Administración Institucional</span>
            <span>/</span>
            <span class="text-primary-700">Catálogos, Infraestructura y Facultades</span>
          </div>
          <h1 class="text-2xl font-serif font-bold text-warm-900">Infraestructura y Estructura Académica</h1>
          <p class="text-sm text-warm-600">
            Administración de sedes, aulas, laboratorios, facultades y áreas de conocimiento institucionales (HU147 - HU167).
          </p>
        </div>

        @if (vistaActual() === 'LISTA') {
          <div class="flex items-center gap-2">
            @if (tabActiva() === 'SEDES') {
              <button
                (click)="abrirFormularioSede()"
                class="px-4 py-2.5 bg-primary-700 text-white rounded-xl text-sm font-semibold hover:bg-primary-800 shadow-sm transition-all flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                <span>Nueva Sede</span>
              </button>
            }
            @if (tabActiva() === 'ESPACIOS') {
              <button
                (click)="abrirFormularioEspacio()"
                class="px-4 py-2.5 bg-primary-700 text-white rounded-xl text-sm font-semibold hover:bg-primary-800 shadow-sm transition-all flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                <span>Nuevo Espacio Físico</span>
              </button>
            }
            @if (tabActiva() === 'FACULTADES') {
              <button
                (click)="abrirFormularioFacultad()"
                class="px-4 py-2.5 bg-primary-700 text-white rounded-xl text-sm font-semibold hover:bg-primary-800 shadow-sm transition-all flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                <span>Nueva Facultad</span>
              </button>
            }
            @if (tabActiva() === 'AREAS') {
              <button
                (click)="abrirFormularioArea()"
                class="px-4 py-2.5 bg-primary-700 text-white rounded-xl text-sm font-semibold hover:bg-primary-800 shadow-sm transition-all flex items-center gap-2"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                <span>Nueva Área de Conocimiento</span>
              </button>
            }
          </div>
        }
      </div>

      <!-- ================= VISTA PRINCIPAL CON TABS ================= -->
      @if (vistaActual() === 'LISTA') {
        <!-- TABS SELECTOR -->
        <div class="flex border-b border-warm-200 gap-2">
          <button
            (click)="tabActiva.set('SEDES')"
            [class]="tabActiva() === 'SEDES' ? 'border-primary-700 text-primary-800 font-bold border-b-2' : 'text-warm-500 hover:text-warm-700'"
            class="px-4 py-3 text-sm flex items-center gap-2 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
            <span>Sedes Institucionales ({{ sedes().length }})</span>
          </button>

          <button
            (click)="tabActiva.set('ESPACIOS')"
            [class]="tabActiva() === 'ESPACIOS' ? 'border-primary-700 text-primary-800 font-bold border-b-2' : 'text-warm-500 hover:text-warm-700'"
            class="px-4 py-3 text-sm flex items-center gap-2 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/></svg>
            <span>Aulas y Espacios Físicos ({{ espacios().length }})</span>
          </button>

          <button
            (click)="tabActiva.set('FACULTADES')"
            [class]="tabActiva() === 'FACULTADES' ? 'border-primary-700 text-primary-800 font-bold border-b-2' : 'text-warm-500 hover:text-warm-700'"
            class="px-4 py-3 text-sm flex items-center gap-2 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
            <span>Facultades ({{ facultades().length }})</span>
          </button>

          <button
            (click)="tabActiva.set('AREAS')"
            [class]="tabActiva() === 'AREAS' ? 'border-primary-700 text-primary-800 font-bold border-b-2' : 'text-warm-500 hover:text-warm-700'"
            class="px-4 py-3 text-sm flex items-center gap-2 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            <span>Áreas de Conocimiento ({{ areas().length }})</span>
          </button>
        </div>

        <!-- SEARCH BAR -->
        <div class="relative">
          <input
            type="text"
            [(ngModel)]="filtroTexto"
            placeholder="Buscar por código, nombre, ubicación o características..."
            class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-700/20 focus:border-primary-700 bg-white"
          />
          <svg class="w-4 h-4 text-warm-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>

        <!-- ================= TAB 1: SEDES (HU147 - HU150) ================= -->
        @if (tabActiva() === 'SEDES') {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            @for (sede of sedesFiltradas(); track sede.id) {
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
                    <svg class="w-3.5 h-3.5 text-warm-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
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
                    (click)="editarSede(sede)"
                    class="flex-1 py-2 px-3 bg-warm-100 hover:bg-warm-200 text-warm-800 rounded-xl text-xs font-semibold transition-colors text-center"
                  >
                    Editar Sede
                  </button>
                  <button
                    (click)="toggleEstadoSede(sede)"
                    class="p-2 text-warm-500 hover:text-warm-800 hover:bg-warm-100 rounded-xl transition-colors"
                    [title]="sede.estado === 'ACTIVO' ? 'Desactivar Sede' : 'Activar Sede'"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
                  </button>
                </div>
              </div>
            }
          </div>
        }

        <!-- ================= TAB 2: ESPACIOS FÍSICOS (HU151 - HU155) ================= -->
        @if (tabActiva() === 'ESPACIOS') {
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
                  @for (espacio of espaciosFiltrados(); track espacio.id) {
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
                          (click)="editarEspacio(espacio)"
                          class="px-3 py-1.5 text-xs font-semibold text-primary-700 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- ================= TAB 3: FACULTADES (HU161 - HU164) ================= -->
        @if (tabActiva() === 'FACULTADES') {
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            @for (fac of facultadesFiltradas(); track fac.id) {
              <div class="bg-white border border-warm-200 rounded-2xl p-5 shadow-warm-sm flex flex-col justify-between h-full">
                <div>
                  <div class="flex items-center justify-between mb-3">
                    <span class="text-xs font-mono font-bold px-2 py-0.5 bg-warm-100 rounded text-warm-700">{{ fac.codigo }}</span>
                    <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">{{ fac.estado }}</span>
                  </div>
                  <h3 class="font-bold text-warm-900 text-base mb-2">{{ fac.nombre }}</h3>
                  <div class="text-xs text-warm-600 bg-warm-50 p-3 rounded-xl mb-4">
                    <span class="text-[10px] font-bold text-warm-400 uppercase block mb-0.5">Decano a Cargo</span>
                    <span class="font-semibold text-warm-800">{{ fac.decanoNombre || 'Sin decano asignado' }}</span>
                  </div>
                </div>
                <button
                  (click)="editarFacultad(fac)"
                  class="w-full py-2 bg-warm-100 hover:bg-warm-200 text-warm-800 text-xs font-semibold rounded-xl transition-colors"
                >
                  Editar Facultad
                </button>
              </div>
            }
          </div>
        }

        <!-- ================= TAB 4: ÁREAS DE CONOCIMIENTO (HU165 - HU167) ================= -->
        @if (tabActiva() === 'AREAS') {
          <div class="bg-white border border-warm-200 rounded-2xl overflow-hidden shadow-warm-sm">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-sm">
                <thead class="bg-warm-50 border-b border-warm-200 text-xs font-bold text-warm-600 uppercase tracking-wider">
                  <tr>
                    <th class="px-5 py-3.5">Código Área</th>
                    <th class="px-5 py-3.5">Nombre del Área</th>
                    <th class="px-5 py-3.5">Facultad Perteneciente</th>
                    <th class="px-5 py-3.5">Coordinador de Área</th>
                    <th class="px-5 py-3.5 text-center">Estado</th>
                    <th class="px-5 py-3.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-warm-100">
                  @for (area of areasFiltradas(); track area.id) {
                    <tr class="hover:bg-warm-50/70 transition-colors">
                      <td class="px-5 py-4 font-mono font-bold text-primary-800 text-xs">{{ area.codigo }}</td>
                      <td class="px-5 py-4 font-bold text-warm-900">{{ area.nombre }}</td>
                      <td class="px-5 py-4 text-warm-700 text-xs">{{ area.facultadNombre }}</td>
                      <td class="px-5 py-4 text-warm-600 text-xs">{{ area.coordinadorArea || 'Por asignar' }}</td>
                      <td class="px-5 py-4 text-center">
                        <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">{{ area.estado }}</span>
                      </td>
                      <td class="px-5 py-4 text-right">
                        <button
                          (click)="editarArea(area)"
                          class="px-3 py-1.5 text-xs font-semibold text-primary-700 hover:text-primary-900 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      }

      <!-- ================= FORMULARIO SEDE ================= -->
      @if (vistaActual() === 'FORM_SEDE') {
        <div class="bg-white border border-warm-200 rounded-2xl p-6 shadow-warm-sm max-w-2xl mx-auto">
          <div class="flex items-center justify-between pb-4 border-b border-warm-100 mb-6">
            <div>
              <h2 class="text-lg font-serif font-bold text-warm-900">
                {{ sedeEnEdicion?.id ? 'Editar Sede Institucional' : 'Registrar Nueva Sede' }}
              </h2>
              <p class="text-xs text-warm-600">HU147 - HU150: Configuración de campus universitario y sedes regionales.</p>
            </div>
            <button
              (click)="vistaActual.set('LISTA')"
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
                (click)="vistaActual.set('LISTA')"
                class="px-4 py-2 text-xs font-semibold text-warm-600 hover:text-warm-800"
              >
                Cancelar
              </button>
              <button
                (click)="guardarSede()"
                class="px-5 py-2.5 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                Guardar Sede
              </button>
            </div>
          </div>
        </div>
      }

      <!-- ================= FORMULARIO ESPACIO FÍSICO ================= -->
      @if (vistaActual() === 'FORM_ESPACIO') {
        <div class="bg-white border border-warm-200 rounded-2xl p-6 shadow-warm-sm max-w-2xl mx-auto">
          <div class="flex items-center justify-between pb-4 border-b border-warm-100 mb-6">
            <div>
              <h2 class="text-lg font-serif font-bold text-warm-900">
                {{ espacioEnEdicion?.id ? 'Editar Espacio Físico' : 'Registrar Nuevo Espacio / Aula' }}
              </h2>
              <p class="text-xs text-warm-600">HU151 - HU155: Parámetros de infraestructura, aforo y facilidades tecnológicas.</p>
            </div>
            <button
              (click)="vistaActual.set('LISTA')"
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
                  <option value="AULA_REGULAR">Aula Regular</option>
                  <option value="LABORATORIO">Laboratorio de Cómputo / Ciencias</option>
                  <option value="AUDITORIO">Auditorio Magistral</option>
                  <option value="SALA_SISTEMAS">Sala de Sistemas Especializada</option>
                  <option value="TALLER">Taller de Práctica</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-warm-700 uppercase mb-1">Estado de Operatividad</label>
                <select
                  [(ngModel)]="formEspacio.estado"
                  class="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-sm focus:ring-2 focus:ring-primary-700/20 focus:border-primary-700 bg-white"
                >
                  <option value="DISPONIBLE">Disponible para Asignación</option>
                  <option value="MANTENIMIENTO">En Mantenimiento</option>
                  <option value="INACTIVO">Inactivo / Fuera de Servicio</option>
                </select>
              </div>
            </div>

            <div class="flex items-center gap-6 pt-2">
              <label class="flex items-center gap-2 cursor-pointer text-sm font-semibold text-warm-800">
                <input type="checkbox" [(ngModel)]="formEspacio.tieneProyector" class="rounded text-primary-700 focus:ring-primary-700" />
                <span>Cuenta con VideoBeam / Pantalla Interactiva</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer text-sm font-semibold text-warm-800">
                <input type="checkbox" [(ngModel)]="formEspacio.tieneAireAcondicionado" class="rounded text-primary-700 focus:ring-primary-700" />
                <span>Aire Acondicionado Instalado</span>
              </label>
            </div>

            <div class="flex items-center justify-end gap-3 pt-4 border-t border-warm-100">
              <button
                (click)="vistaActual.set('LISTA')"
                class="px-4 py-2 text-xs font-semibold text-warm-600 hover:text-warm-800"
              >
                Cancelar
              </button>
              <button
                (click)="guardarEspacio()"
                class="px-5 py-2.5 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                Guardar Espacio
              </button>
            </div>
          </div>
        </div>
      }

      <!-- ================= FORMULARIO FACULTAD ================= -->
      @if (vistaActual() === 'FORM_FACULTAD') {
        <div class="bg-white border border-warm-200 rounded-2xl p-6 shadow-warm-sm max-w-xl mx-auto">
          <div class="flex items-center justify-between pb-4 border-b border-warm-100 mb-6">
            <div>
              <h2 class="text-lg font-serif font-bold text-warm-900">
                {{ facultadEnEdicion?.id ? 'Editar Facultad' : 'Crear Nueva Facultad' }}
              </h2>
              <p class="text-xs text-warm-600">HU161 - HU164: Estructura organizacional y decanaturas.</p>
            </div>
            <button
              (click)="vistaActual.set('LISTA')"
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
                (click)="vistaActual.set('LISTA')"
                class="px-4 py-2 text-xs font-semibold text-warm-600 hover:text-warm-800"
              >
                Cancelar
              </button>
              <button
                (click)="guardarFacultad()"
                class="px-5 py-2.5 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                Guardar Facultad
              </button>
            </div>
          </div>
        </div>
      }

      <!-- ================= FORMULARIO ÁREA DE CONOCIMIENTO ================= -->
      @if (vistaActual() === 'FORM_AREA') {
        <div class="bg-white border border-warm-200 rounded-2xl p-6 shadow-warm-sm max-w-xl mx-auto">
          <div class="flex items-center justify-between pb-4 border-b border-warm-100 mb-6">
            <div>
              <h2 class="text-lg font-serif font-bold text-warm-900">
                {{ areaEnEdicion?.id ? 'Editar Área de Conocimiento' : 'Nueva Área de Conocimiento' }}
              </h2>
              <p class="text-xs text-warm-600">HU165 - HU167: Agrupación temática curricular institucional.</p>
            </div>
            <button
              (click)="vistaActual.set('LISTA')"
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
                (click)="vistaActual.set('LISTA')"
                class="px-4 py-2 text-xs font-semibold text-warm-600 hover:text-warm-800"
              >
                Cancelar
              </button>
              <button
                (click)="guardarArea()"
                class="px-5 py-2.5 bg-primary-700 hover:bg-primary-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
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
export class AdminCatalogsComponent {
  private adminService = inject(AdminManagementService);
  private toast = inject(ToastService);

  tabActiva = signal<TabCatalogo>('SEDES');
  vistaActual = signal<SubVista>('LISTA');
  filtroTexto = '';

  sedes = this.adminService.sedes;
  espacios = this.adminService.espacios;
  facultades = this.adminService.facultades;
  areas = this.adminService.areas;

  // Sedes filtradas
  sedesFiltradas = computed(() => {
    const q = this.filtroTexto.toLowerCase().trim();
    if (!q) return this.sedes();
    return this.sedes().filter(
      (s) =>
        s.codigo.toLowerCase().includes(q) ||
        s.nombre.toLowerCase().includes(q) ||
        s.municipio.toLowerCase().includes(q)
    );
  });

  // Espacios filtrados
  espaciosFiltrados = computed(() => {
    const q = this.filtroTexto.toLowerCase().trim();
    if (!q) return this.espacios();
    return this.espacios().filter(
      (e) =>
        e.codigo.toLowerCase().includes(q) ||
        e.bloque.toLowerCase().includes(q) ||
        e.tipo.toLowerCase().includes(q) ||
        (e.sedeNombre && e.sedeNombre.toLowerCase().includes(q))
    );
  });

  // Facultades filtradas
  facultadesFiltradas = computed(() => {
    const q = this.filtroTexto.toLowerCase().trim();
    if (!q) return this.facultades();
    return this.facultades().filter(
      (f) =>
        f.codigo.toLowerCase().includes(q) ||
        f.nombre.toLowerCase().includes(q) ||
        (f.decanoNombre && f.decanoNombre.toLowerCase().includes(q))
    );
  });

  // Áreas filtradas
  areasFiltradas = computed(() => {
    const q = this.filtroTexto.toLowerCase().trim();
    if (!q) return this.areas();
    return this.areas().filter(
      (a) =>
        a.codigo.toLowerCase().includes(q) ||
        a.nombre.toLowerCase().includes(q) ||
        (a.facultadNombre && a.facultadNombre.toLowerCase().includes(q))
    );
  });

  // Form states
  sedeEnEdicion: SedeInstitucionalItem | null = null;
  formSede = {
    codigo: '',
    nombre: '',
    direccion: '',
    municipio: '',
    telefono: '',
    estado: 'ACTIVO' as 'ACTIVO' | 'INACTIVO',
  };

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

  facultadEnEdicion: FacultadItem | null = null;
  formFacultad = {
    codigo: '',
    nombre: '',
    decanoNombre: '',
    estado: 'ACTIVO' as 'ACTIVO' | 'INACTIVO',
  };

  areaEnEdicion: AreaConocimientoItem | null = null;
  formArea = {
    facultadId: '',
    codigo: '',
    nombre: '',
    coordinadorArea: '',
    estado: 'ACTIVO' as 'ACTIVO' | 'INACTIVO',
  };

  // Metodos Sedes
  abrirFormularioSede(): void {
    this.sedeEnEdicion = null;
    this.formSede = {
      codigo: '',
      nombre: '',
      direccion: '',
      municipio: '',
      telefono: '',
      estado: 'ACTIVO',
    };
    this.vistaActual.set('FORM_SEDE');
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
    this.vistaActual.set('FORM_SEDE');
  }

  guardarSede(): void {
    if (!this.formSede.codigo || !this.formSede.nombre) {
      this.toast.error('Complete el código y nombre de la sede');
      return;
    }
    if (this.sedeEnEdicion) {
      this.adminService.actualizarSede(this.sedeEnEdicion.id, this.formSede);
      this.toast.success('Sede institucional actualizada correctamente');
    } else {
      this.adminService.crearSede(this.formSede);
      this.toast.success('Sede institucional registrada con éxito');
    }
    this.vistaActual.set('LISTA');
  }

  toggleEstadoSede(sede: SedeInstitucionalItem): void {
    this.adminService.cambiarEstadoSede(sede.id);
    this.toast.info(`Estado de la sede cambiado a ${sede.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'}`);
  }

  // Metodos Espacios
  abrirFormularioEspacio(): void {
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
    this.vistaActual.set('FORM_ESPACIO');
  }

  editarEspacio(espacio: EspacioFisicoItem): void {
    this.espacioEnEdicion = espacio;
    this.formEspacio = {
      sedeId: espacio.sedeId,
      codigo: espacio.codigo,
      bloque: espacio.bloque,
      piso: espacio.piso,
      tipo: espacio.tipo,
      capacidad: espacio.capacidad,
      tieneProyector: espacio.tieneProyector,
      tieneAireAcondicionado: espacio.tieneAireAcondicionado,
      estado: espacio.estado,
    };
    this.vistaActual.set('FORM_ESPACIO');
  }

  guardarEspacio(): void {
    if (!this.formEspacio.codigo || !this.formEspacio.bloque) {
      this.toast.error('Indique al menos el código del aula y su bloque');
      return;
    }
    if (this.espacioEnEdicion) {
      this.adminService.actualizarEspacio(this.espacioEnEdicion.id, this.formEspacio);
      this.toast.success('Espacio físico actualizado');
    } else {
      this.adminService.crearEspacio(this.formEspacio);
      this.toast.success('Espacio físico registrado exitosamente');
    }
    this.vistaActual.set('LISTA');
  }

  // Metodos Facultades
  abrirFormularioFacultad(): void {
    this.facultadEnEdicion = null;
    this.formFacultad = {
      codigo: '',
      nombre: '',
      decanoNombre: '',
      estado: 'ACTIVO',
    };
    this.vistaActual.set('FORM_FACULTAD');
  }

  editarFacultad(fac: FacultadItem): void {
    this.facultadEnEdicion = fac;
    this.formFacultad = {
      codigo: fac.codigo,
      nombre: fac.nombre,
      decanoNombre: fac.decanoNombre || '',
      estado: fac.estado,
    };
    this.vistaActual.set('FORM_FACULTAD');
  }

  guardarFacultad(): void {
    if (!this.formFacultad.codigo || !this.formFacultad.nombre) {
      this.toast.error('Ingrese el código y el nombre de la facultad');
      return;
    }
    if (this.facultadEnEdicion) {
      this.adminService.actualizarFacultad(this.facultadEnEdicion.id, this.formFacultad);
      this.toast.success('Facultad actualizada');
    } else {
      this.adminService.crearFacultad(this.formFacultad);
      this.toast.success('Facultad registrada');
    }
    this.vistaActual.set('LISTA');
  }

  // Metodos Áreas
  abrirFormularioArea(): void {
    this.areaEnEdicion = null;
    const facs = this.facultades();
    this.formArea = {
      facultadId: facs.length > 0 ? facs[0].id : '',
      codigo: '',
      nombre: '',
      coordinadorArea: '',
      estado: 'ACTIVO',
    };
    this.vistaActual.set('FORM_AREA');
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
    this.vistaActual.set('FORM_AREA');
  }

  guardarArea(): void {
    if (!this.formArea.codigo || !this.formArea.nombre) {
      this.toast.error('Ingrese el código y el nombre del área temática');
      return;
    }
    if (this.areaEnEdicion) {
      this.adminService.actualizarArea(this.areaEnEdicion.id, this.formArea);
      this.toast.success('Área de conocimiento actualizada');
    } else {
      this.adminService.crearArea(this.formArea);
      this.toast.success('Área de conocimiento creada con éxito');
    }
    this.vistaActual.set('LISTA');
  }
}
