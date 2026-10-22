import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EMPTY, catchError, debounceTime, switchMap, tap } from 'rxjs';
import { CoordinatorManagementService } from '../../../core/services/coordinator-management.service';
import { CatalogService, TipoIdentificacionItem } from '../../../core/services/catalog.service';
import { CourseService } from '../../../core/services/course.service';
import { Course } from '../../../core/models/course.model';
import {
  ActualizarDocentePayload,
  DocenteCandidato,
  DocentePrograma,
  TipoVinculacionItem,
  VincularDocenteExistentePayload,
  VincularDocenteNuevoPayload,
  VincularDocentePayload,
} from '../../../core/models/docente-programa.model';
import { CardComponent } from '../../../shared/components/card/card.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ToastService } from '../../../shared/components/toast/toast.component';
import { getApiErrorMessage } from '../../../core/api/errors/api-error.util';
import { CoordinatorDocenteFormModalComponent } from './components/coordinator-docente-form-modal.component';
import { CoordinatorDocenteEditModalComponent } from './components/coordinator-docente-edit-modal.component';

type FiltroEstado = 'TODOS' | 'ACTIVO' | 'INACTIVO';

const DEBOUNCE_MS = 300;
const MIN_CARACTERES_CANDIDATOS = 3;

@Component({
  selector: 'app-coordinator-docentes',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    BadgeComponent,
    ButtonComponent,
    PaginationComponent,
    CoordinatorDocenteFormModalComponent,
    CoordinatorDocenteEditModalComponent,
  ],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-warm-200/80 shadow-warm-sm">
        <div>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-900 border border-primary-200">
            Coordinación de Programa
          </span>
          <h1 class="font-serif font-bold text-2xl sm:text-3xl text-warm-900 tracking-tight mt-2">Gestión de Docentes</h1>
          <p class="text-sm text-warm-600 mt-1">Directorio de docentes vinculados a su programa, con su tipo de vinculación y grupos asignados.</p>
        </div>
        <app-button variant="primary" size="md" (clicked)="abrirFormulario()">Vincular docente</app-button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="sm:col-span-2">
          <input
            type="text"
            [ngModel]="busqueda()"
            (ngModelChange)="onBusquedaChange($event)"
            name="busquedaDocentes"
            maxlength="50"
            placeholder="Buscar por cédula o nombre..."
            class="w-full px-4 py-2.5 bg-white border border-warm-200 rounded-xl text-sm text-warm-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 shadow-warm-sm"
          />
        </div>
        <select
          [ngModel]="filtroEstado()"
          (ngModelChange)="onEstadoChange($event)"
          name="estadoDocentes"
          class="w-full px-3.5 py-2.5 bg-white border border-warm-200 rounded-xl text-sm text-warm-800 focus:outline-none focus:ring-2 focus:ring-primary-500/20 shadow-warm-sm"
        >
          <option value="TODOS">Todos los estados</option>
          <option value="ACTIVO">Solo activos</option>
          <option value="INACTIVO">Solo inactivos</option>
        </select>
      </div>

      @if (isLoading()) {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          @for (n of [1, 2, 3, 4]; track n) {
            <div class="h-44 bg-warm-100 rounded-2xl animate-pulse"></div>
          }
        </div>
      } @else if (docentes().length === 0) {
        <div class="bg-white rounded-2xl border border-warm-200 p-12 text-center shadow-warm-sm">
          <h3 class="text-base font-semibold text-warm-900">No se encontraron docentes</h3>
          <p class="text-xs text-warm-500 mt-1">Ajuste la búsqueda o vincule un docente al programa.</p>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          @for (docente of docentes(); track docente.idDocentePrograma) {
            <app-card [hoverable]="true" padding="md">
              <div class="flex flex-col h-full justify-between gap-4">
                <div>
                  <div class="flex items-start justify-between gap-3 mb-2">
                    <div class="flex items-center gap-2">
                      <app-badge [variant]="docente.estaActivo ? 'success' : 'neutral'">{{ docente.estaActivo ? 'ACTIVO' : 'INACTIVO' }}</app-badge>
                      <app-badge variant="neutral">{{ docente.nombreTipoVinculacion }}</app-badge>
                    </div>
                    <button
                      type="button"
                      data-testid="toggle-estado"
                      (click)="solicitarCambioEstado(docente)"
                      [title]="docente.estaActivo ? 'Inactivar la vinculación con el programa' : 'Reactivar la vinculación con el programa'"
                      class="text-xs px-2.5 py-1 rounded-lg border border-warm-200 text-warm-700 hover:bg-warm-100 transition-colors"
                    >
                      {{ docente.estaActivo ? 'Desactivar' : 'Reactivar' }}
                    </button>
                  </div>
                  <h3 class="font-serif font-bold text-lg text-warm-900 leading-snug">{{ docente.nombreCompleto }}</h3>
                  <p class="text-xs text-warm-500 mt-0.5">{{ docente.codigoTipoIdentificacion }} {{ docente.numeroIdentificacion }}</p>
                  <p class="text-xs text-warm-600 truncate">{{ docente.correo }}</p>
                </div>
                <div class="flex items-center justify-between p-2.5 rounded-xl bg-warm-50 border border-warm-100">
                  <span class="text-xs text-warm-600 font-medium">Grupos asignados en el programa:</span>
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 text-primary-800 border border-primary-200">
                    {{ docente.totalGruposPrograma }}
                  </span>
                </div>
                <button
                  type="button"
                  (click)="abrirEdicion(docente)"
                  class="w-full text-xs font-semibold text-warm-800 bg-white hover:bg-warm-50 border border-warm-200 py-1.5 px-3 rounded-xl transition-colors"
                >
                  Editar datos
                </button>
                <button
                  type="button"
                  (click)="verFichaDocente(docente)"
                  class="w-full text-xs font-semibold text-primary-800 bg-primary-50 hover:bg-primary-100 border border-primary-200 py-1.5 px-3 rounded-xl transition-colors"
                >
                  Ver materias y horarios →
                </button>
              </div>
            </app-card>
          }
        </div>
        <app-pagination
          [totalItems]="totalDocentes()"
          [pageSize]="tamano()"
          [currentPage]="pagina()"
          (pageChange)="onPageChange($event)"
          (pageSizeChange)="onPageSizeChange($event)"
        />
      }

      @if (docenteSeleccionado(); as seleccionado) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-warm-950/40 backdrop-blur-xs">
          <div class="bg-white border border-warm-200 rounded-3xl max-w-2xl w-full shadow-warm-xl overflow-hidden">
            <div class="p-6 bg-warm-50 border-b border-warm-200/80 flex items-start justify-between">
              <div>
                <h3 class="font-serif font-bold text-xl text-warm-900">{{ seleccionado.nombreCompleto }}</h3>
                <p class="text-xs text-warm-600 mt-0.5">
                  {{ seleccionado.codigoTipoIdentificacion }} {{ seleccionado.numeroIdentificacion }} • {{ seleccionado.correo }} • {{ seleccionado.nombreTipoVinculacion }}
                </p>
              </div>
              <button type="button" (click)="cerrarFichaDocente()" aria-label="Cerrar ficha" class="text-warm-400 hover:text-warm-700 p-1.5 rounded-xl hover:bg-warm-100">✕</button>
            </div>
            <div class="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
              <h4 class="font-serif font-bold text-base text-warm-900">Materias y grupos a cargo este período</h4>
              @if (cursosDocente().length === 0) {
                <p class="p-6 text-center text-xs text-warm-400 bg-warm-50 rounded-2xl border border-warm-100">No tiene grupos registrados para este período académico.</p>
              } @else {
                @for (curso of cursosDocente(); track curso.id) {
                  <div class="p-4 rounded-2xl border border-warm-200 bg-white">
                    <span class="font-mono text-xs font-bold px-2 py-0.5 rounded bg-warm-100 text-warm-800 mr-2">{{ curso.code }}</span>
                    <span class="text-xs font-semibold text-warm-500">{{ curso.section }}</span>
                    <h5 class="font-bold text-sm text-warm-900 mt-1">{{ curso.name }}</h5>
                    <p class="text-xs text-warm-600 mt-1">{{ curso.schedule }} • {{ curso.room }} • {{ curso.enrolledStudentsCount }} matriculados</p>
                  </div>
                }
              }
            </div>
          </div>
        </div>
      }

      @if (docentePendienteEstado(); as pendiente) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-warm-900/60 backdrop-blur-xs" role="dialog" aria-modal="true">
          <div class="bg-white rounded-3xl shadow-warm-2xl border border-warm-200/80 w-full max-w-md p-6 space-y-4">
            <h2 class="text-lg font-serif font-bold text-warm-900">
              {{ pendiente.estaActivo ? 'Inactivar vinculación' : 'Reactivar vinculación' }}
            </h2>
            <p class="text-sm text-warm-700">
              {{ pendiente.estaActivo
                  ? 'El docente ' + pendiente.nombreCompleto + ' dejará de poder ser asignado como titular de nuevos grupos de este programa. Sus grupos actuales y su cuenta de acceso no cambian.'
                  : 'El docente ' + pendiente.nombreCompleto + ' volverá a poder ser asignado como titular de grupos de este programa.' }}
            </p>
            <div class="flex justify-end gap-3 pt-2">
              <button type="button" (click)="cancelarCambioEstado()" class="px-4 py-2 rounded-xl text-sm font-semibold bg-warm-100 text-warm-800 hover:bg-warm-200">Cancelar</button>
              <button type="button" data-testid="confirmar-estado" (click)="confirmarCambioEstado()" class="px-4 py-2 rounded-xl text-sm font-semibold bg-primary-700 text-white hover:bg-primary-800">
                {{ pendiente.estaActivo ? 'Inactivar' : 'Reactivar' }}
              </button>
            </div>
          </div>
        </div>
      }

      @if (docenteEnEdicion(); as enEdicion) {
        <app-coordinator-docente-edit-modal
          [docente]="enEdicion"
          [tiposVinculacion]="tiposVinculacion()"
          (guardar)="guardarEdicion($event)"
          (cerrar)="cerrarEdicion()"
        />
      }

      @if (formularioAbierto()) {
        <app-coordinator-docente-form-modal
          [tiposIdentificacion]="tiposIdentificacion()"
          [tiposVinculacion]="tiposVinculacion()"
          [candidatos]="candidatos()"
          (guardarNuevo)="guardarNuevo($event)"
          (guardarExistente)="guardarExistente($event)"
          (buscarCandidatos)="buscarCandidatos($event)"
          (cerrar)="cerrarFormulario()"
        />
      }
    </div>
  `,
})
export class CoordinatorDocentesComponent implements OnInit {
  private readonly coordService = inject(CoordinatorManagementService);
  private readonly catalogService = inject(CatalogService);
  private readonly courseService = inject(CourseService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly docentes = this.coordService.docentes;
  readonly totalDocentes = this.coordService.totalDocentes;

  readonly busqueda = signal('');
  readonly filtroEstado = signal<FiltroEstado>('TODOS');
  readonly pagina = signal(1);
  readonly tamano = signal(10);
  private readonly recarga = signal(0);
  private cursosCargados = false;

  readonly isLoading = signal(true);
  readonly formularioAbierto = signal(false);
  readonly tiposIdentificacion = signal<TipoIdentificacionItem[]>([]);
  readonly tiposVinculacion = signal<TipoVinculacionItem[]>([]);
  readonly candidatos = signal<DocenteCandidato[]>([]);
  readonly allCourses = signal<Course[]>([]);
  readonly docenteSeleccionado = signal<DocentePrograma | null>(null);
  readonly docenteEnEdicion = signal<DocentePrograma | null>(null);
  readonly docentePendienteEstado = signal<DocentePrograma | null>(null);
  readonly cursosDocente = signal<Course[]>([]);

  private readonly consulta = computed(() => ({
    pagina: this.pagina(),
    tamano: this.tamano(),
    busqueda: this.busqueda().trim() || undefined,
    estaActivo: this.estaActivoDe(this.filtroEstado()),
    recarga: this.recarga(),
  }));

  constructor() {
    // Reactividad por signals: cada cambio de filtro/pagina reconsulta al servidor (sin timers de polling).
    toObservable(this.consulta)
      .pipe(
        debounceTime(DEBOUNCE_MS),
        tap(() => this.isLoading.set(true)),
        switchMap(({ pagina, tamano, busqueda, estaActivo }) =>
          this.coordService.getDocentesPrograma({ pagina, tamano, busqueda, estaActivo }).pipe(
            catchError((error: unknown) => {
              this.toast.error(getApiErrorMessage(error));
              this.isLoading.set(false);
              return EMPTY;
            })
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.isLoading.set(false));
  }

  ngOnInit(): void {
    this.catalogService.getTiposIdentificacion().subscribe({
      next: (res) => this.tiposIdentificacion.set(res.datos ?? []),
      error: (error: unknown) => this.toast.error(getApiErrorMessage(error)),
    });
    this.coordService.getTiposVinculacion().subscribe({
      next: (tipos) => this.tiposVinculacion.set(tipos),
      error: (error: unknown) => this.toast.error(getApiErrorMessage(error)),
    });
  }

  onBusquedaChange(valor: string): void {
    this.busqueda.set(valor ?? '');
    this.pagina.set(1);
  }

  onEstadoChange(estado: FiltroEstado): void {
    this.filtroEstado.set(estado);
    this.pagina.set(1);
  }

  onPageChange(pagina: number): void {
    this.pagina.set(pagina);
  }

  onPageSizeChange(tamano: number): void {
    this.tamano.set(tamano);
    this.pagina.set(1);
  }

  abrirFormulario(): void {
    this.candidatos.set([]);
    this.formularioAbierto.set(true);
  }

  cerrarFormulario(): void {
    this.formularioAbierto.set(false);
  }

  buscarCandidatos(texto: string): void {
    const busqueda = (texto ?? '').trim();
    if (busqueda.length < MIN_CARACTERES_CANDIDATOS) {
      this.candidatos.set([]);
      return;
    }
    this.coordService.getCandidatosDocente(busqueda).subscribe({
      next: (res) => this.candidatos.set(res.datos ?? []),
      error: (error: unknown) => {
        this.candidatos.set([]);
        this.toast.error(getApiErrorMessage(error));
      },
    });
  }

  guardarNuevo(payload: VincularDocenteNuevoPayload): void {
    this.vincular(payload);
  }

  guardarExistente(payload: VincularDocenteExistentePayload): void {
    this.vincular(payload);
  }

  solicitarCambioEstado(docente: DocentePrograma): void {
    this.docentePendienteEstado.set(docente);
  }

  cancelarCambioEstado(): void {
    this.docentePendienteEstado.set(null);
  }

  /** HU093. Sin actualizacion optimista: se espera la respuesta y se recarga la pagina desde el servidor. */
  confirmarCambioEstado(): void {
    const docente = this.docentePendienteEstado();
    if (!docente) {
      return;
    }
    this.docentePendienteEstado.set(null);
    this.coordService.cambiarEstadoDocente(docente.idDocente, !docente.estaActivo).subscribe({
      next: (res) => {
        this.toast.success(res.mensajeUsuario || 'Estado del docente actualizado.');
        this.recarga.update((n) => n + 1);
      },
      error: (error: unknown) => this.toast.error(getApiErrorMessage(error)),
    });
  }

  abrirEdicion(docente: DocentePrograma): void {
    this.docenteEnEdicion.set(docente);
  }

  cerrarEdicion(): void {
    this.docenteEnEdicion.set(null);
  }

  /** HU092. Sin actualizacion optimista: se espera la respuesta y se recarga la pagina desde el servidor. */
  guardarEdicion(payload: ActualizarDocentePayload): void {
    const docente = this.docenteEnEdicion();
    if (!docente) {
      return;
    }
    this.coordService.actualizarDocente(docente.idDocente, payload).subscribe({
      next: (res) => {
        this.toast.success(res.mensajeUsuario || 'Docente actualizado.');
        this.docenteEnEdicion.set(null);
        this.recarga.update((n) => n + 1);
      },
      error: (error: unknown) => this.toast.error(getApiErrorMessage(error)),
    });
  }

  /**
   * Los cursos se cargan solo al abrir la ficha (no al entrar a la pantalla): el endpoint de cursos es del portal
   * docente y un coordinador recibiria un 403 innecesario al listar el directorio.
   */
  verFichaDocente(docente: DocentePrograma): void {
    this.docenteSeleccionado.set(docente);
    if (this.cursosCargados) {
      this.cursosDocente.set(this.allCourses().filter((c) => c.docenteId === docente.idDocente));
      return;
    }
    this.cursosCargados = true;
    this.courseService.getTeacherCourses().subscribe({
      next: (res) => {
        this.allCourses.set(res.datos ?? []);
        this.cursosDocente.set(this.allCourses().filter((c) => c.docenteId === docente.idDocente));
      },
      error: () => {
        this.cursosCargados = false;
        this.allCourses.set([]);
        this.cursosDocente.set([]);
      },
    });
  }

  cerrarFichaDocente(): void {
    this.docenteSeleccionado.set(null);
    this.cursosDocente.set([]);
  }

  /** Sin actualizacion optimista: se espera la respuesta del backend y se recarga la pagina desde el servidor. */
  private vincular(payload: VincularDocentePayload): void {
    this.coordService.vincularDocente(payload).subscribe({
      next: (res) => {
        this.toast.success(res.mensajeUsuario || 'Docente vinculado al programa.');
        this.formularioAbierto.set(false);
        this.recarga.update((n) => n + 1);
      },
      error: (error: unknown) => this.toast.error(getApiErrorMessage(error)),
    });
  }

  private estaActivoDe(estado: FiltroEstado): boolean | undefined {
    if (estado === 'ACTIVO') {
      return true;
    }
    return estado === 'INACTIVO' ? false : undefined;
  }
}
