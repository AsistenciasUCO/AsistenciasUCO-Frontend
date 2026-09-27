# 🌳 Árbol de Componentes y Arquitectura Frontend — Gestión de Asistencia UCO

> **Tecnología:** Angular 19 / TypeScript 5.5+ / Tailwind CSS v4  
> **Patrón:** Standalone Components, Angular Signals, ChangeDetectionStrategy.OnPush, Slots (`ng-content`), Clean UI Architecture  
> **Fecha:** Septiembre 2026 | **Ámbito:** `GestioAsistenciaFrontend`

---

## 1. Resumen Ejecutivo y Convenciones de Arquitectura

El frontend de **Gestión de Asistencia UCO** es una SPA (Single Page Application) reactiva diseñada bajo el estándar moderno de Angular 19. Sigue estrictamente la separación de responsabilidades y la arquitectura limpia en el cliente:

### 1.1 Organización de Carpetas (`src/app/`)
* **`core/` (Singleton / Núcleo):**
  * Servicios globales de dominio y red (`SessionService`, `CourseService`, `AttendanceService`, `StudentService`, etc.).
  * Autenticación OIDC / Keycloak (`AuthService`), interceptores HTTP (`auth.interceptor.ts`, `error.interceptor.ts`, `csrf.interceptor.ts`).
  * Conexión reactiva Server-Sent Events (`RealtimeService`, `AttendanceRealtimeSyncService`).
  * Modelos de datos del cliente (`models/`) y DTOs de transferencia generados (`api/models/`).
  * Guards de rutas (`auth.guard.ts`, `role.guard.ts`).
* **`features/` (Módulos de Negocio por Rol):**
  * Vistas y flujos estructurados por rol de usuario: `attendance/`, `teacher/`, `student/`, `coordinator/`, `dean/`, `admin/`, `profile/`.
  * Cada feature contiene componentes página (Smart Components) y componentes secundarios específicos (Dumb / Presentational Components).
* **`layouts/` (Estructura Base / Shell):**
  * Plantillas estructurales del sistema: `DashboardLayoutComponent` (con `SidebarComponent` y `HeaderComponent`) y vistas públicas (`PublicLayoutComponent`, `LoginComponent`).
* **`shared/` (Componentes y Pipes Reutilizables):**
  * Catálogo atómico y molecular del **Aurora Education Design System**: `ModalComponent`, `ButtonComponent`, `FormFieldComponent`, `FormSelectComponent`, `TableComponent`, `CardComponent`, `BadgeComponent`, `ToastComponent`, etc.
  * Pipes y directivas utilitarias.

### 1.2 Directrices de Estado e Inyección (Angular 19 Signals)
1. **100% Standalone & OnPush:** Todo componente declara `standalone: true` y `changeDetection: ChangeDetectionStrategy.OnPush`.
2. **Signals Nativos:**
   * Propiedades de entrada: `input<T>()` e `input.required<T>()` (prohibido `@Input()`).
   * Salidas de eventos: `output<T>()` (prohibido `@Output()`).
   * Estado mutable local: `signal<T>(initialValue)` con `.set()` y `.update()`.
   * Estado derivado / reactivo: `computed(() => ...)`.
   * Reacciones a cambios: `effect(() => ...)`.
3. **Inyección de Dependencias:** Uso estricto de la función `inject(Service)` en propiedades de clase.
4. **Cero Polling:** Prohibido el uso de `setInterval` o consultas periódicas para emular reactividad. La sincronización se realiza mediante SSE (`/api/v1/realtime/stream`) gestionado en `RealtimeService`.

---

## 2. Mapa Jerárquico de Componentes por Rol y Ruta

