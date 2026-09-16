# Realtime (SSE) en asistencia

## Endpoint, scope y autenticación

```http
GET {environment.apiUrl}/realtime/stream?grupoId={UUID}
Accept: text/event-stream
Authorization: Bearer <JWT>
X-Correlation-Id: <UUID>
```

El stream siempre está scopeado por grupo. El token vive exclusivamente en la cabecera `Authorization`; nunca se incluye en la URL. El adapter usa `credentials: 'omit'` y `@microsoft/fetch-event-source`, porque `EventSource` nativo no permite enviar el Bearer token.

## Capas y lifecycle

```text
AttendanceControlComponent
  -> AttendanceRealtimeSyncService.connectGroup(grupoId)
  -> RealtimeService.startForGroup(grupoId)
  -> RealtimeTransport.start({ grupoId })
  -> FetchSseRealtimeTransport
  -> backend
```

`DashboardLayoutComponent` no inicia realtime. La pantalla de asistencia es la propietaria del stream porque solo allí existe el `grupoId` requerido:

- seleccionar el mismo grupo es idempotente;
- seleccionar otro grupo aborta el stream anterior antes de abrir el nuevo;
- una generación de conexión impide que el loop abortado vuelva a reconectar;
- destruir `AttendanceControlComponent` llama `disconnect()` y cancela fetch y backoff;
- en modo mock no se abre conexión real.

## Evento de negocio

El único evento consumido por esta vertical es:

```ts
type: 'ASISTENCIAS_SESION_ACTUALIZADAS'

interface AttendanceSessionUpdatedRealtimePayload {
  grupo: string;
  sesion: string;
  totalRegistros: number;
}
```

`AttendanceRealtimeSyncService` filtra por el grupo y la sesión visibles y aplica `auditTime(250ms)`. El payload no se usa para mutar filas: cualquier evento válido dispara un nuevo GET de estudiantes y asistencias, y el backend vuelve a ser la fuente de verdad.

## Reconexión y resincronización

El transporte conserva el refresh de token, el backoff `1s, 2s, 5s, 10s, 30s`, el `403` terminal y la cancelación con `AbortController`.

El sync observa `connectionState$` con `pairwise()`:

```text
RECONNECTING -> CONNECTED -> refetch de la sesión visible
```

La conexión inicial `CONNECTING -> CONNECTED` no dispara un refetch adicional. No se requiere replay SSE: después de una reconexión siempre se consulta la fuente de verdad.

## Persistencia batch

El command canónico es `POST /api/v1/asistencias/lote`. Tras una respuesta exitosa, el cliente que guardó también vuelve a consultar el backend; no depende de recibir su propio evento SSE.

## Smoke real

`npm run e2e:realtime:smoke` requiere:

```text
API_URL
E2E_ACCESS_TOKEN
E2E_GROUP_ID
```

El script conecta a `/realtime/stream?grupoId=...` y espera `ASISTENCIAS_SESION_ACTUALIZADAS`. Si también se definen `E2E_SESSION_ID` y `E2E_ATTENDANCE_RECORDS_JSON`, abre primero el SSE, ejecuta el POST batch y valida que `payload.grupo` y `payload.sesion` coincidan. No usa `/realtime/emit` ni imprime el token.

## Cobertura

`npm run coverage:realtime:check` exige, para `src/app/core/realtime/**` y el sync de asistencia, LINE >= 90% y BRANCH >= 80%.
