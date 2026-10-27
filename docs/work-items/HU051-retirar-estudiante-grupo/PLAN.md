# HU051-retirar-estudiante-grupo — El docente retira a un estudiante de su grupo

## Objetivo

Desde el padrón del grupo (hub del docente) el docente titular retira a un estudiante activo con un motivo obligatorio. La matrícula queda inactiva, el cupo se libera y el backend avisa al estudiante, al docente y al coordinador.

## Alcance y límites

- Contrato HTTP, decisiones y validación de las 3 capas: work item homónimo del backend (`docs/work-items/HU051-retirar-estudiante-grupo/`).
- Solo `POST /api/v1/docente/grupos/{grupoId}/estudiantes/{estudianteId}/retiro`. Sin cambios en otras pantallas ni en la autenticación.

## Pantallas, servicios y simulación

| Elemento | Cambio |
|---|---|
| `TeacherRetiroEstudianteModalComponent` (`features/teacher/teacher-grupos/components/modals`) | Nuevo: motivo obligatorio (1..500, contador), POST con el motivo recortado, muestra el error del backend (404/409/403) sin cerrar |
| `TeacherGrupoEstudiantesComponent` | Muestra la forma del backend (`nombreCompleto`, `documento`, `codigoEstado`/`nombreEstado`); botón "Retirar" solo para matrículas activas; salida `retirar` |
| `TeacherGrupoHubComponent` / `TeacherGruposComponent` | Propagan el evento, abren el modal y recargan el padrón tras el retiro |
| `GroupService.retirarEstudiante` | Nuevo (sin toast global: el modal presenta el error) |
| `mock-backend.interceptor` | `POST .../retiro` → `ApiDataResponse<Void>` |