```text
src/app/
├── layouts/
│   ├── dashboard-layout/                 # Shell del usuario autenticado
│   │   ├── components/sidebar/           # Menú lateral reactivo por rol
│   │   └── components/header/            # Barra superior, notificaciones, perfil
│   └── public-layout/                    # Shell de bienvenida y autenticación
│
├── features/
│   ├── auth/                             # Inicio de sesión y recuperación
│   │   └── login/                        # (/login) Formulario Direct Grants Keycloak
│   │
│   ├── teacher/                          # DOCENTE
│   │   ├── teacher-grupos/               # (/app/docente/grupos) Mis Cursos
│   │   │   └── components/modals/        # Modales de código QR y matrícula manual
│   │   ├── teacher-solicitudes/          # (/app/docente/solicitudes) Bandeja de Excusas
│   │   └── teacher-historico/            # (/app/docente/historico) Historial de clases
│   │
│   ├── attendance/                       # CONTROL DE ASISTENCIA Y SESIONES
│   │   └── attendance-control/           # (/app/docente/asistencia o /app/docente/asistencia/:courseId)
│   │       ├── components/
│   │       │   ├── attendance-control-header.component.ts     # Filtros y selector de sesión
│   │       │   ├── attendance-control-table.component.ts      # Matriz de marcación (P, FJ, FI, etc.)
│   │       │   ├── attendance-new-session-modal.component.ts  # Diálogo de creación de sesión
│   │       │   ├── attendance-enrollment-modal.component.ts   # Diálogo de matrícula manual
│   │       │   ├── attendance-projection-modal.component.ts   # Proyección de pérdidas del 20%
│   │       │   ├── group-sessions-overview.component.ts       # Vista Bento Grid de sesiones del grupo
│   │       │   ├── group-info-modal.component.ts              # Detalle de alumnos inscritos
│   │       │   └── group-claims-modal.component.ts            # Reclamos específicos del grupo
│   │       └── attendance-realtime-sync.service.ts            # Bridge local con SSE
│   │
│   ├── student/                          # ESTUDIANTE
│   │   ├── student-dashboard/            # (/app/estudiante/dashboard) Resumen académico
│   │   ├── student-asistencias/          # (/app/estudiante/asistencias) Historial de faltas
│   │   ├── student-justificaciones/      # (/app/estudiante/justificaciones) Radicación de excusas
│   │   └── student-qr/                   # (/app/estudiante/qr) Auto-registro Wi-Fi Campus
│   │
│   ├── coordinator/                      # COORDINADOR DE PROGRAMA
│   │   ├── coordinator-dashboard/        # (/app/coordinador/dashboard) Métricas de carrera
│   │   ├── coordinator-reportes/         # (/app/coordinador/reportes) Reportes consolidados
│   │   └── coordinator-alertas/          # (/app/coordinador/alertas) Casos críticos >20%
│   │
│   ├── dean/                             # DECANO DE FACULTAD
│   │   ├── dean-dashboard/               # (/app/decano/dashboard) Visión global facultad
│   │   └── dean-facultad/                # (/app/decano/facultad) Análisis comparativo
│   │
│   └── admin/                            # ADMINISTRADOR INSTITUCIONAL
│       ├── admin-dashboard/              # (/app/admin/dashboard) Control del sistema
│       ├── admin-usuarios/               # (/app/admin/usuarios) Gestión de identidades
│       └── admin-auditoria/              # (/app/admin/auditoria) Logs y trazabilidad
```

### 2.1 Desglose Detallado del Módulo de Control de Asistencia (`attendance-control`)

| Componente | Ruta de Archivo | Propósito / Responsabilidad |
| :--- | :--- | :--- |
| **`AttendanceControlComponent`** | `src/app/features/attendance/attendance-control/attendance-control.component.ts` | **Smart Component Orchestrator.** Coordina el estado reactivo, carga de sesiones con `forkJoin`, conmutación entre Bento Overview y Detalle de Asistencia, y persistencia de lotes. |
| **`AttendanceControlHeaderComponent`** | `.../components/attendance-control-header.component.ts` | Barra superior de la vista de asistencia: navegación atrás, selección de fecha/sesión, indicadores de grupo y botón de agregar sesión. |
| **`AttendanceControlTableComponent`** | `.../components/attendance-control-table.component.ts` | Tabla de estudiantes con botones de estado rápido (`P`, `FJ`, `FI`), cálculo visual del % de inasistencia y campo de observaciones. |
| **`AttendanceNewSessionModalComponent`** | `.../components/attendance-new-session-modal.component.ts` | Modal emergente para programar nueva sesión (`title`, `date`, `startTime`, `endTime`). |
| **`AttendanceEnrollmentModalComponent`** | `.../components/attendance-enrollment-modal.component.ts` | Modal para matricular un estudiante manualmente en el grupo desde la sesión. |
| **`AttendanceProjectionModalComponent`** | `.../components/attendance-projection-modal.component.ts` | Visualización analítica de proyección de riesgo de inasistencia (límite del 20%). |
| **`GroupSessionsOverviewComponent`** | `.../components/group-sessions-overview.component.ts` | Vista Maestro/Bento Grid con tarjetas interactivas de todas las sesiones registradas del grupo. |
| **`GroupInfoModalComponent`** | `.../components/group-info-modal.component.ts` | Visualizador de la lista de alumnos activos matriculados en el curso. |
| **`GroupClaimsModalComponent`** | `.../components/group-claims-modal.component.ts` | Visualizador y gestor de reclamos o excusas pendientes específicos del curso actual. |

