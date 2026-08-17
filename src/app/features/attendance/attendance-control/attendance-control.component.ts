import { Component, signal, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { FormSelectComponent, SelectOption } from '../../../shared/components/form-select/form-select.component';
import { MOCK_SESSIONS } from '../../../core/mocks/attendance.mock';
import { MOCK_COURSES } from '../../../core/mocks/course.mock';
import { ClassSession, StudentAttendance, AttendanceStatus } from '../../../core/models/attendance.model';

@Component({
  selector: 'app-attendance-control',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    ButtonComponent,
    BadgeComponent,
    ToastComponent,
    ModalComponent,
    FormFieldComponent,
    FormSelectComponent,
  ],
  template: `
    <div class="space-y-4 animate-fade-in max-w-7xl mx-auto pb-12 relative">
      <!-- 1. Header Compacto Consolidado: Curso, Sesión y Acciones (Alta Densidad Visual) -->
      <header class="bg-white p-4 sm:p-5 rounded-2xl border border-warm-200 shadow-warm-sm space-y-4">
        <!-- Fila Superior: Título + Botones de Gestión -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-warm-100 pb-3.5">
          <div>
            <div class="flex items-center gap-2 mb-0.5">
              <app-badge variant="success" size="sm">Clase Habilitada</app-badge>
              <span class="text-xs font-bold text-warm-500 uppercase tracking-widest">
                {{ currentCourse()?.code }} • {{ currentCourse()?.section }}
              </span>
            </div>
            <h1 class="font-serif text-xl sm:text-2xl font-bold text-warm-900 tracking-tight">
              Control de Asistencia
            </h1>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              (click)="toggleKeyboardHelper()"
              class="px-2.5 py-1.5 rounded-xl border border-warm-300 bg-warm-100/70 hover:bg-warm-200 text-warm-800 text-xs font-bold transition-all flex items-center gap-1"
              title="Atajos de teclado"
            >
              <kbd class="px-1 bg-white border border-warm-300 rounded text-[10px]">⌨️</kbd>
              <span class="hidden sm:inline">Atajos</span>
            </button>

            <app-button
              variant="accent"
              size="sm"
              (clicked)="markAllPresent()"
            >
              <svg class="w-4 h-4 mr-1 text-warm-950 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Todos Presentes
            </app-button>

            <app-button
              variant="danger"
              size="sm"
              (clicked)="markAllAbsent()"
            >
              <svg class="w-4 h-4 mr-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Todos Ausentes
            </app-button>

            <app-button
              variant="secondary"
              size="sm"
              (clicked)="isRegisterModalOpen.set(true)"
            >
              <svg class="w-4 h-4 mr-1 text-primary-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Matricular
            </app-button>
          </div>

        </div>

        <!-- Fila Inferior: Selectores de Curso / Sesión alineados -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-center text-xs">
          <div class="md:col-span-5">
            <app-form-select
              [options]="courseOptions"
              [value]="selectedCourseId()"
              (valueChange)="onCourseSelect($event)"
            ></app-form-select>
          </div>

          <div class="md:col-span-7">
            <app-form-select
              [options]="sessionOptions()"
              [value]="selectedSessionId()"
              (valueChange)="onSessionSelect($event)"
            ></app-form-select>
          </div>
        </div>
      </header>

      <!-- Guía Rápida de Atajos desplegable (Opcional) -->
      @if (showKeyboardHelper()) {
        <div class="bg-primary-950 text-white p-3 rounded-xl border border-primary-800 text-xs flex items-center justify-between gap-2 animate-fade-in">
          <span class="font-mono text-warm-200">
            Atajos: <kbd class="bg-black/40 px-1 rounded text-white font-bold">1-4</kbd> Estado |
            <kbd class="bg-black/40 px-1 rounded text-white font-bold">←/→</kbd> Rotar Estado |
            <kbd class="bg-black/40 px-1 rounded text-white font-bold">↓/↑</kbd> Mover Alumno
          </span>

          <button (click)="showKeyboardHelper.set(false)" class="text-warm-400 hover:text-white">✕</button>
        </div>
      }

      <!-- 2. Barra Unificada Compacta: Buscador + Contadores + Filtros (Inmediatamente sobre la lista) -->
      <section class="flex flex-col md:flex-row gap-3 items-center justify-between bg-white p-3.5 rounded-2xl border border-warm-200 shadow-warm-sm">
        <!-- Buscador -->
        <div class="relative w-full md:w-72">
          <input
            type="text"
            [ngModel]="searchQuery()"
            (ngModelChange)="searchQuery.set($event)"
            placeholder="Buscar por estudiante o código..."
            class="w-full bg-warm-50 text-warm-900 border border-warm-300 rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <svg class="w-4 h-4 text-warm-400 absolute left-2.5 top-2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <!-- Contadores Rápidos Tipo Badge (Sustituyen las tarjetas Bento altas) -->
        <div class="flex items-center gap-2 overflow-x-auto py-1 w-full md:w-auto">
          <span class="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs font-bold shrink-0">
            🟢 {{ presentCount() }} Pres. ({{ presentPercentage() }}%)
          </span>
          <span class="px-2.5 py-1 rounded-lg bg-red-50 text-red-800 border border-red-200/80 text-xs font-bold shrink-0">
            🔴 {{ absentCount() }} Faltas
          </span>
          <span class="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/80 text-xs font-bold shrink-0">
            🟡 {{ lateCount() }} Tard.
          </span>
          <span class="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-200/80 text-xs font-bold shrink-0">
            🔵 {{ excusedCount() }} Justif.
          </span>
        </div>

        <!-- Filtros Rápidos -->
        <div class="flex items-center bg-warm-100/80 p-1 rounded-xl gap-1 shrink-0 w-full md:w-auto justify-end">
          <button
            type="button"
            (click)="filterStatus.set('TODOS')"
            [class]="filterBtnClasses('TODOS')"
          >
            Todos ({{ students().length }})
          </button>
          <button
            type="button"
            (click)="filterStatus.set('PRESENTE')"
            [class]="filterBtnClasses('PRESENTE')"
          >
            Presentes
          </button>
          <button
            type="button"
            (click)="filterStatus.set('AUSENTE')"
            [class]="filterBtnClasses('AUSENTE')"
          >
            Ausentes
          </button>
        </div>
      </section>

      <!-- 3. Lista de Estudiantes (Inmediatamente visible sin scroll masivo) -->
      @if (isLoadingSession()) {
        <div class="space-y-2.5">
          @for (item of [1, 2, 3, 4]; track item) {
            <div class="bg-white p-3.5 rounded-2xl border border-warm-200 animate-pulse flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 bg-warm-200 rounded-xl shrink-0"></div>
                <div class="space-y-1.5">
                  <div class="h-3 w-36 bg-warm-200 rounded"></div>
                  <div class="h-2 w-20 bg-warm-200 rounded"></div>
                </div>
              </div>
              <div class="h-7 w-28 bg-warm-200 rounded-xl"></div>
            </div>
          }
        </div>
      } @else {
        <!-- VISTA MÓVIL (<640px) -->
        <div class="block sm:hidden space-y-2.5">
          @for (student of filteredStudents(); track student.studentId; let idx = $index) {
            <div
              (click)="activeFocusedIndex.set(idx)"
              [class]="mobileCardClasses(idx)"
            >
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-2.5 min-w-0">
                  <img
                    [src]="student.avatarUrl"
                    [alt]="student.studentName"
                    class="w-9 h-9 rounded-xl object-cover ring-1 ring-warm-200 shrink-0"
                  />
                  <div class="min-w-0">
                    <p class="font-semibold text-warm-900 text-xs truncate leading-tight">{{ student.studentName }}</p>
                    <p class="text-[10px] font-mono text-warm-500 mt-0.5">{{ student.studentCode }}</p>
                  </div>
                </div>
                @if (student.arrivalTime) {
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-warm-100 text-warm-700 shrink-0">
                    {{ student.arrivalTime }}
                  </span>
                }
              </div>

              <div class="grid grid-cols-4 gap-1.5">
                <button
                  type="button"
                  (click)="setStatus(student.studentId, 'PRESENTE')"
                  [class]="mobileStatusBtnClasses(student.status, 'PRESENTE')"
                >
                  🟢 Pres.
                </button>
                <button
                  type="button"
                  (click)="setStatus(student.studentId, 'AUSENTE')"
                  [class]="mobileStatusBtnClasses(student.status, 'AUSENTE')"
                >
                  🔴 Falta
                </button>
                <button
                  type="button"
                  (click)="setStatus(student.studentId, 'TARDANZA')"
                  [class]="mobileStatusBtnClasses(student.status, 'TARDANZA')"
                >
                  🟡 Tarde
                </button>
                <button
                  type="button"
                  (click)="setStatus(student.studentId, 'JUSTIFICADO')"
                  [class]="mobileStatusBtnClasses(student.status, 'JUSTIFICADO')"
                >
                  🔵 Just.
                </button>
              </div>

              <input
                type="text"
                [value]="student.notes || ''"
                (change)="updateNotes(student.studentId, $event)"
                placeholder="Añadir motivo..."
                class="w-full bg-warm-50 text-warm-900 border border-warm-200 rounded-xl px-3 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          }

          <!-- Botón Móvil de Guardado -->
          <div class="pt-2">
            <app-button
              variant="primary"
              size="md"
              [fullWidth]="true"
              [loading]="isSaving()"
              (clicked)="saveAttendance()"
            >
              Guardar y Consolidar Asistencia
            </app-button>
          </div>
        </div>

        <!-- VISTA ESCRITORIO (>=640px Tabla de Alta Densidad) -->
        <div class="hidden sm:block">
          <app-card padding="none">
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs text-warm-700">
                <thead class="bg-warm-100/70 border-b border-warm-200 uppercase text-[11px] font-bold text-warm-600 tracking-wider">
                  <tr>
                    <th class="py-3 px-4">Estudiante</th>
                    <th class="py-3 px-4">Código</th>
                    <th class="py-3 px-4">Hora Llegada</th>
                    <th class="py-3 px-4 text-center">Estado Segmentado</th>
                    <th class="py-3 px-4">Observación / Nota</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-warm-100">
                  @for (student of filteredStudents(); track student.studentId; let idx = $index) {
                    <tr
                      (click)="activeFocusedIndex.set(idx)"
                      [class]="desktopRowClasses(idx)"
                    >
                      <td class="py-2.5 px-4">
                        <div class="flex items-center gap-3">
                          <img
                            [src]="student.avatarUrl"
                            [alt]="student.studentName"
                            class="w-9 h-9 rounded-xl object-cover ring-1 ring-warm-200 shrink-0"
                          />
                          <div>
                            <p class="font-semibold text-warm-900 text-xs flex items-center gap-1.5">
                              {{ student.studentName }}
                              @if (activeFocusedIndex() === idx) {
                                <span class="px-1.5 py-0.5 rounded bg-primary-100 text-primary-800 text-[10px] font-mono font-bold">Foco</span>
                              }
                            </p>
                            <p class="text-[10px] text-warm-500 font-mono">Matemática III</p>
                          </div>
                        </div>
                      </td>

                      <td class="py-2.5 px-4 font-mono font-medium text-warm-600">
                        {{ student.studentCode }}
                      </td>

                      <td class="py-2.5 px-4 text-warm-600 font-medium">
                        {{ student.arrivalTime || '—' }}
                      </td>

                      <td class="py-2.5 px-4">
                        <div class="flex items-center justify-center gap-1 bg-warm-100/80 p-0.5 rounded-xl border border-warm-200/80 max-w-fit mx-auto shadow-xs">
                          <button
                            type="button"
                            (click)="setStatus(student.studentId, 'PRESENTE')"
                            [class]="segmentedChipClasses(student.status, 'PRESENTE')"
                          >
                            Presente
                          </button>
                          <button
                            type="button"
                            (click)="setStatus(student.studentId, 'AUSENTE')"
                            [class]="segmentedChipClasses(student.status, 'AUSENTE')"
                          >
                            Falta
                          </button>
                          <button
                            type="button"
                            (click)="setStatus(student.studentId, 'TARDANZA')"
                            [class]="segmentedChipClasses(student.status, 'TARDANZA')"
                          >
                            Tarde
                          </button>
                          <button
                            type="button"
                            (click)="setStatus(student.studentId, 'JUSTIFICADO')"
                            [class]="segmentedChipClasses(student.status, 'JUSTIFICADO')"
                          >
                            Justif.
                          </button>
                        </div>
                      </td>

                      <td class="py-2.5 px-4">
                        <input
                          type="text"
                          [value]="student.notes || ''"
                          (change)="updateNotes(student.studentId, $event)"
                          placeholder="Añadir nota..."
                          class="w-full bg-white text-warm-900 border border-warm-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- UNICO BOTÓN PRINCIPAL AL FINAL DE LA TABLA -->
            <div class="p-4 bg-warm-50/90 border-t border-warm-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span class="text-xs text-warm-600 font-medium">Fin del registro ({{ students().length }} alumnos en lista)</span>
              <app-button
                variant="primary"
                size="md"
                [loading]="isSaving()"
                (clicked)="saveAttendance()"
              >
                Guardar y Consolidar Asistencia
              </app-button>
            </div>
          </app-card>
        </div>
      }
    </div>

    <!-- MODAL: Matricular Estudiante -->
    <app-modal
      [isOpen]="isRegisterModalOpen()"
      title="Matricular Nuevo Estudiante"
      (closed)="isRegisterModalOpen.set(false)"
    >
      <form (submit)="onRegisterStudentSubmit($event)" class="space-y-4">
        <p class="text-xs text-warm-500">Registra directamente al alumno en la asignatura activa.</p>

        <app-form-field label="Apellidos y Nombres" [required]="true">
          <input
            type="text"
            [(ngModel)]="newStudentName"
            name="newStudentName"
            placeholder="Ej. Ramírez Méndez, Lucía Sofía"
            class="w-full bg-white text-warm-900 border border-warm-300 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </app-form-field>

        <app-form-field label="Código Estudiantil Institucional" [required]="true">
          <input
            type="text"
            [(ngModel)]="newStudentCode"
            name="newStudentCode"
            placeholder="2026-10450"
            class="w-full bg-white text-warm-900 border border-warm-300 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </app-form-field>

        <div modal-footer class="flex items-center justify-end gap-2 w-full pt-2">
          <app-button variant="ghost" size="sm" (clicked)="isRegisterModalOpen.set(false)">
            Cancelar
          </app-button>
          <app-button variant="primary" size="sm" type="submit">
            Matricular en Curso
          </app-button>
        </div>
      </form>
    </app-modal>

    <!-- Feedback Toast -->
    <app-toast
      [visible]="showToast()"
      [message]="toastMessage()"
      [type]="toastType()"
      (dismissed)="showToast.set(false)"
    ></app-toast>
  `,
})
export class AttendanceControlComponent {
  courses = MOCK_COURSES;
  sessions = signal<ClassSession[]>(MOCK_SESSIONS);

