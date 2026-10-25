# MAINT-004 — Auditoría de cierre técnico

Fecha de corte: 2026-10-24. Alcance: frontend Angular, backend local UTC V2, SQL Server de desarrollo y validación HTTP local. No se hizo push, PR, merge remoto ni despliegue productivo.

## Dictamen

**NOT_READY_FOR_NEXT_PHASE**.

El frontend queda listo para revisión técnica: UTC V2 es el comportamiento local predeterminado, la preferencia histórica de `localStorage` ya no puede activar V1 silenciosamente, V1 permanece únicamente como superficie de compatibilidad del servidor (no seleccionable desde el frontend) y las sesiones históricas no se reinterpretan. La integración completa permanece bloqueada por la base compartida de desarrollo: el gate oficial `test_summary.ps1` no pudo certificarla y detectó deriva contractual.

## Repositorios preservados

No fue necesario clonar ni sobrescribir checkouts existentes:

| Componente | Checkout utilizado | Rama / revisión | Estado |
|---|---|---|---|
| Frontend activo | `C:\Users\josev\OneDrive\Documentos\Front_Asistecias\AsistenciasUCO-Frontend` | `jose-valencia/p0-h-frontend-functional-integration` / `ecaba7280fc20324e9cb81876b62bc1c7046b6da` | Cambios locales sin commit, preservados |
| Frontend personal de Sergio | `C:\Users\josev\AsistenciasUCO\AsistenciasUCO\.workspace\frontend-p0b` | `codex/p0-b-frontend-verify` / `e33ca3b` | Checkout existente, no alterado |
| DB personal de Jhon | `C:\Users\josev\AsistenciasUCO\AsistenciasUCO\.workspace\gestion-asistencia-db` | `develop` / `a380f29` | Limpio, no alterado |
| DB alternas | `...\.workspace\db-readonly`, `...\.workspace\db-utc-d06` | Checkouts existentes | Preservadas, no alteradas |

El backend conserva sus cambios locales previos; no se hizo reset ni limpieza destructiva.

## Cambio frontend auditado

- `environment.useSessionsV2` parte de `true` y no lee `localStorage.USE_SESSIONS_V2`.
- Ni `window.env` ni `localStorage` pueden seleccionar V1: `SessionService` delega siempre en `SessionV2Service` (con `USE_MOCKS=false`) y no existe fallback silencioso.
- `SessionTimeZoneService` conserva la selección de zona horaria de presentación (`asistenciasuco.session-timezone`); no es una bandera de versión de API.
- Las specs ya no necesitan declarar un opt-out V1; los contratos V1 ajenos al Golden Path de sesiones (cierres, QR) conservan sus URLs.

## Evidencia frontend

| Validación | Resultado exacto |
|---|---:|
| Suite UTC enfocada: zona, DST, precisión, V1/V2 | `34 SUCCESS` |
| Fixtures de compatibilidad V1 | `38/38 PASS` |
| `npm run verify` | `1044 SUCCESS` |
| Coverage statements | `88.98% (5638/6336)` |
| Coverage branches | `72.29% (2369/3277)` |
| Coverage functions | `88.27% (1445/1637)` |
| Coverage lines | `90.17% (5313/5892)` |
| Realtime line gate | `95.06% (231/243)`, PASS |
| Realtime branch gate | `84.52% (71/84)`, PASS |
| Build development | PASS |
| Build production generado en `dist/gestio-asistencia-frontend` | PASS |

El E2E HTTP local `utc-real-jwt-e2e.ps1`, ejecutado contra `http://127.0.0.1:8080` con etiqueta `America/Bogota`, produjo `28/28 PASS`: seguridad, lectura V1 literal, POST/GET/PATCH V2, offsets equivalentes, precisión de 7 decimales, rechazo de timestamps inválidos, preservación histórica V1 y regresiones V1.

## Entorno local

El stack controlado respondió correctamente: frontend `4200`, backend `8080`, Keycloak `8081`, MinIO `9000`, ClamAV `3310` y SQL Server `1433`. La pantalla de login Angular cargó en `http://localhost:4200/login`.

La automatización visual autenticada por los cinco roles no se declara PASS: las cuentas sintéticas locales disponibles cubren estudiante, docente, coordinador y administrador; no existe una cuenta `E2E_DECANO` configurada. Además, la sesión de navegador se dejó en la pantalla de login para no imprimir ni transportar credenciales fuera del flujo autorizado. Por tanto, no se inventa una cobertura visual de rol ni de adjuntos/paginación que no tenga evidencia directa.

