import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminManagementService } from '../../../core/services/admin-management.service';
import { CoordinatorManagementService } from '../../../core/services/coordinator-management.service';
import { ToastService } from '../../../shared/components/toast/toast.component';
import {
  SedeInstitucionalItem,
  EspacioFisicoItem,
  FacultadItem,
  AreaConocimientoItem,
} from '../../../core/models/role-management.model';
import { CatalogSedesComponent } from './components/catalog-sedes.component';
import { CatalogEspaciosComponent } from './components/catalog-espacios.component';
import { CatalogFacultadesComponent } from './components/catalog-facultades.component';
import { CatalogAreasComponent } from './components/catalog-areas.component';

type TabCatalogo = 'SEDES' | 'ESPACIOS' | 'FACULTADES' | 'AREAS';

@Component({
  selector: 'app-admin-catalogs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    CatalogSedesComponent,
    CatalogEspaciosComponent,
    CatalogFacultadesComponent,
    CatalogAreasComponent,
  ],
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
      </div>

      <!-- ================= TABS SELECTOR ================= -->
      <div class="flex border-b border-warm-200 gap-2 bg-white px-2 rounded-2xl shadow-warm-xs overflow-x-auto">
        <button
          type="button"
          (click)="tabActiva.set('SEDES')"
          [class]="tabActiva() === 'SEDES' ? 'border-primary-700 text-primary-800 font-bold border-b-2' : 'text-warm-500 hover:text-warm-700'"
          class="px-4 py-3 text-sm flex items-center gap-2 transition-colors whitespace-nowrap"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span>Sedes Institucionales ({{ sedes().length }})</span>
        </button>

        <button
          type="button"
          (click)="tabActiva.set('ESPACIOS')"
          [class]="tabActiva() === 'ESPACIOS' ? 'border-primary-700 text-primary-800 font-bold border-b-2' : 'text-warm-500 hover:text-warm-700'"
          class="px-4 py-3 text-sm flex items-center gap-2 transition-colors whitespace-nowrap"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
          </svg>
          <span>Aulas y Espacios Físicos ({{ espacios().length }})</span>
        </button>

        <button
          type="button"
          (click)="tabActiva.set('FACULTADES')"
          [class]="tabActiva() === 'FACULTADES' ? 'border-primary-700 text-primary-800 font-bold border-b-2' : 'text-warm-500 hover:text-warm-700'"
          class="px-4 py-3 text-sm flex items-center gap-2 transition-colors whitespace-nowrap"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span>Facultades ({{ facultades().length }})</span>
        </button>

        <button
          type="button"
          (click)="tabActiva.set('AREAS')"
          [class]="tabActiva() === 'AREAS' ? 'border-primary-700 text-primary-800 font-bold border-b-2' : 'text-warm-500 hover:text-warm-700'"
          class="px-4 py-3 text-sm flex items-center gap-2 transition-colors whitespace-nowrap"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Áreas de Conocimiento ({{ areas().length }})</span>
        </button>
      </div>

      <!-- ================= CONTENIDO DE CADA CATÁLOGO ================= -->
      @if (tabActiva() === 'SEDES') {
        <app-catalog-sedes
          [sedes]="sedes()"
          (save)="guardarSede($event)"
          (toggle)="toggleEstadoSede($event)"
        />
      }

      @if (tabActiva() === 'ESPACIOS') {
        <app-catalog-espacios
          [espacios]="espacios()"
          [sedes]="sedes()"
          (save)="guardarEspacio($event)"
        />
      }

      @if (tabActiva() === 'FACULTADES') {
        <app-catalog-facultades
          [facultades]="facultades()"
          [planes]="planes()"
          [getAsignaturasPlan]="getAsignaturasPlanFn"
          (save)="guardarFacultad($event)"
          (toggle)="toggleEstadoFacultad($event)"
        />
      }

      @if (tabActiva() === 'AREAS') {
        <app-catalog-areas
          [areas]="areas()"
          [facultades]="facultades()"
          (save)="guardarArea($event)"
          (toggle)="toggleEstadoArea($event)"
        />
      }
    </div>
  `,
})
export class AdminCatalogsComponent {
  private adminService = inject(AdminManagementService);
  private coordService = inject(CoordinatorManagementService);
  private toast = inject(ToastService);

  tabActiva = signal<TabCatalogo>('SEDES');

  sedes = this.adminService.sedes;
  espacios = this.adminService.espacios;
  facultades = this.adminService.facultades;
  areas = this.adminService.areas;
  planes = this.coordService.planes;

  getAsignaturasPlanFn = (planId: string) => this.coordService.getAsignaturasPlan(planId);

  // Sedes
  guardarSede(event: { id?: string; datos: any }): void {
    if (event.id) {
      this.adminService.actualizarSede(event.id, event.datos);
      this.toast.success('Sede institucional actualizada correctamente');
    } else {
      this.adminService.crearSede(event.datos);
      this.toast.success('Sede institucional registrada con éxito');
    }
  }

  toggleEstadoSede(sede: SedeInstitucionalItem): void {
    this.adminService.cambiarEstadoSede(sede.id);
    this.toast.info(`Estado de la sede cambiado a ${sede.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'}`);
  }

  // Espacios
  guardarEspacio(event: { id?: string; datos: any }): void {
    if (event.id) {
      this.adminService.actualizarEspacio(event.id, event.datos);
      this.toast.success('Espacio físico actualizado');
    } else {
      this.adminService.crearEspacio(event.datos);
      this.toast.success('Espacio físico registrado exitosamente');
    }
  }

  // Facultades
  guardarFacultad(event: { id?: string; datos: any }): void {
    if (event.id) {
      this.adminService.actualizarFacultad(event.id, event.datos);
      this.toast.success('Facultad actualizada');
    } else {
      this.adminService.crearFacultad(event.datos);
      this.toast.success('Facultad registrada');
    }
  }

  toggleEstadoFacultad(fac: FacultadItem): void {
    this.adminService.cambiarEstadoFacultad(fac.id);
    this.toast.info(`Estado de la facultad cambiado a ${fac.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'}`);
  }

  // Áreas
  guardarArea(event: { id?: string; datos: any }): void {
    if (event.id) {
      this.adminService.actualizarArea(event.id, event.datos);
      this.toast.success('Área de conocimiento actualizada');
    } else {
      this.adminService.crearArea(event.datos);
      this.toast.success('Área de conocimiento registrada');
    }
  }

  toggleEstadoArea(area: AreaConocimientoItem): void {
    this.adminService.cambiarEstadoArea(area.id);
    this.toast.info(`Estado del área cambiado a ${area.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'}`);
  }
}