  selectedCourseId = signal<string>('crs-1');
  selectedSessionId = signal<string>('ses-101');

  searchQuery = signal<string>('');
  filterStatus = signal<'TODOS' | AttendanceStatus>('TODOS');

  isLoadingSession = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  showKeyboardHelper = signal<boolean>(false);
  activeFocusedIndex = signal<number>(0);

  isRegisterModalOpen = signal<boolean>(false);
  newStudentName = signal<string>('');
  newStudentCode = signal<string>('');

  showToast = signal<boolean>(false);
  toastMessage = signal<string>('');
  toastType = signal<'success' | 'info' | 'warning' | 'error'>('success');
  private toastRotationIndex = 0;

  courseOptions: SelectOption[] = MOCK_COURSES.map((c) => ({
    value: c.id,
    label: `${c.code} - ${c.name} (${c.section})`,
  }));

  sessionOptions = computed<SelectOption[]>(() => {
    const courseId = this.selectedCourseId();
    return this.sessions()
      .filter((s) => s.courseId === courseId)
      .map((s) => ({
        value: s.id,
        label: `Sesión #${s.sessionNumber} (${s.date}): ${s.title}`,
      }));
  });

  currentCourse = computed(() =>
    this.courses.find((c) => c.id === this.selectedCourseId())
  );

