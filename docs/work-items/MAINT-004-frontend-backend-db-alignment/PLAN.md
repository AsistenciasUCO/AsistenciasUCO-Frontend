# MAINT-004 — Plan de integración frontend/backend/DB

## Objetivo

Alinear el frontend Angular 18 con el OpenAPI del backend `develop` disponible en el checkout local, conservando v1 y habilitando el consumo opt-in de sesiones UTC v2. El frontend no modifica el backend, SQL Server, MinIO ni las migraciones.

## Base y límites

- HEAD auditado: `b0c2225e8a9dd9960d124d960725cb94b7b0abb8`.
- La referencia local `origin/develop` aportó `dfbd00c`; `git fetch origin --prune` no pudo actualizar `.git/FETCH_HEAD` por permisos del entorno.
- Rama de trabajo: `jose-valencia/maint-004-frontend-utc-v2-integration`.
- La bandera `USE_SESSIONS_V2` y `APP_SESIONES_V2_ENABLED` son independientes: el frontend solo intenta v2 cuando la primera está activa y el backend debe estar preparado.

## Fases

1. Contratos y URLs: separar `apiV1Url`/`apiV2Url`, tipar DTOs v2 y conservar v1.
2. Tiempo: zona IANA automática/manual, conversión con `Intl`/base TZ del runtime, validación DST, precisión de siete decimales y estados temporales.
3. Consumidores de sesiones: docente y control de asistencia, recarga posterior a POST/PATCH, sin selección por nombre/fecha.
4. Directorio: filtros y paginación real de `/api/v1/estudiantes`; la respuesta del servidor es la fuente de totales.
5. Capacidades pendientes: constructor administrativo sin consultas globales, reclamos 501 visible, archivos con `fileId` y descarga Bearer mediante `HttpClient`, edición de perfil bloqueada en real.
6. Regresión y handoff: pruebas de contrato, temporalidad, autenticación, asistencia y documentación manual.

## Criterio de no regresión

Se conservan los servicios v1, el mapeo `AN/SJC/EX`, SSE autenticado, guards, tokens en memoria y la recarga HTTP como fuente de verdad. No se agrega fallback v2→v1 ni se convierten sesiones `INDETERMINADA` a horas UTC.