---

## 3. Catálogo de Componentes Compartidos (`src/app/shared/`)

| Componente | Selector | Entradas Principales (`input`) | Salidas (`output`) | Slots (`ng-content`) |
| :--- | :--- | :--- | :--- | :--- |
| **`ModalComponent`** | `app-modal` | `isOpen: boolean`, `title: string` | `closed: void` | `default` (cuerpo), `[modal-footer]` (acciones) |
| **`ButtonComponent`** | `app-button` | `variant: ButtonVariant`, `size: ButtonSize`, `type: 'button'\|'submit'`, `disabled: boolean`, `loading: boolean`, `fullWidth: boolean` | `clicked: MouseEvent` | `default` (texto/icono) |
| **`FormFieldComponent`** | `app-form-field` | `label: string`, `required: boolean`, `error: string \| null` | — | `default` (control de entrada `input`, `select`, etc.) |
| **`FormSelectComponent`** | `app-form-select` | `label: string`, `options: SelectOption[]`, `value: string`, `disabled: boolean` | `valueChanged: string` | — |
| **`CardComponent`** | `app-card` | `variant: 'default'\|'interactive'\|'glass'`, `padding: 'none'\|'sm'\|'md'\|'lg'` | — | `default` (contenido de tarjeta) |
| **`BadgeComponent`** | `app-badge` | `variant: BadgeVariant`, `size: 'sm'\|'md'` | — | `default` (etiqueta) |
| **`ToastComponent`** | `app-toast` | `visible: boolean`, `message: string`, `type: ToastType`, `duration: number` | `dismissed: void` | — |
| **`PaginationComponent`** | `app-pagination` | `currentPage: number`, `totalPages: number`, `totalItems: number`, `pageSize: number` | `pageChange: number` | — |

---

## 4. Guía de Depuración Rápida de Componentes

| Síntoma Común | Causa Raíz Probable | Solución Estándar |
| :--- | :--- | :--- |
| **El botón "Guardar" o "Crear" no hace nada al hacer clic.** | 1) Botón deshabilitado por validación oculta o inicial (`length < 1`).<br>2) El botón está en un slot `[modal-footer]` y no propaga el `submit` del `<form>`. | Enlazar explícitamente `(clicked)="onSubmit($event)"` en el `<app-button>` y verificar el estado inicial de los campos en el `effect` o al abrir el modal. |
| **La vista no refleja los cambios tras una mutación.** | El componente usa `ChangeDetectionStrategy.OnPush` y se mutaron arrays o propiedades sin invocar `signal.set()` o `signal.update()`. | Actualizar siempre el Signal inmutablemente: `items.update(prev => [...prev, nuevo])`. |
| **Inputs desalineados o sin estilo.** | Se usaron clases CSS externas en lugar de los componentes atómicos de diseño. | Utilizar `<app-form-field>` y clases nativas de Tailwind v4 (`text-warm-900`, `rounded-xl`, etc.). |
| **Pérdida de foco o recarga innecesaria de listas.** | Uso de `@for` sin una clave única de seguimiento (`track`). | Usar `@for (item of items(); track item.id)`. |

---

## 5. Referencias y Documentos Relacionados
* [Centro Maestro de Documentación Técnica](../../docs/README.md)
* [Arquitectura Integral del Sistema](../../docs/arquitectura-integral.md)
* [Arquitectura Reactiva SSE (Realtime)](../../docs/realtime-sse-architecture.md)
* [Sistema de Diseño Aurora (Tailwind CSS v4)](../../docs/sistema-diseno.md)
