# Realtime (SSE) en el frontend

## Endpoint y autenticación

```
GET {environment.apiUrl}/realtime/stream
Accept: text/event-stream
Authorization: Bearer <JWT>
X-Correlation-Id: <uuid>
```

- `credentials: 'omit'` explícitamente: la autenticación es JWT Bearer, no cookies.
- El token nunca va en la URL/query string.
- Respuesta: `Content-Type: text/event-stream`.

El backend también expone `GET /api/v1/realtime/status` y `POST /api/v1/realtime/emit`. `/emit` es **solo diagnóstico** y requiere rol `ADMINISTRADOR`; **no** demuestra que el negocio publica eventos, solo que el transporte funciona (ver "Smoke test" más abajo y el gap del lote).

## Por qué no `EventSource` nativo

`EventSource` no permite enviar cabeceras (`Authorization`), así que no puede autenticar contra este endpoint. Se usa [`@microsoft/fetch-event-source`](https://github.com/Azure/fetch-event-source), que corre sobre `fetch` + `ReadableStream`, soporta `Authorization`, `AbortSignal` y da acceso a los eventos SSE ya parseados correctamente (id/event/data, multi-línea, reconexión delegable). No se implementó un parser SSE a mano.

## Estructura del frontend

```
src/app/core/realtime/
├── contract/
│   └── realtime-transport.ts        # puerto RealtimeTransport + InjectionToken
├── model/
│   ├── realtime-event.model.ts      # RealtimeEvent<T>, ASISTENCIA_REGISTRADA, validación
│   └── realtime-connection-state.model.ts
├── adapter/
│   └── sse/
│       ├── fetch-sse-realtime-transport.ts   # único lugar que conoce fetch/SSE/reconexión
│       └── sse-fetch-event-source.token.ts   # indirección testeable sobre fetchEventSource
└── realtime.service.ts              # fachada que consumen las features
```

Principio de capas:

```
Features (AttendanceControlComponent, ...)
    ↓ solo conoce
RealtimeService                (events(), listenType(), start(), stop(), connectionState$)
    ↓ solo conoce
RealtimeTransport (puerto/interfaz + InjectionToken REALTIME_TRANSPORT)
    ↓
FetchSseRealtimeTransport (adapter SSE — hoy)
    ↓
Backend
```

Ninguna feature importa `fetch`, `EventSource`, `AbortController`, cabeceras o parsing SSE. Si en el futuro se necesita WebSocket, se escribe un `WebSocketRealtimeTransport` que implemente `RealtimeTransport` y se cambia el `provide` en `app.config.ts` — `RealtimeService` y las features no cambian.

## Contrato del evento

```ts
export interface RealtimeEvent<TPayload = unknown> {
  eventId: string;
  type: string;
  occurredAt: string;
  correlationId: string | null;
  payload: TPayload;
}
```

Los nombres de campo son exactamente los del backend — no se renombran (`eventId` no se convierte en `id`, `type` no se convierte en `topic`/`action`, etc.). El backend es la fuente de verdad; el frontend legacy que usaba `{id, topic, action, timestamp, data}` fue eliminado por completo, sin alias ni wrapper de compatibilidad.

### Evento soportado hoy

`ASISTENCIA_REGISTRADA`, con:

```ts
interface AttendanceRegisteredRealtimePayload {
  estudiante: string;
  grupo: string;
  sesion: string;
  presente: boolean;
}
```

Se publica **solo** desde el flujo individual `POST /api/v1/asistencias`. **No** se publica desde `POST /api/v1/asistencias/lote` (ver "Gap conocido" más abajo). El frontend no inventa ningún otro tipo de evento: `CONNECTED`, `DATA_CHANGE`, `PING`, `PERIODO_ACTUALIZADO`, `PLAN_ESTUDIO_ACTUALIZADO`, etc. no existen en el backend actual. Las suscripciones ficticias a `PERIODOS`/`PLANES` que existían en `CoordinatorStudyPlansComponent` fueron eliminadas: se reconectarán cuando el backend publique esos tipos formalmente.

## `RealtimeService`

```ts
class RealtimeService {
  connectionState$: Observable<RealtimeConnectionState>;
  events(): Observable<RealtimeEvent>;
  listenType<T>(type: RealtimeEventType | string): Observable<RealtimeEvent<T>>; // match exacto, sin toUpperCase()
  start(): void; // idempotente
  stop(): void;
}
```

## Lifecycle

`RealtimeService`/`FetchSseRealtimeTransport` **no** se conectan desde ningún constructor como efecto secundario. El único punto de arranque/parada es `DashboardLayoutComponent` (vive exactamente durante la sesión autenticada):

```ts
constructor() {
  if (this.authService.isAuthenticated() && !this.authService.isMockMode()) {
    this.realtimeService.start();
  }
  inject(DestroyRef).onDestroy(() => this.realtimeService.stop());
}
```

- En modo mock (`environment.useMocks`) nunca se abre conexión: el propio transporte corta el bucle de conexión antes de llamar a `fetch`.
- Al salir del layout autenticado (logout, navegación fuera de `/app/**`), `stop()` aborta el `fetch` en curso y cancela cualquier temporizador de reconexión pendiente — no quedan reintentos vivos tras logout.
- `start()` es idempotente: llamarlo dos veces no abre dos streams.

## Estado de conexión

```ts
type RealtimeConnectionState =
  | 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED'
  | 'RECONNECTING' | 'UNAUTHORIZED' | 'ERROR';
```

Expuesto como `RealtimeService.connectionState$` para uso futuro en UI/diagnóstico.

## Token, refresh y reconexión

`FetchSseRealtimeTransport` nunca lee `localStorage` directamente. Todo token pasa por:

```ts
AuthService.getValidAccessToken(minValiditySeconds = 30): Promise<string | null>
```

que (mock mode → `null`; sin sesión → `null`; token vigente → lo devuelve; próximo a expirar → refresca una vez y devuelve el nuevo, o `null` si el refresh falla).

Política de reconexión (propiedad exclusiva del adapter, nunca delegada a la librería — `onerror` siempre relanza):

| Situación | Acción |
|---|---|
| `401` al abrir | Un intento de `AuthService.refreshAccessToken()`. Si funciona, reconecta con el token nuevo. Si falla, estado `UNAUTHORIZED` y se detiene (sin loop). |
| `403` al abrir | Estado `ERROR`, terminal — no reintenta agresivamente. |
| Error de red / cierre inesperado | Backoff acotado: 1s, 2s, 5s, 10s, luego techo de 30s (con jitter). Nunca reintenta a intervalo fijo indefinido. |
| `stop()` | Aborta el `fetch` en curso (`AbortController`) y no deja timers de reconexión pendientes. |

## Heartbeat

El backend envía `:heartbeat` como comentario SSE cada ~25s. El parser de `fetch-event-source` descarta las líneas de comentario (no tienen campo `data`) **antes** de invocar `onmessage`, así que nunca llegan a `RealtimeService` ni se muestran al usuario ni disparan refrescos — no requieren manejo explícito ni se inventó un tipo `PING`.

## Validación del payload

Al recibir `data`, se parsea como JSON y se valida que tenga `eventId`, `type`, `occurredAt` (string) y `payload` presente (`correlationId` puede ser `null`). Si el JSON es inválido o la forma no cumple el contrato, se registra un `console.warn` y se descarta sin romper el stream ni propagar el evento a las features. Si el campo SSE `event` y `data.type` no coinciden, también se descarta con warning (política estricta, sin ocultar el mismatch).

## Consumidor conectado: asistencia en vivo

`AttendanceControlComponent` usa `AttendanceRealtimeSyncService` (`src/app/features/attendance/attendance-control/attendance-realtime-sync.service.ts`) para refrescar la vista cuando llega `ASISTENCIA_REGISTRADA` del grupo y sesión actualmente seleccionados:

- Filtra por `payload.grupo === selectedCourseId()` y `payload.sesion === selectedSessionId()`; eventos de otro grupo/sesión se ignoran.
- Coalesce ráfagas de eventos consecutivos con `auditTime(250ms)` para no disparar una tormenta de requests.
- Ante un evento coalescido, siempre vuelve a pedir el estado a backend (`cargarEstudiantesYSesion`) en vez de mutar localmente con el payload — evita divergencia de estado.
- Usa `takeUntilDestroyed()`: no reacciona si el componente ya fue destruido.

## Gap conocido: `/asistencias/lote`

La UI de toma de asistencia guarda mediante `POST /api/v1/asistencias/lote`. El backend **hoy** solo publica `ASISTENCIA_REGISTRADA` desde el flujo individual `POST /api/v1/asistencias`. Por tanto, guardar un lote en la UI actual **no** dispara el evento realtime. Esto no se resolvió inventando nada en el frontend: la recepción queda lista y correcta, pero un E2E UI→backend→SSE que arranque en `/lote` requiere una microfase de backend que publique un evento tras el lote.

Mientras tanto hay dos formas válidas de probar el pipeline E2E:

- **A) Transporte:** conectar con un token `ADMINISTRADOR` y disparar `POST /api/v1/realtime/emit` — confirma que el transporte SSE autenticado funciona, **no** que el negocio publica eventos.
- **B) Negocio real:** conectar con cualquier token válido, hacer `POST /api/v1/asistencias` (flujo individual) desde otro cliente, y verificar que el evento llega — esta es la única prueba real de que el negocio publica `ASISTENCIA_REGISTRADA`.

