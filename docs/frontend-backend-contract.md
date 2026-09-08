# Contrato frontend-backend

El backend congelado es la fuente de verdad del contrato HTTP. El frontend usa contratos tipados según la operación: `ApiDataResponse<T>`, `ApiListResponse<T>`, `ApiMessageResponse` u `OperationResultResponse`.

Los errores HTTP usan `ApiErrorResponse`, con `code`, `message`, `correlationId` y errores de campo opcionales en `details`.

- Las consultas usan `GET` y los comandos usan `POST`.
- No se usan endpoints `POST` legacy para consultas.
- `numeroIdentificacion` se captura como texto, pero temporalmente se envía como `number` compatible con `Integer` del backend.
- Las solicitudes al API incluyen `X-Correlation-Id`.
- La autenticación usa Bearer/OIDC mediante Keycloak y requiere los claims JWT `sub` e `idUsuario`.
- `features.sessionsEnabled` está en `false`.
- `features.attendanceEnabled` está en `false`.
- La matrícula de estudiantes sigue disponible aunque sesiones y asistencia estén deshabilitadas.

El proyecto utiliza un único archivo de environment para las configuraciones de desarrollo y producción actuales.

En Docker, el frontend se publica en `http://localhost:4200`. `API_URL`, `KEYCLOAK_URL`, `KEYCLOAK_REALM`, `KEYCLOAK_CLIENT_ID` y `USE_MOCKS` se pasan al contenedor y generan `assets/env.js` en runtime. Nginx sirve el fallback SPA con `try_files $uri $uri/ /index.html`, y `assets/env.js` se entrega sin cache para evitar configuración obsoleta entre despliegues.
