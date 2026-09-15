import { Component, signal, computed, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { StudentService } from '../../../core/services/student.service';
import { SessionService } from '../../../core/services/session.service';
import { AttendanceService } from '../../../core/services/attendance.service';
import { CoordinatorManagementService } from '../../../core/services/coordinator-management.service';
import { CardComponent } from '../../../shared/components/card/card.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { BadgeComponent } from '../../../shared/components/badge/badge.component';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { FormSelectComponent, SelectOption } from '../../../shared/components/form-select/form-select.component';
import { CatalogService } from '../../../core/services/catalog.service';
import { CourseService } from '../../../core/services/course.service';
import {
  getApiErrorMessage,
  getApiFieldError,
} from '../../../core/api/errors/api-error.util';
import { TipoIdentificacionApiDto } from '../../../core/api/models/tipo-identificacion-api-dto.model';
import { Course } from '../../../core/models/course.model';
import { ClassSession, AttendanceStatus } from '../../../core/models/attendance.model';
import { environment } from '../../../../environments/environment';
import {
  getPasswordValidationError,
  parseIdentificationNumber,
} from '../../../core/validation/request-form-validation.util';

type StudentEnrollmentField =
  | 'tipoIdentificacionId'
  | 'primerNombre'
  | 'segundoNombre'
  | 'primerApellido'
  | 'segundoApellido'
  | 'correo'
  | 'numeroIdentificacion'
  | 'password';

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
      @if (!sessionsEnabled || !attendanceEnabled) {
        <p class="text-xs text-warm-600 bg-warm-100 border border-warm-200 rounded-xl px-4 py-2" role="status">
          Las sesiones y la toma de asistencia están temporalmente deshabilitadas. La matrícula de estudiantes continúa disponible.
        </p>
      }

      <!-- 1. Header Compacto Consolidado: Curso, Sesión y Acciones (Alta Densidad Visual) -->
      <header class="bg-white p-4 sm:p-5 rounded-2xl border border-warm-200 shadow-warm-sm space-y-4">
        <!-- Fila Superior: Título + Botones de Gestión -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-warm-100 pb-3.5">
          <div>
            <div class="flex items-center gap-2 mb-0.5">
              @if (!sessionsEnabled || !attendanceEnabled) {
                <app-badge variant="neutral" size="sm">Sesiones deshabilitadas</app-badge>
              } @else if (currentSession()?.status === 'CONCLUIDA') {
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
              [disabled]="!sessionsEnabled || !attendanceEnabled"
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
              [disabled]="!sessionsEnabled || !attendanceEnabled"
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
              (clicked)="openStudentRegistration()"
            >
              <svg class="w-4 h-4 mr-1 text-primary-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Matricular
            </app-button>
          </div>

        </div>

        <!-- Fila Inferior: Selectores de Curso / Sesión alineados + Botón Nueva Sesión -->
        <div class="grid grid-cols-1 md:grid-cols-12 gap-3 items-center text-xs">
          <div class="md:col-span-5">
            <app-form-select
              [options]="courseOptions()"
              [value]="selectedCourseId()"
              (valueChange)="onCourseSelect($event)"
            ></app-form-select>
          </div>

          <div class="md:col-span-5">
            <app-form-select
              [options]="sessionOptions()"
              [value]="selectedSessionId()"
              [disabled]="!sessionsEnabled"
              (valueChange)="onSessionSelect($event)"
            ></app-form-select>
          </div>

          <div class="md:col-span-2 flex justify-end">
            <app-button
              variant="primary"
              size="sm"
              [disabled]="!selectedCourseId()"
              (clicked)="openNewSessionModal()"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              + Sesión
            </app-button>
          </div>
        </div>
      </header>

      @if (sessions().length === 0 && selectedCourseId() && !isLoadingSession()) {
        <div class="bg-white p-8 rounded-2xl border border-dashed border-warm-300 text-center space-y-3 shadow-warm-xs">
          <div class="w-12 h-12 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center mx-auto">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 class="font-serif font-bold text-base text-warm-900">No hay sesiones programadas para este grupo</h3>
          <p class="text-xs text-warm-600 max-w-md mx-auto">
            Programa la primera sesión de clase ahora mismo para comenzar a registrar la asistencia de tus alumnos.
          </p>
          <app-button variant="primary" size="md" (clicked)="openNewSessionModal()">
            <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Programar Primera Sesión
          </app-button>
        </div>
      }

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
                  [disabled]="!sessionsEnabled || !attendanceEnabled"
                  (click)="setStatus(student.studentId, 'AN')"
                  [class]="mobileStatusBtnClasses(student.status, 'AN')"
                >
                  🟢 Asistencia Normal
                </button>
                <button
                  type="button"
                  [disabled]="!sessionsEnabled || !attendanceEnabled"
                  (click)="setStatus(student.studentId, 'SJC')"
                  [class]="mobileStatusBtnClasses(student.status, 'SJC')"
                >
                  🔴 Sin Justa Causa
                </button>
                <button
                  type="button"
                  [disabled]="!sessionsEnabled || !attendanceEnabled"
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
              [disabled]="!sessionsEnabled || !attendanceEnabled"
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
                            [disabled]="!sessionsEnabled || !attendanceEnabled"
                            (click)="setStatus(student.studentId, 'AN')"
                            [class]="segmentedChipClasses(student.status, 'AN')"
                          >
                            Asistencia Normal
                          </button>
                          <button
                            type="button"
                            [disabled]="!sessionsEnabled || !attendanceEnabled"
                            (click)="setStatus(student.studentId, 'SJC')"
                            [class]="segmentedChipClasses(student.status, 'SJC')"
                          >
                            Sin Justa Causa
                          </button>
                          <button
                            type="button"
                            [disabled]="!sessionsEnabled || !attendanceEnabled"
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
                [disabled]="!sessionsEnabled || !attendanceEnabled"
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

        <app-form-field
          label="Tipo de Documento"
          [required]="true"
          [errorMessage]="studentFieldErrors().tipoIdentificacionId ?? ''"
        >
          <app-form-select
            [options]="docTypeOptions()"
            [value]="newStudentDocType()"
            (valueChange)="newStudentDocType.set($event)"
            placeholder="Seleccione..."
          ></app-form-select>
        </app-form-field>

        <app-form-field
          label="Número de Identificación"
          [required]="true"
          [errorMessage]="studentFieldErrors().numeroIdentificacion ?? ''"
        >
          <input
            type="text"
            inputmode="numeric"
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
          <app-form-field
            label="Primer Nombre"
            [required]="true"
            [errorMessage]="studentFieldErrors().primerNombre ?? ''"
          >
            <input
              type="text"
              maxlength="50"
              [ngModel]="newStudentFirstName()"
              (ngModelChange)="newStudentFirstName.set($event)"
              name="newStudentFirstName"
              placeholder="Ej. Juan"
              class="w-full bg-white text-warm-900 border border-warm-300 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </app-form-field>

          <app-form-field
            label="Segundo Nombre (Opcional)"
            [errorMessage]="studentFieldErrors().segundoNombre ?? ''"
          >
            <input
              type="text"
              maxlength="50"
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
          <app-form-field
            label="Primer Apellido"
            [required]="true"
            [errorMessage]="studentFieldErrors().primerApellido ?? ''"
          >
            <input
              type="text"
              maxlength="50"
              [ngModel]="newStudentLastName()"
              (ngModelChange)="newStudentLastName.set($event)"
              name="newStudentLastName"
              placeholder="Ej. Pérez"
              class="w-full bg-white text-warm-900 border border-warm-300 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </app-form-field>

          <app-form-field
            label="Segundo Apellido (Opcional)"
            [errorMessage]="studentFieldErrors().segundoApellido ?? ''"
          >
            <input
              type="text"
              maxlength="50"
              [ngModel]="newStudentSecondLastName()"
              (ngModelChange)="newStudentSecondLastName.set($event)"
              name="newStudentSecondLastName"
              placeholder="Ej. Gómez"
              class="w-full bg-white text-warm-900 border border-warm-300 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </app-form-field>
        </div>

        <app-form-field
          label="Correo Electrónico Institucional"
          [required]="true"
          [errorMessage]="studentFieldErrors().correo ?? ''"
        >
          <input
            type="email"
            maxlength="100"
            [ngModel]="newStudentEmail()"
            (ngModelChange)="newStudentEmail.set($event)"
            name="newStudentEmail"
            placeholder="juan.perez@uco.edu.co"
            class="w-full bg-white text-warm-900 border border-warm-300 rounded-xl px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </app-form-field>

        <app-form-field
          label="Contraseña"
          [required]="true"
          [errorMessage]="studentFieldErrors().password ?? ''"
        >
          <input
            type="password"
            minlength="8"
            maxlength="255"
            [ngModel]="newStudentPassword()"
            (ngModelChange)="newStudentPassword.set($event)"
            name="newStudentPassword"
            placeholder="Mínimo 8 caracteres"
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

    <!-- MODAL: Programar Nueva Sesión -->
    <app-modal
      [isOpen]="isNewSessionModalOpen()"
      title="Programar Nueva Sesión de Clase"
      (closed)="isNewSessionModalOpen.set(false)"
    >
      <form (submit)="onCreateSessionSubmit($event)" class="space-y-4">
        <p class="text-xs text-warm-600">
          Crea una nueva sesión para {{ currentCourse()?.name }} ({{ currentCourse()?.code }}).
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <app-form-field label="Tipo de Sesión" [required]="true">
            <select
              [(ngModel)]="newSessionForm.tipo"
              name="tipoSesion"
              class="w-full bg-white text-warm-900 border border-warm-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="REGULAR">Sesión Regular de Cronograma</option>
              <option value="EXTRAORDINARIA">Sesión Extraordinaria</option>
              <option value="REPOSICION">Sesión de Reposición</option>
            </select>
          </app-form-field>

          <app-form-field label="Fecha de la Sesión" [required]="true">
            <input
              type="date"
              [(ngModel)]="newSessionForm.date"
              name="fechaSesion"
              required
              class="w-full bg-white text-warm-900 border border-warm-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </app-form-field>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <app-form-field label="Hora Inicio" [required]="true">
            <input
              type="time"
              [(ngModel)]="newSessionForm.startTime"
              name="horaInicio"
              required
              class="w-full bg-white text-warm-900 border border-warm-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </app-form-field>

          <app-form-field label="Hora Fin" [required]="true">
            <input
              type="time"
              [(ngModel)]="newSessionForm.endTime"
              name="horaFin"
              required
              class="w-full bg-white text-warm-900 border border-warm-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </app-form-field>
        </div>

        <app-form-field label="Aula / Espacio Físico">
          <input
            type="text"
            [(ngModel)]="newSessionForm.room"
            name="aula"
            placeholder="Ej. Aula 302, Laboratorio 1..."
            class="w-full bg-white text-warm-900 border border-warm-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </app-form-field>

        <app-form-field label="Título de la Sesión" [required]="true">
          <input
            type="text"
            [(ngModel)]="newSessionForm.title"
            name="titulo"
            required
            placeholder="Ej. Sesión #1 - Presentación y Fundamentos"
            class="w-full bg-white text-warm-900 border border-warm-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </app-form-field>

        <app-form-field label="Temática / Descripción">
          <textarea
            [(ngModel)]="newSessionForm.topic"
            name="descripcion"
            rows="2"
            placeholder="Breve descripción del tema a tratar..."
            class="w-full bg-white text-warm-900 border border-warm-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
          ></textarea>
        </app-form-field>

        <div modal-footer class="flex items-center justify-end gap-2 w-full pt-2">
          <app-button
            variant="ghost"
            size="sm"
            [disabled]="isCreatingSession()"
            (clicked)="isNewSessionModalOpen.set(false)"
          >
            Cancelar
          </app-button>
          <app-button
            variant="primary"
            size="sm"
            type="submit"
            [loading]="isCreatingSession()"
            [disabled]="isCreatingSession() || !newSessionForm.title.trim() || !newSessionForm.date"
          >
            Crear Sesión
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
  private sessionService = inject(SessionService);
  private coordinatorService = inject(CoordinatorManagementService);
  private attendanceService = inject(AttendanceService);
  private http = inject(HttpClient);

  readonly sessionsEnabled = environment.features.sessionsEnabled;
  readonly attendanceEnabled = environment.features.attendanceEnabled;

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

  isNewSessionModalOpen = signal<boolean>(false);
  isCreatingSession = signal<boolean>(false);

  newSessionForm = {
    tipo: 'REGULAR' as 'REGULAR' | 'EXTRAORDINARIA' | 'REPOSICION',
    title: '',
    topic: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '10:00',
    room: '',
  };

  isRegisterModalOpen = signal<boolean>(false);
  isEnrolling = signal<boolean>(false);

  newStudentDocType = signal<string>('');
  newStudentCode = signal<string>('');
  newStudentFirstName = signal<string>('');
  newStudentSecondName = signal<string>('');
  newStudentLastName = signal<string>('');
  newStudentSecondLastName = signal<string>('');
  newStudentEmail = signal<string>('');
  newStudentPassword = signal<string>('Test1234!');
  studentFieldErrors = signal<
    Partial<Record<StudentEnrollmentField, string>>
  >({});

  docTypes = signal<TipoIdentificacionApiDto[]>([]);

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
      next: (documentTypes) => {
        this.docTypes.set(documentTypes);
        if (documentTypes.length > 0) {
          this.newStudentDocType.set(documentTypes[0].id);
        }
      },
    });

    this.courseService.getTeacherCourses().subscribe({
      next: (res: any) => {
        const courses: Course[] = Array.isArray(res) ? res : (res?.datos || []);
        this.courses = courses;
        this.courseOptions.set(
          courses.map((course) => ({
            value: course.id,
            label: `${course.code} - ${course.name} (${course.section})`,
          }))
        );
        if (courses.length > 0) {
          this.onCourseSelect(courses[0].id);
        }
      },
    });
  }

  sessionOptions = computed<SelectOption[]>(() => {
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
    if (!this.sessionsEnabled || !this.attendanceEnabled) {
      return;
    }

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

  openNewSessionModal() {
    const course = this.currentCourse();
    const nextNumber = this.sessions().length + 1;
    this.newSessionForm = {
      tipo: 'REGULAR',
      title: `Sesión #${nextNumber} - Clase Magistral`,
      topic: 'Control de asistencia y desarrollo temático',
      date: new Date().toISOString().split('T')[0],
      startTime: '08:00',
      endTime: '10:00',
      room: course?.room || 'Aula Principal',
    };
    this.isNewSessionModalOpen.set(true);
  }

  onCreateSessionSubmit(event: Event) {
    event.preventDefault();
    const courseId = this.selectedCourseId();
    if (!courseId) {
      this.toastType.set('warning');
      this.toastMessage.set('Selecciona una asignatura antes de programar una sesión.');
      this.showToast.set(true);
      return;
    }

    if (!this.newSessionForm.title.trim()) {
      this.toastType.set('warning');
      this.toastMessage.set('El campo Título de la Sesión es obligatorio.');
      this.showToast.set(true);
      return;
    }

    if (!this.newSessionForm.date) {
      this.toastType.set('warning');
      this.toastMessage.set('El campo Fecha de la Sesión es obligatorio.');
      this.showToast.set(true);
      return;
    }

    if (!this.newSessionForm.startTime || !this.newSessionForm.endTime) {
      this.toastType.set('warning');
      this.toastMessage.set('Los campos Hora Inicio y Hora Fin son obligatorios.');
      this.showToast.set(true);
      return;
    }

    if (this.newSessionForm.startTime >= this.newSessionForm.endTime) {
      this.toastType.set('warning');
      this.toastMessage.set('El campo Hora Fin debe ser posterior a la Hora Inicio de la sesión.');
      this.showToast.set(true);
      return;
    }

    this.isCreatingSession.set(true);

    this.sessionService
      .createSession(courseId, {
        title: this.newSessionForm.title.trim(),
        topic: this.newSessionForm.topic.trim(),
        date: this.newSessionForm.date,
        startTime: this.newSessionForm.startTime,
        endTime: this.newSessionForm.endTime,
        room: this.newSessionForm.room.trim(),
        tipo: this.newSessionForm.tipo,
      })
      .subscribe({
        next: (res) => {
          this.isCreatingSession.set(false);
          this.isNewSessionModalOpen.set(false);
          this.toastType.set('success');
          this.toastMessage.set(res?.mensajeUsuario || 'Sesión de clase programada exitosamente.');
          this.showToast.set(true);

          this.sessionService.getSessionsByGroup(courseId).subscribe({
            next: (sRes) => {
              const list = sRes.datos || [];
              this.sessions.set(list);
              if (res?.datos?.id) {
                this.onSessionSelect(res.datos.id);
              } else if (list.length > 0) {
                this.onSessionSelect(list[list.length - 1].id);
              }
            },
          });
        },
        error: (err) => {
          this.isCreatingSession.set(false);
          this.toastType.set('error');
          this.toastMessage.set(getApiErrorMessage(err) || 'Error al programar la sesión de clase.');
          this.showToast.set(true);
        },
      });
  }

  onCourseSelect(courseId: string) {
    this.selectedCourseId.set(courseId);
    this.isLoadingSession.set(true);
    this.sessions.set([]);
    this.selectedSessionId.set('');

    this.sessionService.getSessionsByGroup(courseId).subscribe({
      next: (res) => {
        const list = res.datos || [];
        this.sessions.set(list);
        this.isLoadingSession.set(false);
        if (list.length > 0) {
          this.onSessionSelect(list[0].id);
        }
      },
      error: () => {
        this.isLoadingSession.set(false);
        this.sessions.set([]);
      },
    });
  }

  onSessionSelect(sessionId: string) {
    if (!this.sessionsEnabled) {
      return;
    }

    this.triggerSkeleton(() => {
      this.selectedSessionId.set(sessionId);
      this.cargarEstudiantesYSesion(this.selectedCourseId(), sessionId);
    });
  }

  cargarEstudiantesYSesion(courseId: string, sessionId: string) {
    if (!courseId || !sessionId) return;

    this.coordinatorService.getEstudiantesPorGrupo(courseId).subscribe({
      next: (res) => {
        const estudiantes = res.datos || [];
        this.attendanceService.getAttendancesByGroup(courseId, sessionId).subscribe({
          next: (attRes) => {
            const attMap = new Map<string, AttendanceStatus>();
            const obsMap = new Map<string, string>();
            if (attRes.datos) {
              for (const a of attRes.datos) {
                const estId = a.estudiante || (a as any).estudianteId;
                if (estId) {
                  const status: AttendanceStatus = (a as any).estado || (a as any).status || (a.presente === false ? 'SJC' : 'AN');
                  attMap.set(estId, status);
                  obsMap.set(estId, a.observacion || (a as any).observaciones || '');
                }
              }
            }

            const records: any[] = estudiantes.map((e: any) => ({
              studentId: e.id,
              studentName: e.nombreCompleto,
              studentCode: e.codigo,
              status: attMap.get(e.id) || 'AN',
              notes: obsMap.get(e.id) || '',
            }));

            this.sessions.update((list) =>
              list.map((s) => (s.id === sessionId ? { ...s, records } : s))
            );
          },
          error: () => {
            const records: any[] = estudiantes.map((e: any) => ({
              studentId: e.id,
              studentName: e.nombreCompleto,
              studentCode: e.codigo,
              status: 'AN' as AttendanceStatus,
              notes: '',
            }));

            this.sessions.update((list) =>
              list.map((s) => (s.id === sessionId ? { ...s, records } : s))
            );
          },
        });
      },
      error: () => {},
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
    if (!this.sessionsEnabled || !this.attendanceEnabled) {
      return;
    }

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
    if (!this.sessionsEnabled || !this.attendanceEnabled) {
      return;
    }

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
    if (!this.sessionsEnabled || !this.attendanceEnabled) {
      return;
    }

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


  private studentService = inject(StudentService);

  saveAttendance() {
    const sessionId = this.selectedSessionId();
    const cursoId = this.selectedCourseId();
    if (!sessionId) {
      this.toastType.set('warning');
      this.toastMessage.set('Por favor seleccione una sesión para guardar la asistencia.');
      this.showToast.set(true);
      return;
    }

    const currentRecords = this.students();
    if (!currentRecords || currentRecords.length === 0) {
      this.toastType.set('warning');
      this.toastMessage.set('No hay estudiantes inscritos en este grupo para registrar asistencia.');
      this.showToast.set(true);
      return;
    }

    this.isSaving.set(true);
    const payload = {
      sesionId: sessionId,
      grupoId: cursoId,
      registros: currentRecords.map((r) => ({
        studentId: r.studentId,
        status: r.status,
        notes: r.notes || '',
        observaciones: r.notes || '',
      })),
    };

    this.attendanceService.saveBatchAttendance(payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.toastType.set('success');
        this.toastMessage.set('¡Asistencia consolidada y guardada exitosamente!');
        this.showToast.set(true);
      },
      error: (err) => {
        this.isSaving.set(false);
        this.toastType.set('error');
        this.toastMessage.set(err?.error?.message || 'Error al guardar la asistencia.');
        this.showToast.set(true);
      },
    });
  }

  openStudentRegistration() {
    this.studentFieldErrors.set({});
    this.isRegisterModalOpen.set(true);
  }

  onRegisterStudentSubmit(event: Event) {
    event.preventDefault();

    this.studentFieldErrors.set({});

    const identificationResult = parseIdentificationNumber(
      this.newStudentCode()
    );
    const effectivePassword = this.newStudentPassword().trim() || 'Test1234!';
    const passwordError = getPasswordValidationError(
      effectivePassword,
      this.newStudentCode()
    );
    const fieldErrors: Partial<Record<StudentEnrollmentField, string>> = {};

    if (!identificationResult.valid) {
      fieldErrors.numeroIdentificacion = identificationResult.error;
    }
    if (!this.newStudentFirstName().trim()) {
      fieldErrors.primerNombre = 'El campo Primer Nombre es obligatorio.';
    }
    if (!this.newStudentLastName().trim()) {
      fieldErrors.primerApellido = 'El campo Primer Apellido es obligatorio.';
    }
    if (!this.newStudentEmail().trim()) {
      fieldErrors.correo = 'El campo Correo Institucional es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.newStudentEmail().trim())) {
      fieldErrors.correo = 'El campo Correo Institucional debe tener un formato válido (ej. estudiante@uco.edu.co).';
    }
    if (passwordError) {
      fieldErrors.password = passwordError;
    }

    if (!this.newStudentDocType() || Object.keys(fieldErrors).length > 0) {
      if (!this.newStudentDocType()) {
        fieldErrors.tipoIdentificacionId = 'El campo Tipo de Documento es obligatorio.';
      }
      this.studentFieldErrors.set(fieldErrors);
      this.toastType.set('error');
      const errList = Object.values(fieldErrors);
      this.toastMessage.set(errList.length === 1 ? errList[0]! : `Campos con error en la inscripción: ${Object.keys(fieldErrors).join(', ')}.`);
      this.showToast.set(true);
      return;
    }

    if (!identificationResult.valid) {
      return;
    }

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
        numeroIdentificacion: identificationResult.value,
        primerNombre: this.newStudentFirstName().trim(),
        segundoNombre: this.newStudentSecondName().trim(),
        primerApellido: this.newStudentLastName().trim(),
        segundoApellido: this.newStudentSecondLastName().trim(),
        correoElectronico: this.newStudentEmail().trim(),
        password: effectivePassword,
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
          this.newStudentPassword.set('Test1234!');
          this.studentFieldErrors.set({});

          this.toastType.set('success');
          this.toastMessage.set(res.mensajeUsuario || '¡Estudiante matriculado exitosamente en el grupo!');
          this.showToast.set(true);

          if (grupoId) {
            this.onCourseSelect(grupoId);
          }
        },
        error: (error: unknown) => {
          this.isEnrolling.set(false);
          this.toastType.set('error');
          this.setStudentApiFieldErrors(error);
          this.toastMessage.set(getApiErrorMessage(error));
          this.showToast.set(true);
        },
      });
  }

  private setStudentApiFieldErrors(error: unknown): void {
    const fields: StudentEnrollmentField[] = [
      'tipoIdentificacionId',
      'primerNombre',
      'segundoNombre',
      'primerApellido',
      'segundoApellido',
      'correo',
      'numeroIdentificacion',
      'password',
    ];
    const fieldErrors: Partial<Record<StudentEnrollmentField, string>> = {};

    for (const field of fields) {
      const message = getApiFieldError(error, field);
      if (message) {
        fieldErrors[field] = message;
      }
    }

    this.studentFieldErrors.set(fieldErrors);
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
