# MAINT-004 — Guía de pruebas manuales por rol

Usar `USE_MOCKS=false`. Para UTC v2, activar además `USE_SESSIONS_V2=true` en el runtime y verificar que el backend tenga `app.sesiones.v2.enabled=true`. Registrar cada evidencia sin tokens.

## ADMINISTRADOR

| Acción | Endpoint / rol | Datos | Resultado |
|---|---|---|---|
| Abrir catálogos | GET de catálogo soportado / ADMINISTRADOR | JWT admin | Solo se solicitan catálogos de la pantalla; errores 403/501 se muestran |
| Revisar parámetros/auditoría | GET soportado / ADMINISTRADOR | JWT admin | No se disparan consultas al construir servicios |
| Perfil | GET perfil / autenticado | JWT válido | 501 no cierra sesión; edición queda pendiente |

## DECANO

| Acción | Endpoint / rol | Datos | Resultado |
|---|---|---|---|
| Ver grupos y detalle | endpoints existentes / DECANO | grupo autorizado | Las sesiones no se convierten a UTC inventado |
| Consultar catálogos | GET soportados / DECANO | facultad/institución | Datos coherentes; 403 no se oculta como lista vacía |

## COORDINADOR

| Acción | Endpoint / rol | Datos | Resultado |
|---|---|---|---|
| Buscar estudiantes | `GET /api/v1/estudiantes?page=0&size=6&nombre=...` / COORDINADOR | nombre, documento, estado | Resultados, `totalItems` y páginas vienen del servidor |
| Cambiar página/filtro | mismo endpoint | página vacía y filtro combinado | Reinicia a página cero; no carga miles en memoria |
| Matrícula por grupo | `/grupos/{grupoId}/estudiantes` | ID estudiante real | Se conserva el ID y se recarga el grupo |

## DOCENTE

| Acción | Endpoint / rol | Datos | Resultado |
|---|---|---|---|
| Cargar grupos | `GET /api/v1/docente/horarios` | JWT DOCENTE | Grupos scopeados y SSE con Bearer |
| Consultar sesiones v2 | `GET /api/v2/sesiones/grupo/{grupoId}` | flag v2 + grupo propio | Confirmadas muestran zona activa; históricas dicen “horario no confirmado” |
| Crear sesión v2 | `POST /api/v2/sesiones` | nombre, fecha/hora local, zona IANA | Body con offset; 201; listado se vuelve a consultar |
| Editar solo nombre | `PATCH /api/v2/sesiones/{id}` | sesión existente | Instantes conservan todos sus decimales |
| Editar horario | PATCH v2 | horario DST/medianoche | Se comparan instantes; hora inexistente/ambigua se rechaza explícitamente |
| Tomar asistencia | GET grupo/asistencias + POST lote | IDs reales y `AN/SJC/EX` | `EX` permanece `EX`; éxito activa recarga/SSE |
| Reclamos | GET docente/reclamos | JWT DOCENTE | 501 se informa; no se muestran mocks en real |

## ESTUDIANTE

| Acción | Endpoint / rol | Datos | Resultado |
|---|---|---|---|
| Subir soporte | `POST /api/v1/archivos/subir` / ESTUDIANTE | PDF/JPG/PNG válido | Respuesta contiene `fileId`, `nombre`, `url`, `tamanio` |
| Radicar reclamo | `POST /api/v1/asistencias/revisiones` | sesión, categoría, justificación | Se guarda el ID de archivo si existe |
| Consultar sesión histórica | endpoint estudiantil v1 existente | sesión propia | No se inventa zona ni se oculta la asistencia |

