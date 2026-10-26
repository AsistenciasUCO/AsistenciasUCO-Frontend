# Contrato frontend-backend

> **Snapshot histórico:** este documento describe principalmente el contrato v1 congelado en septiembre de 2026. Para la integración MAINT-004, el OpenAPI local del backend `develop` añade sesiones UTC v2 sin reemplazar v1. La matriz vigente está en `docs/work-items/MAINT-004-frontend-backend-db-alignment/CONTRACT_MATRIX.md`; no usar este snapshot para inferir el wire temporal v2.

El backend congelado es la fuente de verdad. Las consultas usan DTO tipados y propagan los errores HTTP; en modo real no se transforman fallos en datos vacíos ni en asistencia `AN` ficticia.

## Flujo de asistencia docente

### Grupos del docente

```http
GET /api/v1/docente/horarios
```

Las filas se deduplican por `idGrupo` y sus bloques únicos forman `Course.schedule`. La pantalla docente no usa `GET /grupos`.

### Sesiones

```http
GET /api/v2/sesiones/grupo/{grupoId}
```

Se usa `SesionV2ApiDto` (UTC V2, sin bandera ni fallback a V1). No existe fallback a `POST /sesiones/consultas`. `POST /api/v2/sesiones` responde `ApiMessageResponse`; después de crear, el frontend vuelve a consultar el listado y selecciona la sesión más reciente.

### Estudiantes del grupo

```http
GET /api/v1/grupos/{grupoId}/estudiantes
```

La identidad tiene esta semántica obligatoria:

```text
EstudianteGrupo.id = matrícula
idEstudiante       = estudiante real y studentId de asistencia
documento          = studentCode mostrado en UI
```

### Consulta de asistencia

```http
GET /api/v1/grupos/{grupoId}/asistencias?sesionId={sesionId}
```

El frontend usa exclusivamente `estado`, cuyos valores válidos son `AN`, `SJC` y `EX`. Nunca reconstruye el estado con `presente`; por ello `estado=EX` y `presente=false` se conserva como `EX`. Una asistencia inexistente se inicializa como `AN`; un estado existente fuera del contrato se trata como mismatch.

### Command batch

```http
POST /api/v1/asistencias/lote
Content-Type: application/json
```

```json
{
  "sesionId": "UUID",
  "registros": [
    { "estudianteId": "UUID", "estado": "AN" },
    { "estudianteId": "UUID", "estado": "SJC" },
    { "estudianteId": "UUID", "estado": "EX" }
  ]
}
```

No se envían `grupoId`, `studentId`, `status`, `notes` ni `observaciones`. El flujo individual `POST /asistencias` no forma parte de esta vertical.

## Realtime

El stream es `GET /api/v1/realtime/stream?grupoId={UUID}` y publica `ASISTENCIAS_SESION_ACTUALIZADAS`. El detalle de lifecycle, scope y reconexión está en `docs/frontend-realtime.md`.

## Coordinación y decanatura — HU081-HU083, HU096-HU098, HU060-HU064, HU104-HU145 y HU108 (2026-10-26)

Contrato completo de cada vertical en el `CONTRACT.md` del work item homónimo del backend; aquí solo el consumo del frontend. Todas las listas usan `ApiResponse<T[]>` con `total`; los errores se muestran con `getApiErrorMessage`.

| Pantalla | Llamadas | Notas de consumo |
|---|---|---|
| Malla del coordinador (HU081-HU083) | `PATCH /api/v1/coordinador/planes-estudio/{id}/toggle-estado`, `POST .../{id}/semestres`, `DELETE .../{id}/semestres/{numero}` | `normalizarPlanEstudio` (inp, `estaActivoPlanEstudio`, `totalSemestres`) y `normalizarAsignaturaPlan` (`credito`→`creditos`, `codigoSemestre`→`semestre`); máximo 10 semestres. |
| `admin/periodos` (HU096-HU098) | `POST`/`PUT /{id}`/`DELETE /{id}` sobre `/api/v1/admin/periodos-academicos` | Solo el administrador; coordinador y decano consumen `GET /api/v1/coordinador/periodos-academicos` en modo lectura. El estado (planeación/activo/cerrado) se calcula con las fechas en `normalizarPeriodoAcademico`. |
| `coordinador/asistencias` (HU064, HU060, HU061) | `GET /api/v1/coordinador/grupos`, `/grupos/{id}/sesiones`, `/sesiones/{id}/asistencias` | Filtros vacíos no se envían; paginación `pagina`/`tamano` (1..100). |
| `decano/estudiantes`, `decano/estructura`, `decano/cronograma` (HU104, HU105, HU109, HU119, HU145) | `GET /api/v1/decano/estudiantes`, `/estudiantes/{id}`, `/estructura`, `/sesiones` | Servicio propio `DeanFacultadService`; la estructura llega como árbol Facultad → Programa → Plan. |
| `decano/programas` y `decano/programas/:planId` (HU108) | `GET /api/v1/decano/estructura` (planes) y `GET /api/v1/decano/planes-estudio/{id}/asignaturas` (malla) | No se usan rutas `/coordinador/**` desde pantallas del decano: `SecurityConfig` no admite DECANO allí. (Rama `feature/HU108-malla-plan-decano`.) |

## Configuración

Docker publica el frontend en `http://localhost:4200`. `API_URL`, `KEYCLOAK_URL`, `KEYCLOAK_REALM`, `KEYCLOAK_CLIENT_ID` y `USE_MOCKS` generan `assets/env.js` en runtime. El client público es `asistencias-uco-frontend`; el client `asistencias-api` continúa siendo la fuente de roles del JWT.
