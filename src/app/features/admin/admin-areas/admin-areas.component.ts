import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminManagementService } from '../../../core/services/admin-management.service';
import { ToastService } from '../../../shared/components/toast/toast.component';
import { AreaConocimientoItem } from '../../../core/models/role-management.model';

/** HU151/HU152: administracion del catalogo de areas de conocimiento. */
@Component({
  selector: 'app-admin-areas',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="text-xs font-semibold text-warm-500 uppercase tracking-wider mb-1">Administración Institucional</div>
          <h1 class="text-2xl font-bold font-serif text-warm-900">Áreas de Conocimiento</h1>
          <p class="text-sm text-warm-600">Catálogo institucional de áreas de conocimiento asociadas a las asignaturas.</p>
        </div>
        <button
          type="button"
          (click)="abrirNuevo()"
          class="px-4 py-2.5 rounded-xl bg-primary-700 text-white text-sm font-bold hover:bg-primary-800 transition-colors"
        >
          Nueva área de conocimiento
        </button>
      </div>

      @if (formularioAbierto()) {
        <form
          class="bg-white rounded-2xl border border-warm-200 p-5 space-y-4"
          (ngSubmit)="guardar()"
        >
          <h2 class="font-serif font-bold text-warm-900">
            {{ edicion() ? 'Editar área de conocimiento' : 'Registrar área de conocimiento' }}
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label for="tp-codigo" class="block text-xs font-bold text-warm-700 uppercase mb-1">Código *</label>
              <input
                id="tp-codigo"
                name="codigo"
                type="text"
                maxlength="3"
                [(ngModel)]="form.codigo"
                [disabled]="edicion() !== null"
                placeholder="Ej: ISW"
                class="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-sm uppercase disabled:bg-warm-100"
              />
              <p class="text-[10px] text-warm-500 mt-1">3 caracteres alfanuméricos. No se puede modificar después de crear.</p>
            </div>
            <div class="sm:col-span-2">
              <label for="tp-nombre" class="block text-xs font-bold text-warm-700 uppercase mb-1">Nombre *</label>
              <input
                id="tp-nombre"
                name="nombre"
                type="text"
                maxlength="50"
                [(ngModel)]="form.nombre"
                placeholder="Ej: Ingeniería de Software"
                class="w-full px-3.5 py-2.5 rounded-xl border border-warm-200 text-sm"
              />
              <p class="text-[10px] text-warm-500 mt-1">Entre 3 y 50 caracteres.</p>
            </div>
          </div>
          <div class="flex justify-end gap-3">
            <button type="button" (click)="cancelar()" [disabled]="guardando()" class="px-4 py-2 rounded-xl border border-warm-200 text-sm font-semibold">
              Cancelar
            </button>
            <button type="submit" [disabled]="guardando()" class="px-4 py-2 rounded-xl bg-primary-700 text-white text-sm font-bold disabled:opacity-60">
              {{ guardando() ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      }

      <div class="bg-white rounded-2xl border border-warm-200 overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-warm-50 text-xs uppercase text-warm-600">
            <tr>
              <th class="text-left px-4 py-3">Código</th>
              <th class="text-left px-4 py-3">Nombre</th>
              <th class="text-left px-4 py-3">Estado</th>
              <th class="text-right px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (area of areas(); track area.id) {
              <tr class="border-t border-warm-100">
                <td class="px-4 py-3 font-mono font-bold">{{ area.codigo }}</td>
                <td class="px-4 py-3">{{ area.nombre }}</td>
                <td class="px-4 py-3">
                  <span
                    class="px-2 py-0.5 rounded-full text-xs font-bold"
                    [class]="area.activa ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'"
                  >
                    {{ area.activa ? 'Activa' : 'Inactiva' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-right space-x-2">
                  <button type="button" (click)="abrirEdicion(area)" class="text-primary-700 font-semibold">Editar</button>
                  <button
                    type="button"
                    (click)="alternarEstado(area)"
                    [disabled]="cambiandoEstadoId() === area.id"
                    class="font-semibold text-warm-700 disabled:opacity-60"
                  >
                    {{ area.activa ? 'Desactivar' : 'Activar' }}
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="4" class="px-4 py-8 text-center text-warm-500">No hay áreas de conocimiento registradas.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class AdminAreasComponent implements OnInit {
  private adminService = inject(AdminManagementService);
  private toast = inject(ToastService);

  areas = this.adminService.areas;
  formularioAbierto = signal(false);
  edicion = signal<AreaConocimientoItem | null>(null);
  guardando = signal(false);
  cambiandoEstadoId = signal<string | null>(null);
  form = { codigo: '', nombre: '' };

  ngOnInit(): void {
    this.adminService.cargarAreas().subscribe({
      error: (err) => this.toast.error(this.mensajeBackend(err, 'No fue posible cargar las áreas de conocimiento.')),
    });
  }

  abrirNuevo(): void {
    this.edicion.set(null);
    this.form = { codigo: '', nombre: '' };
    this.formularioAbierto.set(true);
  }

  abrirEdicion(area: AreaConocimientoItem): void {
    this.edicion.set(area);
    this.form = { codigo: area.codigo, nombre: area.nombre };
    this.formularioAbierto.set(true);
  }

  cancelar(): void {
    this.formularioAbierto.set(false);
  }

  guardar(): void {
    const nombre = this.form.nombre.trim();
    const codigo = this.form.codigo.trim();
    const enEdicion = this.edicion();
    const valido = nombre.length >= 3 && nombre.length <= 50 && (enEdicion !== null || /^[A-Za-z0-9]{3}$/.test(codigo));
    if (!valido || this.guardando()) return;

    this.guardando.set(true);
    const peticion = enEdicion
      ? this.adminService.actualizarArea(enEdicion.id, { nombre })
      : this.adminService.crearArea({ codigo, nombre });

    peticion.subscribe({
      next: (res) => {
        this.guardando.set(false);
        if (res.exitoso) {
          this.toast.success(
            enEdicion ? 'Área de conocimiento actualizada correctamente.' : 'Área de conocimiento registrada correctamente.'
          );
          this.formularioAbierto.set(false);
        } else {
          this.toast.error(res.mensajeUsuario || 'No fue posible guardar el área de conocimiento.');
        }
      },
      error: (err) => {
        this.guardando.set(false);
        this.toast.error(this.mensajeBackend(err, 'No fue posible guardar el área de conocimiento.'));
      },
    });
  }

  alternarEstado(area: AreaConocimientoItem): void {
    if (this.cambiandoEstadoId() !== null) return;
    const deseado = !area.activa;
    this.cambiandoEstadoId.set(area.id);
    this.adminService.cambiarEstadoArea(area.id, deseado).subscribe({
      next: (res) => {
        this.cambiandoEstadoId.set(null);
        if (res.exitoso) {
          this.toast.success(`Área de conocimiento ${deseado ? 'activada' : 'desactivada'} correctamente.`);
        } else {
          this.toast.error(res.mensajeUsuario || 'No fue posible cambiar el estado del área de conocimiento.');
        }
      },
      error: (err) => {
        this.cambiandoEstadoId.set(null);
        this.toast.error(this.mensajeBackend(err, 'No fue posible cambiar el estado del área de conocimiento.'));
      },
    });
  }

  /** El texto proviene del backend (ApiErrorResponse.message); la UI no interpreta ni traduce errores. */
  private mensajeBackend(err: any, respaldo: string): string {
    return err?.error?.message || err?.error?.mensajeUsuario || respaldo;
  }
}
