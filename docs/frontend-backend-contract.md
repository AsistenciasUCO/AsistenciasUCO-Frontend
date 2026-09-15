# Contrato frontend-backend

El backend congelado es la fuente de verdad del contrato HTTP. El frontend usa contratos tipados según la operación: `ApiDataResponse<T>`, `ApiListResponse<T>`, `ApiMessageResponse` u `OperationResultResponse`.

Los errores HTTP usan `ApiErrorResponse`, con `code`, `message`, `correlationId` y errores de campo opcionales en `details`.

- Las consultas usan `GET` y los comandos usan `POST`.
- No se usan endpoints `POST` legacy para consultas.
- `numeroIdentificacion` se captura como texto, pero temporalmente se envía como `number` compatible con `Integer` del backend.
- Las solicitudes al API incluyen `X-Correlation-Id`.
- La autenticación usa Bearer/OIDC mediante Keycloak (actualmente `grant_type=password`, ver deuda en `docs/frontend-features-pending.md`).
- El JWT debe tener `idUsuario` (UUID institucional; el frontend rechaza la sesión si falta o no es un UUID válido — nunca usa `sub` ni un valor por defecto como sustituto) y un rol en `resource_access["asistencias-api"].roles` (`ADMINISTRADOR`, `DECANO`, `COORDINADOR`, `DOCENTE` o `ESTUDIANTE`). `realm_access.roles` y los roles del client `asistencias-uco-frontend` se ignoran para RBAC: solo el client de API es fuente de rol.
- `features.sessionsEnabled` está en `true`.
- `features.attendanceEnabled` está en `true`.
- La matrícula de estudiantes sigue disponible aunque sesiones y asistencia estén deshabilitadas.

El proyecto utiliza un único archivo de environment para las configuraciones de desarrollo y producción actuales.

En Docker, el frontend se publica en `http://localhost:4200`. `API_URL`, `KEYCLOAK_URL`, `KEYCLOAK_REALM`, `KEYCLOAK_CLIENT_ID` y `USE_MOCKS` se pasan al contenedor y generan `assets/env.js` en runtime. Nginx sirve el fallback SPA con `try_files $uri $uri/ /index.html`, y `assets/env.js` se entrega sin cache para evitar configuración obsoleta entre despliegues. El `clientId` público del navegador es `asistencias-uco-frontend` (distinto del client de API `asistencias-api`, usado solo para roles/audience).

Para el contrato realtime (SSE) ver `docs/frontend-realtime.md`.
