import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeComponent } from '../../../../shared/components/badge/badge.component';

@Component({
  selector: 'app-teacher-grupo-reclamos',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, BadgeComponent],
  template: `
    <div class="bg-white rounded-b-2xl border-x border-b border-warm-200 shadow-warm-sm p-6 space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-warm-100">
        <div>
          <h3 class="font-serif font-bold text-lg text-warm-900">Solicitudes de Revisión y Justificaciones</h3>
          <p class="text-xs text-warm-500">Inasistencias y retardos reportados por estudiantes para este curso.</p>
        </div>
        <button
          type="button"
          (click)="irAReclamos.emit()"
          class="text-xs font-semibold text-primary-800 hover:text-primary-950 bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-200 inline-flex items-center gap-1.5 transition-colors"
        >
          Abrir Portal de Reclamos Completo →
        </button>
      </div>

      @if (cargando()) {
        <div class="p-6 space-y-3">
          @for (n of [1, 2]; track n) {
            <div class="h-16 bg-warm-100 rounded-xl animate-pulse"></div>
          }
        </div>
      } @else if (reclamos().length === 0) {
        <div class="p-12 text-center text-warm-400">
          <p class="text-sm">No hay justificaciones ni reclamos pendientes en este grupo.</p>
        </div>
      } @else {
        <div class="space-y-3">
          @for (rec of reclamos(); track rec.id) {
            <div class="p-4 rounded-xl border border-warm-200 bg-warm-50/50 space-y-2">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-warm-100 text-warm-800">
                    REC-#{{ rec.id.slice(0, 8).toUpperCase() }}
                  </span>
                  <span class="text-xs font-bold text-warm-900">{{ rec.estudianteNombre }}</span>
                </div>
                <app-badge [variant]="rec.estadoSolicitud === 'PENDIENTE' ? 'warning' : (rec.estadoSolicitud === 'APROBADA' ? 'success' : 'danger')">
                  {{ rec.estadoSolicitud }}
                </app-badge>
              </div>
              <p class="text-xs text-warm-700 italic">"{{ rec.justificacionSolicitud }}"</p>
              <div class="text-[11px] text-warm-500 flex items-center justify-between pt-1 border-t border-warm-200/60">
                <span>Categoría: {{ rec.categoria || 'Médico / Salud' }}</span>
                <span>Fecha: {{ rec.fechaSolicitud }}</span>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class TeacherGrupoReclamosComponent {
  reclamos = input<any[]>([]);
  cargando = input<boolean>(false);
  irAReclamos = output<void>();
}
