# Funcionalidades pendientes

- `numeroIdentificacion`: migración coordinada futura cuando la base de datos pase de `INT` a `VARCHAR`; el frontend ya lo captura como texto, pero todavía lo envía como `number` por compatibilidad.
- Autenticación: migrar el SPA de `grant_type=password` a Authorization Code + PKCE antes de producción si ese es el estándar acordado. Está fuera de la fase de asistencia realtime.
- E2E automatizado integral con navegador, Keycloak, backend y SQL Server. La fase actual conserva el smoke real de batch + SSE en `scripts/realtime-smoke.mjs`, sin incorporar Playwright ni Cypress.

El contrato batch, el evento `ASISTENCIAS_SESION_ACTUALIZADAS`, el scope SSE por `grupoId` y los estados `AN`/`SJC`/`EX` ya no son gaps pendientes.