  currentSession = computed(() =>
    this.sessions().find((s) => s.id === this.selectedSessionId())
  );

  students = computed(() => this.currentSession()?.records || []);

  presentCount = computed(() => this.students().filter((s) => s.status === 'PRESENTE').length);
  absentCount = computed(() => this.students().filter((s) => s.status === 'AUSENTE').length);
  lateCount = computed(() => this.students().filter((s) => s.status === 'TARDANZA').length);
  excusedCount = computed(() => this.students().filter((s) => s.status === 'JUSTIFICADO').length);

  presentPercentage = computed(() => {
    const total = this.students().length;
    return total > 0 ? Math.round((this.presentCount() / total) * 100) : 0;
  });

  absentPercentage = computed(() => {
    const total = this.students().length;
    return total > 0 ? Math.round((this.absentCount() / total) * 100) : 0;
  });

  filteredStudents = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const filter = this.filterStatus();

    return this.students().filter((student) => {
      const matchesSearch =
        !query ||
        student.studentName.toLowerCase().includes(query) ||
        student.studentCode.toLowerCase().includes(query);

      const matchesStatus = filter === 'TODOS' || student.status === filter;

      return matchesSearch && matchesStatus;
    });
  });

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }

    const currentList = this.filteredStudents();
    if (currentList.length === 0) return;

    const idx = this.activeFocusedIndex();
    const currentStudent = currentList[idx];
    const statusOrder: AttendanceStatus[] = ['PRESENTE', 'AUSENTE', 'TARDANZA', 'JUSTIFICADO'];

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeFocusedIndex.set((idx + 1) % currentList.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeFocusedIndex.set((idx - 1 + currentList.length) % currentList.length);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      const currentPos = statusOrder.indexOf(currentStudent.status);
      const nextStatus = statusOrder[(currentPos + 1) % statusOrder.length];
      this.setStatus(currentStudent.studentId, nextStatus);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      const currentPos = statusOrder.indexOf(currentStudent.status);
      const prevStatus = statusOrder[(currentPos - 1 + statusOrder.length) % statusOrder.length];
      this.setStatus(currentStudent.studentId, prevStatus);
    } else if (event.key === '1') {
      this.setStatus(currentStudent.studentId, 'PRESENTE');
    } else if (event.key === '2') {
      this.setStatus(currentStudent.studentId, 'AUSENTE');
    } else if (event.key === '3') {
      this.setStatus(currentStudent.studentId, 'TARDANZA');
    } else if (event.key === '4') {
      this.setStatus(currentStudent.studentId, 'JUSTIFICADO');
    }
  }


  toggleKeyboardHelper() {
    this.showKeyboardHelper.update((val) => !val);
  }

  onCourseSelect(courseId: string) {
    this.selectedCourseId.set(courseId);
    const available = this.sessions().filter((s) => s.courseId === courseId);
    if (available.length > 0) {
      this.triggerSkeleton(() => {
        this.selectedSessionId.set(available[0].id);
      });
    }
  }

  onSessionSelect(sessionId: string) {
    this.triggerSkeleton(() => {
      this.selectedSessionId.set(sessionId);
    });
  }

  private triggerSkeleton(action: () => void) {
    this.isLoadingSession.set(true);
    action();
    setTimeout(() => {
      this.isLoadingSession.set(false);
    }, 300);
  }

  setStatus(studentId: string, status: AttendanceStatus) {
    const sessionId = this.selectedSessionId();
    this.sessions.update((list) =>
      list.map((session) => {
        if (session.id === sessionId) {
          const updatedRecords = session.records.map((s) => {
            if (s.studentId === studentId) {
              const arrivalTime = status === 'PRESENTE' || status === 'TARDANZA' ? '08:00 AM' : undefined;
              return { ...s, status, arrivalTime };
            }
            return s;
          });
          return { ...session, records: updatedRecords };
        }
        return session;
      })
    );
  }

  updateNotes(studentId: string, event: Event) {
    const notes = (event.target as HTMLInputElement).value;
    const sessionId = this.selectedSessionId();
    this.sessions.update((list) =>
      list.map((session) => {
        if (session.id === sessionId) {
          const updatedRecords = session.records.map((s) =>
            s.studentId === studentId ? { ...s, notes } : s
          );
          return { ...session, records: updatedRecords };
        }
        return session;
      })
    );
  }

  markAllPresent() {
    const sessionId = this.selectedSessionId();
    this.sessions.update((list) =>
      list.map((session) => {
        if (session.id === sessionId) {
          const updatedRecords = session.records.map((s) => ({
            ...s,
            status: 'PRESENTE' as AttendanceStatus,
            arrivalTime: '08:00 AM',
          }));
          return { ...session, records: updatedRecords };
        }
        return session;
      })
    );
    this.toastType.set('success');
    this.toastMessage.set('Inicialización completada: Todos los alumnos marcados como Presentes.');
    this.showToast.set(true);
  }

  markAllAbsent() {
    const sessionId = this.selectedSessionId();
    this.sessions.update((list) =>
      list.map((session) => {
        if (session.id === sessionId) {
          const updatedRecords = session.records.map((s) => ({
            ...s,
            status: 'AUSENTE' as AttendanceStatus,
            arrivalTime: undefined,
          }));
          return { ...session, records: updatedRecords };
        }
        return session;
      })
    );
    this.toastType.set('warning');
    this.toastMessage.set('Inicialización completada: Todos los alumnos marcados como Ausentes.');
    this.showToast.set(true);
  }


  saveAttendance() {
    this.isSaving.set(true);
    setTimeout(() => {
      this.isSaving.set(false);

      const toastDemos: Array<{ type: 'success' | 'info' | 'warning' | 'error'; msg: string }> = [
        { type: 'success', msg: '¡Éxito! Asistencia de la sesión guardada y consolidada.' },
        { type: 'info', msg: 'Información: Se envió una copia del reporte al departamento académico.' },
        { type: 'warning', msg: 'Atención: 2 estudiantes registran más de 3 inasistencias en el semestre.' },
        { type: 'error', msg: 'Error de Red: Simulación de fallo temporal de conexión con el servidor.' },
      ];

      const currentDemo = toastDemos[this.toastRotationIndex % toastDemos.length];
      this.toastRotationIndex++;

      this.toastType.set(currentDemo.type);
      this.toastMessage.set(currentDemo.msg);
      this.showToast.set(true);
    }, 600);
  }


  onRegisterStudentSubmit(event: Event) {
    event.preventDefault();
    if (!this.newStudentName() || !this.newStudentCode()) return;

    const newStudent: StudentAttendance = {
      studentId: `std-${Date.now()}`,
      studentName: this.newStudentName(),
      studentCode: this.newStudentCode(),
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      status: 'PRESENTE',
      arrivalTime: '08:05 AM',
    };

    const sessionId = this.selectedSessionId();
    this.sessions.update((list) =>
      list.map((session) => {
        if (session.id === sessionId) {
          return { ...session, records: [newStudent, ...session.records] };
        }
        return session;
      })
    );

    this.isRegisterModalOpen.set(false);
    this.newStudentName.set('');
    this.newStudentCode.set('');
    this.toastMessage.set('¡Estudiante matriculado y añadido a la lista!');
    this.showToast.set(true);
  }

  resetFilters() {
    this.searchQuery.set('');
    this.filterStatus.set('TODOS');
  }

  filterBtnClasses(target: 'TODOS' | AttendanceStatus) {
    const active = this.filterStatus() === target;
    return `px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
      active
        ? 'bg-white text-warm-900 shadow-xs'
        : 'text-warm-600 hover:text-warm-900'
    }`;
  }

  mobileCardClasses(idx: number) {
    const isFocused = this.activeFocusedIndex() === idx;
    return `bg-white p-3.5 rounded-2xl border transition-all space-y-2.5 cursor-pointer ${
      isFocused
        ? 'border-primary-500 ring-2 ring-primary-500/20 shadow-warm-md'
        : 'border-warm-200 shadow-warm-sm hover:border-warm-300'
    }`;
  }

  desktopRowClasses(idx: number) {
    const isFocused = this.activeFocusedIndex() === idx;
    return `transition-colors cursor-pointer ${
      isFocused ? 'bg-primary-50/70 font-medium' : 'hover:bg-warm-50/80'
    }`;
  }

  segmentedChipClasses(current: AttendanceStatus, target: AttendanceStatus) {
    const isSelected = current === target;
    const base = 'px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-150 border focus:outline-none focus:ring-2 focus:ring-primary-500 select-none';

    if (!isSelected) {
      return `${base} bg-white/80 text-warm-600 border-warm-200/80 hover:bg-warm-100 hover:text-warm-900`;
    }

    switch (target) {
      case 'PRESENTE':
        return `${base} bg-emerald-600 text-white border-emerald-700 shadow-xs scale-105`;
      case 'AUSENTE':
        return `${base} bg-red-600 text-white border-red-700 shadow-xs scale-105`;
      case 'TARDANZA':
        return `${base} bg-amber-500 text-white border-amber-600 shadow-xs scale-105`;
      case 'JUSTIFICADO':
        return `${base} bg-sky-600 text-white border-sky-700 shadow-xs scale-105`;
    }
  }

  mobileStatusBtnClasses(current: AttendanceStatus, target: AttendanceStatus) {
    const isSelected = current === target;
    const base = 'py-1.5 rounded-xl text-[11px] font-bold text-center transition-all border focus:outline-none focus:ring-2 focus:ring-primary-500';

    if (!isSelected) {
      return `${base} bg-warm-100 text-warm-600 border-warm-200`;
    }

    switch (target) {
      case 'PRESENTE':
        return `${base} bg-emerald-600 text-white border-emerald-700 shadow-xs`;
      case 'AUSENTE':
        return `${base} bg-red-600 text-white border-red-700 shadow-xs`;
      case 'TARDANZA':
        return `${base} bg-amber-500 text-white border-amber-600 shadow-xs`;
      case 'JUSTIFICADO':
        return `${base} bg-sky-600 text-white border-sky-700 shadow-xs`;
    }
  }
}
