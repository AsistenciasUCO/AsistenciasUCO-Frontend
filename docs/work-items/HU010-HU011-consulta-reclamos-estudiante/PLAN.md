# HU010-HU011-consulta-reclamos-estudiante — Mis Reclamos del estudiante

## Objetivo

Página de solo lectura para que el estudiante consulte sus solicitudes de revisión de asistencia: estado, respuesta del docente y soporte adjunto.

## Alcance y límites

- Contrato HTTP, decisiones y validación de las 3 capas: work item homónimo del backend (`docs/work-items/HU010-HU011-consulta-reclamos-estudiante/`).
- Solo `GET /api/v1/estudiante/reclamos`. Eliminar una solicitud espera TD-059; la categoría (HU014) espera TD-060.
- Sin cambios en la radicación (`POST /asistencias/revisiones`), la subida/descarga de archivos ni la bandeja docente.

## Pantallas, servicios y simulación

| Elemento | Cambio |
|---|---|
| `features/student/student-claims/StudentClaimsComponent` | Nuevo: lista paginada en servidor, filtro por estado, descarga autenticada del soporte (`GET /archivos/{fileId}`) |
| `app.routes.ts` | Ruta `estudiante/reclamos` (roleGuard ESTUDIANTE) |
| `dashboard-layout` | Entrada de menú "Mis Reclamos" (ESTUDIANTE) |
| `AttendanceClaimService.getReclamosEstudiante` | Nuevo (params `estado/pagina/tamano`, sin toast global: la vista muestra el error) |
| `ClaimMapper.fromReclamoEstudiante` | Nuevo: reutiliza el mapeo del docente; instantes UTC presentados en la zona IANA del usuario |
| `mock-backend.interceptor` | `GET /estudiante/reclamos` con la forma real (`total`, filtro por estado, paginación) |