## Modo mock

Con `environment.useMocks === true`, el transporte nunca abre conexión (`runLoop` corta antes de tocar `fetch`), y `DashboardLayoutComponent` tampoco llama a `start()`.

## Cobertura

`src/app/core/realtime/**` y `attendance-realtime-sync.service.ts` tienen un gate de cobertura propio (`npm run coverage:realtime:check`, ver `scripts/check-realtime-coverage.mjs`): LINE ≥ 90%, BRANCH ≥ 80%, calculado **solo** sobre esos archivos (no la cobertura global del frontend). Estado actual: 93.97% LINE / 84.78% BRANCH.

## Smoke test de contrato

`scripts/realtime-smoke.mjs` (`npm run e2e:realtime:smoke`) conecta contra un backend real con un token real (`API_URL`, `E2E_ACCESS_TOKEN` por variables de entorno, nunca impreso ni en la URL), opcionalmente dispara `/realtime/emit` si el token es `ADMINISTRADOR`, y valida que llegue un evento con la forma esperada. Es un smoke de transporte/contrato, no sustituye el futuro E2E Playwright con frontend + Keycloak + backend + DB.

## Límites actuales

- Solo `ASISTENCIA_REGISTRADA` está conectado; no hay eventos de períodos/planes de estudio (ver arriba).
- `/asistencias/lote` no dispara realtime (ver "Gap conocido").
- No hay WebSocket ni fallback a polling; si el backend cae, el usuario ve el estado `RECONNECTING`/`ERROR` pero la UI sigue funcionando con los datos ya cargados.
- No se migró a Authorization Code + PKCE en esta fase (fuera de alcance); ver `docs/frontend-features-pending.md`.