## DB: respaldo y gate

Destino validado antes de ejecutar: base `gestionasistenciadb`, contenedor `sql_server_asistencias`, SQL Server `Developer Edition (64-bit)`. El respaldo previo fue creado con `COPY_ONLY` y verificado con `RESTORE VERIFYONLY`:

- Archivo: `C:\Users\josev\AsistenciasUCO\db-backups\gestionasistenciadb_pre_frontend_utc_20261024_180110.bak`
- Tamaño: `22147072` bytes
- SHA-256: `228412167BF8883353D170ACB9F7812EA116095094425542F382BB956CAA6092`
- Verificación: `RESTORE VERIFYONLY=PASS`

Resultado exacto del `test_summary.ps1` del checkout personal de Jhon:

```text
TOTAL_EXPECTED=245
TOTAL_EXECUTED=70
PASSED=47
FAILED=23
SKIPPED=0
ALLOWED_SKIPPED=0
CRITICAL_MISSING=198
SQLCMD_EXIT_CODE=1
SQL_ERROR_COUNT=1
UNAUTHORIZED_SKIPS=0
DB GATE INCOMPLETE
```

El primer fallo contractual fue `PUBLIC_CANONICAL_RESULTSET usp_consultar_detalle_solicitud_revision_docente`: la instancia contiene esa rutina adicional con un resultset de 27 columnas (`idSolicitudRevisionAsistencia` como primera columna), mientras que el contrato canónico exige cuatro columnas (`idCorrelacion`, `mensajeUsuarioResultado`, `mensajeTecnicoResultado`, `estadoResultado`). El checkout aprobado no contiene ese procedimiento y reportó `REPO_PUBLIC_SP_COUNT=37` frente a `INSTANCE_PUBLIC_SP_COUNT=38`; no se eliminó ni se modificó la rutina.

La cifra solicitada de 234 pruebas Failsafe no se corroboró en el reporte disponible. El backend conserva evidencia local de `235` pruebas Failsafe completadas, `0` errores, `0` fallos y `1` omitida (`failsafe-summary.xml`).

## D1/R2 y aprobación requerida

La validación DB `LB-004D` mantiene `LB004D_CONTRACT_APPROVED: NO (revision de John pendiente)`. D1/R2 requieren decisión del owner DB sobre la rutina adicional y el contrato de detalle/revisión antes de aplicar cualquier alineación. No se cambió `test_summary.ps1`, no se cambió el contrato aprobado y no se aplicó `local-db-apply`.

`local-db-apply` del backend existe y contiene `0` archivos en este corte. Los cambios locales del backend y `support-binding-e2e-state.json` se conservaron para su revisión por sus responsables.

## Matriz de funcionalidades probadas

| Funcionalidad | Evidencia | Estado |
|---|---|---|
| Crear sesión V2 en UTC sin opción manual | Unitarias + E2E HTTP `POST /api/v2/sesiones` | PASS |
| Consultar/editar sesión V2 y conservar precisión | Unitarias + E2E HTTP `GET/PATCH`, 7 decimales | PASS |
| `America/Bogota`, DST Berlín y medianoche | Unitarias UTC enfocadas + E2E Bogota | PASS |
| Sesión histórica V1 | E2E: `INDETERMINADA`, V1 literal | PASS |
| V1 compatible | Suite de fixtures V1 y regresiones HTTP | PASS |
| Seguridad/ownership de sesiones | E2E: 401/403/405 y docente ajeno | PASS |
| Grupos, asignaturas, horarios y asistencias | Specs frontend + regresiones HTTP; no recorrido visual por rol | PARCIAL |
| Paginación server-side | Código/specs; E2E visual no ejecutado | PARCIAL |
| Reclamos y adjuntos | Contrato/UI preparado; no E2E autenticado visual | NOT_RUN |
| Ownership de archivos | No certificado en este corte | NOT_RUN |
| Roles estudiante/docente/coordinador/administrador en navegador | Cuentas locales disponibles, pero no se registró login visual | NOT_RUN |
| Rol decano en navegador | Falta cuenta E2E autorizada local | BLOCKED |
| Gate SQL aprobado | `test_summary.ps1` con drift contractual | BLOCKED |

La integración podrá pasar a `READY_FOR_NEXT_PHASE` cuando el owner DB resuelva D1/R2, la instancia sea alineada o el contrato adicional sea aprobado y excluido formalmente, y se repita el gate completo con cero fallos/missing IDs; después debe completarse el smoke visual autenticado por rol, incluido decano.
