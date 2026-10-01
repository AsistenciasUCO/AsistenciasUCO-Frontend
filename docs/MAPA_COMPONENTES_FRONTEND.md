# 🗺️ Mapa Integral de Componentes Frontend — GestioAsistencia

Este documento sirve como **guía y catálogo de navegación rápida** de la aplicación Angular 19 (`GestioAsistenciaFrontend`). Permite localizar de forma inmediata cualquier pantalla, componente hijo, modal o servicio asociado a un error reportado.

---

## 1. Arquitectura General y Flujo de Contenedores

```text
AppComponent
 ├── PublicLayoutComponent  [Rutas públicas: /login]
 │    └── LoginComponent
 └── DashboardLayoutComponent  [Rutas privadas: /app/** (Con AuthGuard)]
      ├── Sidebar Navigation
      ├── Header & Profile Menu
      └── <router-outlet>
           ├── OverviewComponent (/app/dashboard)
           ├── ProfileComponent (/app/perfil)
           ├── AttendanceControlComponent (/app/asistencia)
           ├── Docente (/app/docente/*)
           ├── Estudiante (/app/estudiante/*)
           ├── Coordinador (/app/coordinador/*)
           ├── Decano (/app/decano/*)
           └── Administrador (/app/admin/*)
```

---

## 2. Mapa Detallado por Dominios y Rutas

