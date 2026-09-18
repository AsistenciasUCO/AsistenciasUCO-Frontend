import { Component, ChangeDetectionStrategy, input, output, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlanEstudioItem, AsignaturaPlanItem } from '../../../../core/models/role-management.model';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { FormFieldComponent } from '../../../../shared/components/form-field/form-field.component';

@Component({
  selector: 'app-subject-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ButtonComponent, FormFieldComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between bg-white p-4 rounded-2xl border border-warm-200 shadow-warm-sm">
        <button
          type="button"
          (click)="cancel.emit()"
          class="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-warm-700 hover:text-warm-950 bg-warm-50 hover:bg-warm-100 border border-warm-200 px-3.5 py-2 rounded-xl transition-all shadow-xs"
        >
          <svg class="w-4 h-4 text-warm-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a Malla Curricular
        </button>

        <span class="text-xs font-bold text-primary-800 bg-primary-50 border border-primary-200 px-3 py-1 rounded-full">
          {{ modo() === 'CREAR' ? 'Nueva Asignatura' : 'Modificar Asignatura' }}
        </span>
      </div>

      <div class="bg-white p-6 sm:p-8 rounded-2xl border border-warm-200 shadow-warm-sm max-w-2xl mx-auto space-y-6">
        <div>
          <h2 class="font-serif font-bold text-2xl text-warm-900">
            {{ modo() === 'CREAR' ? 'Registro de Asignatura en el Plan' : 'Edición de Asignatura Curricular' }}
          </h2>
          <p class="text-sm text-warm-600 mt-1">
            Define el código, nombre, semestre de ubicación, créditos, horas y prerrequisitos académicos.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <app-form-field label="Código de la Asignatura" [required]="true">
            <input
              type="text"
              [(ngModel)]="asigForm.codigo"
              placeholder="Ej. SIS-301"
              class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </app-form-field>

          <app-form-field label="Semestre de Ubicación" [required]="true">
            <input
              type="number"
              [(ngModel)]="asigForm.semestre"
              min="1"
              [max]="plan().totalSemestres"
              class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </app-form-field>

          <div class="sm:col-span-2">
            <app-form-field label="Nombre de la Asignatura" [required]="true">
              <input
                type="text"
                [(ngModel)]="asigForm.nombre"
                placeholder="Ej. Bases de Datos Avanzadas"
                class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </app-form-field>
          </div>

          <app-form-field label="Créditos Académicos" [required]="true">
            <input
              type="number"
              [(ngModel)]="asigForm.creditos"
              min="1"
              max="10"
              class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </app-form-field>

          <app-form-field label="Horas Semanales Presenciales" [required]="true">
            <input
              type="number"
              [(ngModel)]="asigForm.horasSemanales"
              min="1"
              max="20"
              class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </app-form-field>

          <app-form-field label="Área de Conocimiento">
            <input
              type="text"
              [(ngModel)]="asigForm.area"
              placeholder="Ej. Ingeniería de Software, Hardware"
              class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </app-form-field>

          <app-form-field label="Componente Curricular">
            <select
              [(ngModel)]="asigForm.componente"
              class="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="Obligatoria">Obligatoria</option>
              <option value="Electiva">Electiva</option>
              <option value="Complementaria">Complementaria</option>
            </select>
          </app-form-field>

          <div class="sm:col-span-2 space-y-2">
            <app-form-field label="Prerrequisitos Académicos (Seleccionar del Plan)">
              <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <select
                  [(ngModel)]="prerrequisitoSeleccionadoDropdown"
                  class="flex-1 px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-warm-900"
                >
                  <option value="">-- Selecciona una asignatura como prerrequisito --</option>
                  @for (mat of asignaturasDisponiblesPrerrequisito(); track mat.id) {
                    <option [value]="mat.codigo" [disabled]="prerrequisitosSeleccionados().includes(mat.codigo)">
                      [{{ mat.codigo }}] {{ mat.nombre }} (Semestre {{ mat.semestre }})
                    </option>
                  }
                </select>

                <app-button
                  variant="secondary"
                  size="md"
                  [disabled]="!prerrequisitoSeleccionadoDropdown"
                  (clicked)="agregarPrerrequisito(prerrequisitoSeleccionadoDropdown)"
                >
                  <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Agregar
                </app-button>
              </div>
            </app-form-field>

            <!-- Chips / Badges de materias seleccionadas como prerrequisito -->
            <div class="p-3 bg-warm-50/70 border border-warm-200/80 rounded-xl">
              <span class="text-xs font-semibold text-warm-700 block mb-2">
                Prerrequisitos asignados ({{ prerrequisitosSeleccionados().length }}):
              </span>

              @if (prerrequisitosSeleccionados().length === 0) {
                <p class="text-xs text-warm-400 italic">
                  No se han seleccionado prerrequisitos para esta asignatura.
                </p>
              } @else {
                <div class="flex flex-wrap gap-2">
                  @for (codigoPrerreq of prerrequisitosSeleccionados(); track codigoPrerreq) {
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-white text-primary-900 border border-primary-200 rounded-lg text-xs font-medium shadow-xs">
                      <span class="font-mono font-bold text-primary-800">{{ codigoPrerreq }}</span>
                      <span class="text-warm-600">- {{ obtenerNombreMateriaPorCodigo(codigoPrerreq) }}</span>
                      <button
                        type="button"
                        (click)="eliminarPrerrequisito(codigoPrerreq)"
                        class="ml-1 text-warm-400 hover:text-red-600 focus:outline-none transition-colors"
                        title="Quitar prerrequisito"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  }
                </div>
              }
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 pt-4 border-t border-warm-100">
          <app-button variant="secondary" size="md" (clicked)="cancel.emit()">
            Cancelar
          </app-button>
          <app-button
            variant="primary"
            size="md"
            [disabled]="!asigForm.codigo.trim() || !asigForm.nombre.trim()"
            (clicked)="guardar()"
          >
            <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            {{ modo() === 'CREAR' ? 'Agregar Asignatura' : 'Guardar Cambios' }}
          </app-button>
        </div>
      </div>
    </div>
  `,
})
export class SubjectFormComponent implements OnInit {
  plan = input.required<PlanEstudioItem>();
  modo = input<'CREAR' | 'EDITAR'>('CREAR');
  asignatura = input<AsignaturaPlanItem | null>(null);
  asignaturasPlan = input<AsignaturaPlanItem[]>([]);

  save = output<{ datos: Partial<AsignaturaPlanItem>; id?: string }>();
  cancel = output<void>();

  prerrequisitosSeleccionados = signal<string[]>([]);
  prerrequisitoSeleccionadoDropdown = '';

  asigForm: {
    codigo: string;
    nombre: string;
    creditos: number;
    semestre: number;
    area: string;
    componente: 'Obligatoria' | 'Electiva' | 'Complementaria';
    horasSemanales: number;
  } = {
    codigo: '',
    nombre: '',
    creditos: 3,
    semestre: 1,
    area: 'Ingeniería de Software',
    componente: 'Obligatoria',
    horasSemanales: 4,
  };

  asignaturasDisponiblesPrerrequisito = computed(() => {
    const semActual = this.asigForm.semestre || 1;
    const codigoActual = this.asigForm.codigo.trim().toUpperCase();
    return this.asignaturasPlan().filter(
      (a) => a.semestre < semActual && a.codigo.toUpperCase() !== codigoActual
    );
  });

  ngOnInit(): void {
    const asig = this.asignatura();
    if (asig && this.modo() === 'EDITAR') {
      this.asigForm = {
        codigo: asig.codigo,
        nombre: asig.nombre,
        creditos: asig.creditos,
        semestre: asig.semestre,
        area: asig.area,
        componente: asig.componente,
        horasSemanales: asig.horasSemanales,
      };
      this.prerrequisitosSeleccionados.set([...asig.prerrequisitos]);
    }
  }

  agregarPrerrequisito(codigo: string): void {
    const cod = (codigo || '').trim().toUpperCase();
    if (!cod) return;
    const actuales = this.prerrequisitosSeleccionados();
    if (!actuales.includes(cod)) {
      this.prerrequisitosSeleccionados.set([...actuales, cod]);
    }
    this.prerrequisitoSeleccionadoDropdown = '';
  }

  eliminarPrerrequisito(codigo: string): void {
    this.prerrequisitosSeleccionados.update((lista) => lista.filter((c) => c !== codigo));
  }

  obtenerNombreMateriaPorCodigo(codigo: string): string {
    const encontrada = this.asignaturasPlan().find((a) => a.codigo.toUpperCase() === codigo.toUpperCase());
    return encontrada ? encontrada.nombre : codigo;
  }

  guardar(): void {
    this.save.emit({
      datos: {
        ...this.asigForm,
        prerrequisitos: [...this.prerrequisitosSeleccionados()],
      },
      id: this.asignatura()?.id,
    });
  }
}
