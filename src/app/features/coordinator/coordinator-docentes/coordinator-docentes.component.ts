import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CoordinatorManagementService } from '../../../core/services/coordinator-management.service';
import { DocenteItem } from '../../../core/models/role-management.model';
import { CardComponent } from '../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { ToastService } from '../../../shared/components/toast/toast.component';

type VistaCoordinador = 'LISTA' | 'REGISTRO';

@Component({
  selector: 'app-coordinator-docentes',
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
      <!-- 1. VISTA: LISTA DE DOCENTES -->
      @if (vistaActual() === 'LISTA') {
        <!-- Header Bento -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-warm-200/80 shadow-warm-sm">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-900 border border-primary-200">
                Coordinación de Programa
              </span>
              <span class="text-xs text-warm-400">•</span>
              <span class="text-xs font-medium text-warm-500">Cuerpo Profesoral</span>
            </div>
            <h1 class="font-serif font-bold text-2xl sm:text-3xl text-warm-900 tracking-tight">
              Gestión de Docentes
            </h1>
            <p class="text-sm text-warm-600 mt-1">
              Administra los docentes vinculados al programa, sus especialidades y grupos asignados.
            </p>
          </div>

          <div class="flex items-center gap-3">
            <app-button variant="primary" size="md" (clicked)="abrirFormularioRegistro()">
              <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Vincular Docente
            </app-button>
          </div>
        </div>

        <!-- Filtros y Búsqueda -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="sm:col-span-2">
            <div class="relative">
              <input
                type="text"
                [(ngModel)]="searchQuery"
                placeholder="Buscar por nombre, especialidad o cédula..."
                class="w-full pl-10 pr-4 py-2.5 bg-white border border-warm-200 rounded-xl text-sm text-warm-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 shadow-warm-sm transition-all"
              />
              <svg class="w-4 h-4 text-warm-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div>
            <select
              [(ngModel)]="selectedEstado"
              class="w-full px-3.5 py-2.5 bg-white border border-warm-200 rounded-xl text-sm text-warm-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 shadow-warm-sm"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="ACTIVO">Solo Activos</option>
              <option value="INACTIVO">Solo Inactivos</option>
            </select>
          </div>
        </div>

        <!-- Grid de Docentes -->
        @if (isLoading()) {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            @for (n of [1, 2, 3, 4]; track n) {
              <div class="h-44 bg-warm-100 rounded-2xl animate-pulse"></div>
            }
          </div>
        } @else if (filteredDocentes().length === 0) {
          <div class="bg-white rounded-2xl border border-warm-200 p-12 text-center shadow-warm-sm">
            <div class="w-12 h-12 rounded-full bg-warm-100 text-warm-400 flex items-center justify-center mx-auto mb-3">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-base font-semibold text-warm-900">No se encontraron docentes</h3>
            <p class="text-xs text-warm-500 mt-1">Ajusta los términos de búsqueda o registra un nuevo docente.</p>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            @for (docente of filteredDocentes(); track docente.id) {
              <app-card [hoverable]="true" padding="md">
                <div class="flex flex-col h-full justify-between gap-4">
                  <div>
                    <div class="flex items-start justify-between gap-3 mb-2">
                      <div class="flex items-center gap-2">
                        <span class="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-warm-100 text-warm-700">
                          {{ docente.id }}
                        </span>
                        <app-badge [variant]="docente.estado === 'ACTIVO' ? 'success' : 'neutral'">
                          {{ docente.estado }}
                        </app-badge>
                      </div>

                      <button
                        type="button"
                        (click)="toggleEstado(docente)"
                        class="text-xs px-2.5 py-1 rounded-lg border border-warm-200 hover:bg-warm-100 text-warm-700 transition-colors"
                      >
                        {{ docente.estado === 'ACTIVO' ? 'Desactivar' : 'Reactivar' }}
                      </button>
                    </div>

                    <h3 class="font-serif font-bold text-lg text-warm-900 leading-snug">
                      {{ docente.nombres }} {{ docente.apellidos }}
                    </h3>
                    <p class="text-xs font-semibold text-primary-700 mt-0.5">
                      {{ docente.especialidad }}
                    </p>
                    <p class="text-xs text-warm-500 mt-0.5">{{ docente.departamento }}</p>
                  </div>

                  <!-- Insignia de Carga Académica -->
                  <div class="flex items-center justify-between p-2.5 rounded-xl bg-warm-50 border border-warm-100">
                    <span class="text-xs text-warm-600 font-medium">Grupos asignados este semestre:</span>
                    <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 text-primary-800 border border-primary-200">
                      {{ docente.totalGruposAsignados }} grupos
                    </span>
                  </div>

                  <div class="space-y-1 pt-2 border-t border-warm-100 text-xs text-warm-600">
                    <div class="flex items-center gap-2">
                      <svg class="w-3.5 h-3.5 text-warm-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                      <span>C.C. {{ docente.numeroIdentificacion }}</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <svg class="w-3.5 h-3.5 text-warm-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span class="truncate">{{ docente.correo }}</span>
                    </div>
                  </div>
                </div>
              </app-card>
            }
          </div>
        }
      }

      <!-- 2. VISTA COMPLETA: FORMULARIO DE VINCULACIÓN DE DOCENTE -->
      @if (vistaActual() === 'REGISTRO') {
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
            Volver a la Gestión de Docentes
          </button>

          <span class="text-xs font-bold text-primary-900 bg-primary-100 border border-primary-200 px-3 py-1 rounded-full">
            Vinculación Profesoral
          </span>
        </div>

        <div class="bg-white p-6 sm:p-8 rounded-2xl border border-warm-200 shadow-warm-sm max-w-3xl mx-auto space-y-6">
          <div>
            <h2 class="font-serif font-bold text-2xl text-warm-900">
              Vincular Nuevo Docente al Programa
            </h2>
            <p class="text-sm text-warm-600 mt-1">
              Registra los datos del docente, su área de especialidad y departamento académico adscrito.
            </p>
          </div>

          <form (ngSubmit)="guardarDocente()" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <app-form-field label="Nombres" [required]="true">
                <input
                  type="text"
                  [(ngModel)]="formData.nombres"
                  name="nombres"
                  required
                  placeholder="ej. María Elena"
                  class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </app-form-field>
              <app-form-field label="Apellidos" [required]="true">
                <input
                  type="text"
                  [(ngModel)]="formData.apellidos"
                  name="apellidos"
                  required
                  placeholder="ej. Rostagno Valencia"
                  class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </app-form-field>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <app-form-field label="Documento de Identidad (C.C.)" [required]="true">
                <input
                  type="text"
                  [(ngModel)]="formData.numeroIdentificacion"
                  name="numeroIdentificacion"
                  required
                  placeholder="ej. 1017112233"
                  class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </app-form-field>
              <app-form-field label="Especialidad / Área de Enfoque" [required]="true">
                <input
                  type="text"
                  [(ngModel)]="formData.especialidad"
                  name="especialidad"
                  placeholder="ej. Arquitectura de Software"
                  required
                  class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </app-form-field>
            </div>

            <app-form-field label="Correo Institucional UCO" [required]="true">
              <input
                type="email"
                [(ngModel)]="formData.correo"
                name="correo"
                placeholder="docente@uco.edu.co"
                required
                class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </app-form-field>

            <app-form-field label="Departamento Académico" [required]="true">
              <input
                type="text"
                [(ngModel)]="formData.departamento"
                name="departamento"
                required
                class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </app-form-field>

            <div class="flex items-center justify-end gap-3 pt-5 border-t border-warm-100">
              <app-button variant="secondary" size="md" type="button" (clicked)="volverALista()">
                Cancelar
              </app-button>
              <app-button variant="primary" size="md" type="submit" [disabled]="!formData.nombres || !formData.correo || !formData.especialidad">
                Guardar Docente
              </app-button>
            </div>
          </form>
        </div>
      }
    </div>
  `,
})
export class CoordinatorDocentesComponent implements OnInit {
  private coordService = inject(CoordinatorManagementService);
  private toast = inject(ToastService);

  vistaActual = signal<VistaCoordinador>('LISTA');
  docentes = signal<DocenteItem[]>([]);
  isLoading = signal<boolean>(true);
  searchQuery = '';
  selectedEstado = 'TODOS';

  formData: Omit<DocenteItem, 'id' | 'totalGruposAsignados'> = {
    numeroIdentificacion: '',
    nombres: '',
    apellidos: '',
    correo: '',
    departamento: 'Departamento de Ciencias Computacionales',
    especialidad: '',
    estado: 'ACTIVO',
  };

  filteredDocentes = computed(() => {
    const query = this.searchQuery.toLowerCase().trim();
    const estado = this.selectedEstado;

    return this.docentes().filter((item) => {
      const matchQuery =
        !query ||
        item.nombres.toLowerCase().includes(query) ||
        item.apellidos.toLowerCase().includes(query) ||
        item.especialidad.toLowerCase().includes(query) ||
        item.numeroIdentificacion.includes(query);

      const matchEstado = estado === 'TODOS' || item.estado === estado;

      return matchQuery && matchEstado;
    });
  });

  ngOnInit(): void {
    this.cargarDocentes();
  }

  cargarDocentes(): void {
    this.isLoading.set(true);
    this.coordService.getDocentes().subscribe({
      next: (res) => {
        this.docentes.set(res.datos || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toast.error('Error al cargar docentes.');
      },
    });
  }

  toggleEstado(docente: DocenteItem): void {
    this.coordService.toggleDocenteStatus(docente.id).subscribe({
      next: (res) => {
        if (res.exitoso && res.datos) {
          const updated = this.docentes().map((d) => (d.id === docente.id ? res.datos! : d));
          this.docentes.set(updated);
          this.toast.success(res.mensajeUsuario || 'Estado actualizado.');
        }
      },
      error: () => this.toast.error('Error al actualizar estado.'),
    });
  }

  abrirFormularioRegistro(): void {
    this.formData = {
      numeroIdentificacion: '',
      nombres: '',
      apellidos: '',
      correo: '',
      departamento: 'Departamento de Ciencias Computacionales',
      especialidad: '',
      estado: 'ACTIVO',
    };
    this.vistaActual.set('REGISTRO');
  }

  volverALista(): void {
    this.vistaActual.set('LISTA');
  }

  guardarDocente(): void {
    this.coordService.createDocente(this.formData).subscribe({
      next: (res) => {
        if (res.exitoso && res.datos) {
          this.docentes.set([res.datos, ...this.docentes()]);
          this.toast.success(res.mensajeUsuario || 'Docente registrado exitosamente.');
          this.volverALista();
        }
      },
      error: () => this.toast.error('Error al registrar docente.'),
    });
  }
}