### 2.1 Módulo de Asistencia (`/app/asistencia`) — [Docente]
Control centralizado de sesiones y registro de asistencia en aula.
- **Ruta:** `/app/asistencia?courseId=<id>&sessionId=<id>`
- **Componente Principal:**
  - [`AttendanceControlComponent`](file:///c:/Proyectos/GestioAsistencia/GestioAsistenciaFrontend/src/app/features/attendance/attendance-control/attendance-control.component.ts)
- **Subcomponentes:**
  - [`AttendanceControlHeaderComponent`](file:///c:/Proyectos/GestioAsistencia/GestioAsistenciaFrontend/src/app/features/attendance/attendance-control/components/attendance-control-header.component.ts): Selector de grupos, sesiones, exportación Excel y botones de acción.
  - [`GroupSessionsOverviewComponent`](file:///c:/Proyectos/GestioAsistencia/GestioAsistenciaFrontend/src/app/features/attendance/attendance-control/components/group-sessions-overview.component.ts): Vista **Maestro** (Bento Grid de KPIs globales, cronograma interactivo, accesos directos a QR/Matrícula).
  - [`AttendanceControlTableComponent`](file:///c:/Proyectos/GestioAsistencia/GestioAsistenciaFrontend/src/app/features/attendance/attendance-control/components/attendance-control-table.component.ts): Vista **Detalle** (lista de estudiantes matriculados, estados Presente/Falta/Justificada y botón Guardar).
- **Modales Asociados:**
  - `AttendanceEnrollmentModalComponent`: Matrícula individual manual.
  - `AttendanceNewSessionModalComponent`: Creación de sesiones extraordinarias o reposición.
  - `AttendanceProjectionModalComponent`: Proyección de clase / QR en proyector.
  - `GroupClaimsModalComponent`: Gestión de reclamos y justificaciones médicas/laborales.
  - `GroupInfoModalComponent`: Sabana de asistencia e información general de estudiantes.
  - `TeacherMatriculaModalComponent`: Proyección de QR y PIN temporal de matrícula.

---

### 2.2 Módulo de Docente (`/app/docente/*`)
- **Grupos del Docente:**
  - **Ruta:** `/app/docente/grupos`
  - **Componente:** [`TeacherGruposComponent`](file:///c:/Proyectos/GestioAsistencia/GestioAsistenciaFrontend/src/app/features/teacher/teacher-grupos/teacher-grupos.component.ts)
  - **Función:** Lista todos los cursos del docente; al hacer clic en un grupo navega de inmediato a `/app/asistencia?courseId=<id>` (Vista Bento Grid).
- **Horarios del Docente:**
  - **Ruta:** `/app/docente/horarios`
  - **Componente:** `TeacherScheduleComponent`
- **Reclamos y Excusas Docente:**
  - **Ruta:** `/app/docente/reclamos`
  - **Componente:** `TeacherClaimsComponent`

---

### 2.3 Módulo de Estudiante (`/app/estudiante/*`)
- **Horario Personal del Estudiante:**
  - **Ruta:** `/app/estudiante/horarios`
  - **Componente:** `StudentScheduleComponent`
- **Mis Materias y Auto-Asistencia:**
  - **Ruta:** `/app/estudiante/materias`
  - **Componente:** `StudentCoursesComponent`
  - **Subcomponentes:**
    - `StudentCoursesListComponent`: Tarjetas de asignaturas inscritas.
    - `StudentCourseDetailComponent`: Detalle de asistencias acumuladas y porcentaje de inasistencia (alerta de 20%).
    - `StudentClaimFormComponent`: Radicación de reclamos e incapacidades.
    - `StudentCourseEnrollFormComponent`: Matrícula por código.
  - **Modales:**
    - `StudentAutoAsistenciaModalComponent`: Marcación de asistencia con validación de Wi-Fi institucional.
    - `StudentMatriculaCodigoModalComponent`: Auto-matrícula vía código/PIN de aula.
    - `StudentPrerequisitosModalComponent`: Validación de requisitos académicos.

---

### 2.4 Módulo de Coordinador (`/app/coordinador/*`)
- **Docentes del Programa:**
  - **Ruta:** `/app/coordinador/docentes`
  - **Componente:** `CoordinatorDocentesComponent`
- **Planes de Estudio y Asignaturas:**
  - **Ruta:** `/app/coordinador/planes-estudio`
  - **Componente:** `CoordinatorStudyPlansComponent`
  - **Subcomponentes:** `StudyPlansListComponent`, `StudyPlanFormComponent`, `StudyPlanMeshComponent`, `SubjectFormComponent`, `AcademicPeriodsTabComponent`.
- **Estudiantes de la Coordinación:**
  - **Ruta:** `/app/coordinador/estudiantes`
  - **Componente:** `CoordinatorStudentsComponent`

---

### 2.5 Módulo de Decano (`/app/decano/*`)
- **Facultad y Métricas Globales:**
  - **Ruta:** `/app/decano/facultad`
  - **Componente:** `DeanFacultyComponent`
- **Coordinadores de la Facultad:**
  - **Ruta:** `/app/decano/coordinadores`
  - **Componente:** `DeanCoordinadoresComponent`

---

### 2.6 Módulo de Administrador Institucional (`/app/admin/*`)
- **Gestión de Decanos:**
  - **Ruta:** `/app/admin/decanos`
  - **Componente:** `AdminDecanosComponent`
- **Catálogos Institucionales (Sedes, Espacios, Áreas, Facultades):**
  - **Ruta:** `/app/admin/catalogos`
  - **Componente:** `AdminCatalogsComponent`
  - **Subcomponentes:** `CatalogSedesComponent`, `CatalogEspaciosComponent`, `CatalogAreasComponent`, `CatalogFacultadesComponent`.
- **Configuración del Sistema:**
  - **Ruta:** `/app/admin/sistema`
  - **Componente:** `AdminSystemComponent`

---

## 3. Catálogo de Componentes Reutilizables (`src/app/shared/components`)

| Componente | Selector | Propósito |
| :--- | :--- | :--- |
| `ButtonComponent` | `app-button` | Botones Aurora Design System con variantes (primary, secondary, danger, ghost) y estado `loading`. |
| `BadgeComponent` | `app-badge` | Etiquetas de estado (presente, ausente, justificada, borrador, finalizada). |
| `CardComponent` | `app-card` | Contenedores redondeados con sombra y borde cálido (`warm-200`). |
| `ModalComponent` | `app-modal` | Ventanas modales accesibles con backdrop difuminado y foco gestionado. |
| `FormSelectComponent` | `app-form-select` | Selects reactivos estilizados compatibles con formularios y Signals. |
| `FormFieldComponent` | `app-form-field` | Wrappers de inputs con etiquetas y mensajes de error automáticos. |
| `AvatarComponent` | `app-avatar` | Avatar de usuario con iniciales o fotografía y anillos de color por rol. |
| `PaginationComponent` | `app-pagination` | Controles de paginación para consultas con `ApiPageResponse<T>`. |
| `ToastComponent` | `app-toast` | Notificaciones flotantes reactivas. |
| `SkeletonComponent` | `app-skeleton` | Efectos shimmer para estados de carga (`isLoading`). |
| `EmptyStateComponent` | `app-empty-state` | Ilustración y mensaje cuando una lista o consulta no arroja datos. |

---

## 4. Guía Rápida para Diagnóstico de Problemas en Frontend

1. **Problema de Espaciado / Layout pegado:**
   - *Causa habitual:* El selector de Angular (`app-*`) es elemento inline por defecto.
   - *Solución:* Incluir `host: { class: 'block w-full' }` en el `@Component`, o usar `flex flex-col gap-6` en el padre en lugar de `space-y-*`.
2. **El estado no se actualiza o no responde:**
   - *Verificar:* Todos los componentes usan `ChangeDetectionStrategy.OnPush` y Angular Signals (`signal()`, `computed()`). Prohibido mutar arreglos directamente (`lista.push()`); siempre usar `lista.update(prev => [...prev, nuevo])`.
3. **Pérdida de Reactividad en Tiempo Real:**
   - *Verificar:* `AttendanceRealtimeSyncService` conectado al SSE `/api/v1/realtime/stream`. Las reconexiones deben reflejarse en los signals del componente.
