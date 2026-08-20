import { Component, signal, computed, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService } from '../../../core/services/attendance.service';
import { StudentService } from '../../../core/services/student.service';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { FormSelectComponent, SelectOption } from '../../../shared/components/form-select/form-select.component';
import { SessionService } from '../../../core/services/session.service';
import { CatalogService } from '../../../core/services/catalog.service';
import { CourseService } from '../../../core/services/course.service';
import { Course } from '../../../core/models/course.model';
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
    AvatarComponent,
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
              @if (currentSession()?.status === 'CONCLUIDA') {
                <app-badge variant="neutral" size="sm">🔒 Asistencia Consolidada</app-badge>
              } @else {
                <app-badge variant="success" size="sm">🟢 Clase Activa</app-badge>
              }
              <span class="text-xs font-bold text-warm-500 uppercase tracking-widest">
                {{ currentCourse()?.code }} • {{ currentCourse()?.section }}
              </span>
            </div>
            <h1 class="font-serif text-xl sm:text-2xl font-bold text-warm-900 tracking-tight">
              Control de Asistencia
            </h1>
          </div>

          <div class="flex items-center gap-2">
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
              [options]="courseOptions()"
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

      <!-- 2. Barra Unificada Compacta: Buscador + Filtros -->
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
            (click)="filterStatus.set('AN')"
            [class]="filterBtnClasses('AN')"
          >
            Asistencia Normal
          </button>
          <button
            type="button"
            (click)="filterStatus.set('SJC')"
            [class]="filterBtnClasses('SJC')"
          >
            Sin Justa Causa
          </button>
          <button
            type="button"
            (click)="filterStatus.set('EX')"
            [class]="filterBtnClasses('EX')"
          >
            Excusa
          </button>
        </div>
      </section>

      <!-- 3. Lista de Estudiantes -->
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
                  <app-avatar [name]="student.studentName"></app-avatar>
                  <div class="min-w-0">
                    <p class="font-semibold text-warm-900 text-xs truncate leading-tight">{{ student.studentName }}</p>
                    <p class="text-[10px] font-mono text-warm-500 mt-0.5">{{ student.studentCode }}</p>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  (click)="setStatus(student.studentId, 'AN')"
                  [class]="mobileStatusBtnClasses(student.status, 'AN')"
                >
                  🟢 Asistencia Normal
                </button>
                <button
                  type="button"
                  (click)="setStatus(student.studentId, 'SJC')"
                  [class]="mobileStatusBtnClasses(student.status, 'SJC')"
                >
                  🔴 Sin Justa Causa
                </button>
                <button
                  type="button"
                  (click)="setStatus(student.studentId, 'EX')"
                  [class]="mobileStatusBtnClasses(student.status, 'EX')"
                >
                  🔵 Excusa
                </button>
              </div>
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
                    <th class="py-3 px-4 text-center">Estado de Asistencia</th>
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
                          <app-avatar [name]="student.studentName"></app-avatar>
                          <div>
                            <p class="font-semibold text-warm-900 text-xs flex items-center gap-1.5">
                              {{ student.studentName }}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td class="py-2.5 px-4 font-mono font-medium text-warm-600">
                        {{ student.studentCode }}
                      </td>

                      <td class="py-2.5 px-4">
                        <div class="flex items-center justify-center gap-1.5 bg-warm-100/80 p-0.5 rounded-xl border border-warm-200/80 max-w-fit mx-auto shadow-xs">
                          <button
                            type="button"
                            (click)="setStatus(student.studentId, 'AN')"
                            [class]="segmentedChipClasses(student.status, 'AN')"
                          >
                            Asistencia Normal
                          </button>
                          <button
                            type="button"
                            (click)="setStatus(student.studentId, 'SJC')"
                            [class]="segmentedChipClasses(student.status, 'SJC')"
                          >
                            Sin Justa Causa
                          </button>
                          <button
                            type="button"
                            (click)="setStatus(student.studentId, 'EX')"
                            [class]="segmentedChipClasses(student.status, 'EX')"
                          >
                            Excusa
                          </button>
                        </div>
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

        <app-form-field label="Tipo de Documento" [required]="true">
          <app-form-select
            [options]="docTypeOptions()"
            [value]="newStudentDocType()"
            (valueChange)="newStudentDocType.set($event)"
            placeholder="Seleccione..."
          ></app-form-select>
        </app-form-field>

        <app-form-field label="Número de Identificación" [required]="true">
          <input
            type="text"
            maxlength="10"
            [ngModel]="newStudentCode()"
            (ngModelChange)="newStudentCode.set($event)"
            name="newStudentCode"
            placeholder="Ej. 1017123456"
            class="w-full bg-white text-warm-900 border border-warm-300 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </app-form-field>

        <!-- Primer y Segundo Nombre -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <app-form-field label="Primer Nombre" [required]="true">
            <input
              type="text"
              [ngModel]="newStudentFirstName()"
              (ngModelChange)="newStudentFirstName.set($event)"
              name="newStudentFirstName"
              placeholder="Ej. Juan"
              class="w-full bg-white text-warm-900 border border-warm-300 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </app-form-field>

          <app-form-field label="Segundo Nombre (Opcional)">
            <input
              type="text"
              [ngModel]="newStudentSecondName()"
              (ngModelChange)="newStudentSecondName.set($event)"
              name="newStudentSecondName"
              placeholder="Ej. Carlos"
              class="w-full bg-white text-warm-900 border border-warm-300 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </app-form-field>
        </div>

        <!-- Primer y Segundo Apellido -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <app-form-field label="Primer Apellido" [required]="true">
            <input
              type="text"
              [ngModel]="newStudentLastName()"
              (ngModelChange)="newStudentLastName.set($event)"
              name="newStudentLastName"
              placeholder="Ej. Pérez"
              class="w-full bg-white text-warm-900 border border-warm-300 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </app-form-field>

          <app-form-field label="Segundo Apellido (Opcional)">
            <input
              type="text"
              [ngModel]="newStudentSecondLastName()"
              (ngModelChange)="newStudentSecondLastName.set($event)"
              name="newStudentSecondLastName"
              placeholder="Ej. Gómez"
              class="w-full bg-white text-warm-900 border border-warm-300 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </app-form-field>
        </div>

        <app-form-field label="Correo Electrónico Institucional" [required]="true">
          <input
            type="email"
            [ngModel]="newStudentEmail()"
            (ngModelChange)="newStudentEmail.set($event)"
            name="newStudentEmail"
            placeholder="juan.perez@uco.edu.co"
            class="w-full bg-white text-warm-900 border border-warm-300 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </app-form-field>

        <div modal-footer class="flex items-center justify-end gap-2 w-full pt-2">
          <app-button variant="ghost" size="sm" (clicked)="isRegisterModalOpen.set(false)">
            Cancelar
          </app-button>
          <app-button variant="primary" size="sm" type="submit" [loading]="isEnrolling()">
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
  private courseService = inject(CourseService);

  courses: Course[] = [];
  sessions = signal<ClassSession[]>([]);

  selectedCourseId = signal<string>('');
  selectedSessionId = signal<string>('');

  searchQuery = signal<string>('');
  filterStatus = signal<'TODOS' | AttendanceStatus>('TODOS');

  isLoadingSession = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  showKeyboardHelper = signal<boolean>(false);
  activeFocusedIndex = signal<number>(0);

  private catalogService = inject(CatalogService);

  isRegisterModalOpen = signal<boolean>(false);
  isEnrolling = signal<boolean>(false);

  newStudentDocType = signal<string>('');
  newStudentCode = signal<string>('');
  newStudentFirstName = signal<string>('');
  newStudentSecondName = signal<string>('');
  newStudentLastName = signal<string>('');
  newStudentSecondLastName = signal<string>('');
  newStudentEmail = signal<string>('');

  docTypes = signal<any[]>([]);

  showToast = signal<boolean>(false);
  toastMessage = signal<string>('');
  toastType = signal<'success' | 'info' | 'warning' | 'error'>('success');
  private toastRotationIndex = 0;

  courseOptions = signal<SelectOption[]>([]);

  docTypeOptions = computed<SelectOption[]>(() =>
    this.docTypes().map((dt) => ({
      value: dt.id,
      label: `${dt.tipoIdentificacion} - ${dt.nombre}`,
    }))
  );

  constructor() {
    this.catalogService.getIdentityDocumentTypes().subscribe({
      next: (res) => {
        if (res.exitoso && res.datos) {
          this.docTypes.set(res.datos);
          if (res.datos.length > 0) {
            this.newStudentDocType.set(res.datos[0].id);
          }
        }
      },
    });

    this.courseService.getTeacherCourses().subscribe({
      next: (res) => {
        if (res.exitoso && res.datos) {
          this.courses = res.datos;
          this.courseOptions.set(
            res.datos.map((c) => ({
              value: c.id,
              label: `${c.code} - ${c.name} (${c.section})`,
            }))
          );
          if (res.datos.length > 0) {
            this.onCourseSelect(res.datos[0].id);
          }
        }
      },
    });
  }

  sessionOptions = computed<SelectOption[]>(() => {
    const courseId = this.selectedCourseId();
    return this.sessions()
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
    const statusOrder: AttendanceStatus[] = ['AN', 'SJC', 'EX'];

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
      this.setStatus(currentStudent.studentId, 'AN');
    } else if (event.key === '2') {
      this.setStatus(currentStudent.studentId, 'SJC');
    } else if (event.key === '3') {
      this.setStatus(currentStudent.studentId, 'EX');
    }
  }

  toggleKeyboardHelper() {
    this.showKeyboardHelper.update((val) => !val);
  }

  private sessionService = inject(SessionService);

  onCourseSelect(courseId: string) {
    this.selectedCourseId.set(courseId);
    this.isLoadingSession.set(true);

    this.studentService.getStudentsByGroup(courseId).subscribe({
      next: (stdRes) => {
        const records = stdRes.exitoso && stdRes.datos ? stdRes.datos : [];

        this.sessionService.getSessionsByGroup(courseId).subscribe({
          next: (sesRes) => {
            const sessionList = sesRes.exitoso && sesRes.datos ? sesRes.datos : [];

            const sessionsWithRecords = sessionList.map((session) => ({
              ...session,
              records,
            }));
            this.sessions.set(sessionsWithRecords);
            this.selectedSessionId.set(sessionsWithRecords[0]?.id || '');
            this.isLoadingSession.set(false);
          },
          error: () => {
            this.isLoadingSession.set(false);
          },
        });
      },
      error: () => {
        this.isLoadingSession.set(false);
      },
    });
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
              return { ...s, status };
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
            status: 'AN' as AttendanceStatus,
          }));
          return { ...session, records: updatedRecords };
        }
        return session;
      })
    );
    this.toastType.set('success');
    this.toastMessage.set('Inicialización completada: Todos los alumnos marcados con Asistencia Normal.');
    this.showToast.set(true);
  }

  markAllAbsent() {
    const sessionId = this.selectedSessionId();
    this.sessions.update((list) =>
      list.map((session) => {
        if (session.id === sessionId) {
          const updatedRecords = session.records.map((s) => ({
            ...s,
            status: 'SJC' as AttendanceStatus,
          }));
          return { ...session, records: updatedRecords };
        }
        return session;
      })
    );
    this.toastType.set('warning');
    this.toastMessage.set('Inicialización completada: Todos los alumnos marcados Sin Justa Causa.');
    this.showToast.set(true);
  }


  private attendanceService = inject(AttendanceService);
  private studentService = inject(StudentService);

  saveAttendance() {
    this.isSaving.set(true);
    const sessionId = this.selectedSessionId();
    const currentList = this.students();

    if (currentList.length === 0) {
      this.isSaving.set(false);
      this.toastType.set('warning');
      this.toastMessage.set('No hay estudiantes en la lista para registrar.');
      this.showToast.set(true);
      return;
    }

    this.attendanceService
      .saveAttendanceBatch(sessionId, currentList)
      .subscribe({
        next: (res) => {
          this.isSaving.set(false);
          // Marcar la sesión actual como CONCLUIDA
          this.sessions.update((list) =>
            list.map((s) => (s.id === sessionId ? { ...s, status: 'CONCLUIDA' } : s))
          );
          this.toastType.set('success');
          this.toastMessage.set(res.mensajeUsuario || '¡Éxito! Registro masivo de asistencia guardado en la base de datos.');
          this.showToast.set(true);
        },
        error: (err) => {
          this.isSaving.set(false);
          this.toastType.set('error');
          this.toastMessage.set(err?.error?.mensajeUsuario || 'Error al consolidar la asistencia masiva.');
          this.showToast.set(true);
        },
      });
  }


  onRegisterStudentSubmit(event: Event) {
    event.preventDefault();
    if (!this.newStudentDocType() || !this.newStudentCode() || !this.newStudentFirstName() || !this.newStudentLastName() || !this.newStudentEmail()) return;

    this.isEnrolling.set(true);
    const grupoId = this.selectedCourseId();
    if (!grupoId) {
      this.isEnrolling.set(false);
      this.toastType.set('error');
      this.toastMessage.set('Selecciona un grupo antes de matricular el estudiante.');
      this.showToast.set(true);
      return;
    }

    this.studentService
      .enrollStudentInGroup({
        grupo: grupoId,
        tipoDocumento: this.newStudentDocType(),
        numeroIdentificacion: this.newStudentCode(),
        primerNombre: this.newStudentFirstName(),
        segundoNombre: this.newStudentSecondName(),
        primerApellido: this.newStudentLastName(),
        segundoApellido: this.newStudentSecondLastName(),
        correoElectronico: this.newStudentEmail(),
      })
      .subscribe({
        next: (res) => {
          this.isEnrolling.set(false);
          this.isRegisterModalOpen.set(false);
          this.newStudentCode.set('');
          this.newStudentFirstName.set('');
          this.newStudentSecondName.set('');
          this.newStudentLastName.set('');
          this.newStudentSecondLastName.set('');
          this.newStudentEmail.set('');

          this.toastType.set('success');
          this.toastMessage.set(res.mensajeUsuario || '¡Estudiante matriculado exitosamente en el grupo!');
          this.showToast.set(true);

          if (grupoId) {
            this.onCourseSelect(grupoId);
          }
        },
        error: (err) => {
          this.isEnrolling.set(false);
          this.toastType.set('error');
          const errorMsg =
            err?.error?.message ||
            err?.error?.mensajeUsuario ||
            err?.error?.mensaje ||
            err?.message ||
            'Error al matricular el estudiante.';
          this.toastMessage.set(errorMsg);
          this.showToast.set(true);
        },
      });
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
      case 'AN':
        return `${base} bg-emerald-600 text-white border-emerald-700 shadow-xs scale-105`;
      case 'SJC':
        return `${base} bg-red-600 text-white border-red-700 shadow-xs scale-105`;
      case 'EX':
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
      case 'AN':
        return `${base} bg-emerald-600 text-white border-emerald-700 shadow-xs`;
      case 'SJC':
        return `${base} bg-red-600 text-white border-red-700 shadow-xs`;
      case 'EX':
        return `${base} bg-sky-600 text-white border-sky-700 shadow-xs`;
    }
  }
}
