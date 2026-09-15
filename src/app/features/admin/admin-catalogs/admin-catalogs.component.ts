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
  PlanEstudioItem,
  AsignaturaPlanItem,
} from '../../../core/models/role-management.model';
import {
  MOCK_PLANES_ESTUDIO,
  MOCK_ASIGNATURAS_PLAN,
} from '../../../core/mocks/role-management.mock';

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
            Administración de sedes, aulas, laboratorios, facultades y áreas de conocimiento institucionales.
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

        <!-- ================= TAB 1: SEDES ================= -->
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

        <!-- ================= TAB 2: ESPACIOS FÍSICOS ================= -->
        @if (tabActiva() === 'ESPACIOS') {
          <!-- BARRA DE FILTROS AVANZADOS (HU020, HU144) -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-warm-50/80 rounded-2xl border border-warm-200 shadow-warm-xs">
            <div>
              <label class="block text-[11px] font-bold text-warm-600 uppercase mb-1">Filtrar por Sede</label>
              <select
                [(ngModel)]="filtroSedeId"
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
                [(ngModel)]="filtroTipoEspacio"
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
                [(ngModel)]="filtroEstadoEspacio"
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

        <!-- ================= TAB 3: FACULTADES ================= -->
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
                <div class="space-y-2">
                  <button
                    (click)="verProgramasFacultad(fac)"
                    class="w-full py-2 bg-primary-50 hover:bg-primary-100 text-primary-900 text-xs font-bold rounded-xl border border-primary-200 transition-colors inline-flex items-center justify-center gap-1.5"
                  >
                    Ver Programas y Planes ({{ getProgramasFacultad(fac).length }}) →
                  </button>
                  <button
                    (click)="editarFacultad(fac)"
                    class="w-full py-2 bg-warm-100 hover:bg-warm-200 text-warm-800 text-xs font-semibold rounded-xl transition-colors"
                  >
                    Editar Facultad
                  </button>
                </div>
              </div>
            }
          </div>
        }

        <!-- ================= TAB 4: ÁREAS DE CONOCIMIENTO ================= -->
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
              <p class="text-xs text-warm-600">Configuración de campus universitario y sedes regionales.</p>
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
              <p class="text-xs text-warm-600">Parámetros de infraestructura, aforo y facilidades tecnológicas.</p>
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
              <p class="text-xs text-warm-600">Estructura organizacional y decanaturas.</p>
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
              <p class="text-xs text-warm-600">Agrupación temática curricular institucional.</p>
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

      <!-- MODAL: PROGRAMAS ACADÉMICOS Y PLANES DE ESTUDIO DE LA FACULTAD (HU107, HU108, HU112, HU119) -->
      @if (facultadSeleccionada()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-warm-950/40 backdrop-blur-xs animate-fade-in">
          <div class="bg-white border border-warm-200 rounded-3xl max-w-3xl w-full shadow-warm-xl overflow-hidden animate-slide-down">
            <!-- Header Modal -->
            <div class="p-6 bg-warm-50 border-b border-warm-200/80 flex items-start justify-between">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-primary-100 text-primary-900 border border-primary-200">
                    {{ facultadSeleccionada()?.codigo }}
                  </span>
                  <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {{ facultadSeleccionada()?.estado }}
                  </span>
                </div>
                <h3 class="font-serif font-bold text-2xl text-warm-900">
                  {{ facultadSeleccionada()?.nombre }}
                </h3>
                <p class="text-xs text-warm-600 mt-1">
                  Decano a cargo: <strong>{{ facultadSeleccionada()?.decanoNombre || 'Sin asignar' }}</strong>
                </p>
              </div>

              <button
                type="button"
                (click)="cerrarModalFacultad()"
                class="text-warm-400 hover:text-warm-700 p-1.5 rounded-xl hover:bg-warm-100 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Body Modal -->
            <div class="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div class="flex items-center justify-between">
                <h4 class="font-serif font-bold text-base text-warm-900">
                  Programas Académicos Adscritos
                </h4>
                <span class="text-xs font-semibold text-warm-500">
                  {{ getProgramasFacultad(facultadSeleccionada()!).length }} programas registrados
                </span>
              </div>

              <!-- Lista de Programas -->
              <div class="space-y-3">
                @for (prog of getProgramasFacultad(facultadSeleccionada()!); track prog.codigo) {
                  <div class="p-4 rounded-2xl border border-warm-200 bg-white hover:border-primary-300 transition-all shadow-warm-xs">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div class="flex items-center gap-2">
                        <span class="font-mono text-xs font-bold px-2 py-0.5 rounded bg-warm-100 text-warm-800">
                          {{ prog.codigo }}
                        </span>
                        <h5 class="font-bold text-sm text-warm-900">{{ prog.nombre }}</h5>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="text-xs px-2.5 py-0.5 rounded-md bg-warm-100 text-warm-700 font-medium">
                          {{ prog.nivel }}
                        </span>
                        <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                              [class]="prog.estado === 'ACTIVO' ? 'bg-emerald-100 text-emerald-800' : 'bg-warm-200 text-warm-700'">
                          {{ prog.estado }}
                        </span>
                      </div>
                    </div>

                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 py-2 border-y border-warm-100 text-xs text-warm-600 bg-warm-50/50 rounded-xl px-3 my-2">
                      <div>
                        <span class="text-[10px] text-warm-400 font-bold uppercase block">Créditos</span>
                        <span class="font-bold text-warm-900">{{ prog.totalCreditos }} créditos</span>
                      </div>
                      <div>
                        <span class="text-[10px] text-warm-400 font-bold uppercase block">Duración</span>
                        <span class="font-bold text-warm-900">{{ prog.totalSemestres }} semestres</span>
                      </div>
                      <div class="col-span-2 sm:col-span-1">
                        <span class="text-[10px] text-warm-400 font-bold uppercase block">Plan de Estudios</span>
                        <span class="font-semibold text-primary-800">{{ prog.planEstudioNombre }}</span>
                      </div>
                    </div>

                    <div class="flex justify-end pt-1">
                      <button
                        type="button"
                        (click)="verPlanEstudio(prog)"
                        class="text-xs font-semibold text-primary-700 hover:text-primary-900 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Ver Malla Curricular / Asignaturas →
                      </button>
                    </div>
                  </div>
                }
              </div>

              <!-- Vista Detallada de Asignaturas del Plan si fue seleccionado -->
              @if (planVisualizado()) {
                <div class="p-5 bg-warm-50 rounded-2xl border border-warm-200 space-y-3 animate-fade-in">
                  <div class="flex items-center justify-between">
                    <div>
                      <h5 class="font-serif font-bold text-sm text-warm-900">
                        Asignaturas del {{ planVisualizado()?.nombre }}
                      </h5>
                      <p class="text-xs text-warm-500">Malla curricular de formación básica y profesional.</p>
                    </div>
                    <button
                      type="button"
                      (click)="planVisualizado.set(null)"
                      class="text-xs text-warm-600 hover:text-warm-900 underline"
                    >
                      Ocultar Asignaturas
                    </button>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    @for (asig of asignaturasPlan(); track asig.id) {
                      <div class="p-3 bg-white rounded-xl border border-warm-200 text-xs flex justify-between items-center">
                        <div>
                          <span class="font-mono font-bold text-primary-800 mr-1.5">{{ asig.codigo }}</span>
                          <span class="font-semibold text-warm-900">{{ asig.nombre }}</span>
                          <div class="text-[10px] text-warm-500">Semestre {{ asig.semestre }} • {{ asig.area }}</div>
                        </div>
                        <span class="px-2 py-0.5 rounded bg-warm-100 text-warm-800 font-bold text-[11px]">
                          {{ asig.creditos }} cr.
                        </span>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>

            <!-- Footer Modal -->
            <div class="p-4 bg-warm-50 border-t border-warm-200 flex justify-end">
              <button
                type="button"
                (click)="cerrarModalFacultad()"
                class="px-4 py-2 bg-warm-200 hover:bg-warm-300 text-warm-800 font-semibold text-xs rounded-xl transition-colors"
              >
                Cerrar Detalle
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

  filtroSedeId = 'TODAS';
  filtroTipoEspacio = 'TODOS';
  filtroEstadoEspacio = 'TODOS';

  facultadSeleccionada = signal<FacultadItem | null>(null);
  planVisualizado = signal<PlanEstudioItem | null>(null);
  asignaturasPlan = signal<AsignaturaPlanItem[]>([]);

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

  // Espacios filtrados (HU020, HU144)
  espaciosFiltrados = computed(() => {
    const q = this.filtroTexto.toLowerCase().trim();
    const sede = this.filtroSedeId;
    const tipo = this.filtroTipoEspacio;
    const estado = this.filtroEstadoEspacio;

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

  // Métodos Programas y Planes de Estudio (HU107, HU108, HU112, HU119)
  getProgramasFacultad(facultad: FacultadItem) {
    return [
      {
        codigo: 'PRG-SIS',
        nombre: 'Ingeniería de Sistemas',
        nivel: 'Pregrado Profesional',
        totalCreditos: 160,
        totalSemestres: 10,
        estado: 'ACTIVO',
        planEstudioId: 'PLAN-SIS-2024',
        planEstudioNombre: 'Plan Curricular 2024 (Por Competencias)',
      },
      {
        codigo: 'PRG-IND',
        nombre: 'Ingeniería Industrial',
        nivel: 'Pregrado Profesional',
        totalCreditos: 165,
        totalSemestres: 10,
        estado: 'ACTIVO',
        planEstudioId: 'PLAN-SIS-2020',
        planEstudioNombre: 'Plan Curricular 2020 (Integral)',
      },
      {
        codigo: 'PRG-ELE',
        nombre: 'Ingeniería Electrónica',
        nivel: 'Pregrado Profesional',
        totalCreditos: 162,
        totalSemestres: 10,
        estado: 'ACTIVO',
        planEstudioId: 'PLAN-SIS-2024',
        planEstudioNombre: 'Plan Curricular 2024 (Innovación)',
      },
      {
        codigo: 'PRG-AGR',
        nombre: 'Ingeniería Agroindustrial',
        nivel: 'Pregrado Profesional',
        totalCreditos: 158,
        totalSemestres: 10,
        estado: 'ACTIVO',
        planEstudioId: 'PLAN-SIS-2020',
        planEstudioNombre: 'Plan Curricular 2020 (Sostenibilidad)',
      },
    ];
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
    const plan = MOCK_PLANES_ESTUDIO.find((p) => p.id === prog.planEstudioId) || MOCK_PLANES_ESTUDIO[0];
    this.planVisualizado.set(plan);
    this.asignaturasPlan.set(MOCK_ASIGNATURAS_PLAN[plan.id] || MOCK_ASIGNATURAS_PLAN['PLAN-SIS-2024'] || []);
  }
}
