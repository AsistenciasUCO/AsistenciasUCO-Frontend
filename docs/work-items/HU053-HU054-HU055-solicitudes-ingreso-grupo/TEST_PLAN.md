# TEST_PLAN — HU053-HU054-HU055-solicitudes-ingreso-grupo

| ID | Escenario | Esperado |
|---|---|---|
| SV-01 | Solicitar | `POST /estudiante/solicitudes-matricula` con `{grupoId}`, sin toast global |
| SV-02 | Mis solicitudes | `estado`, `pagina`, `tamano`; sin `estado` si es "Todos" |
| SV-03 | Retirar | `POST .../{id}/retiro` |
| SV-04 | Bandeja del docente | `GET /docente/grupos/{grupoId}/solicitudes-ingreso` con filtros |
| SV-05 | Resolver | `PATCH /docente/solicitudes-ingreso/{id}`: `{accion:'RECHAZAR', motivo}` o `{accion:'ACEPTAR'}` |
| SE-01 | Página del estudiante | estado legible, asignatura, motivo de rechazo; "Retirar" solo en pendientes/en espera |
| SE-02 | Enlace `?grupo=` | precarga el grupo; solicitar avisa y recarga |
| SE-03 | Validación y 409 | grupo no UUID no llama al backend; 409 muestra el mensaje |
| SE-04 | Retirar | POST y recarga |
| SE-05 | Filtro y error | `estado=RECHAZADA`; error 500 limpia la lista y avisa |
| TS-01 | Pestaña del docente | "Cupos disponibles: 0 de 30", "#1 en espera", botones en abiertas |
| TS-02 | Aceptar sin cupo | `EN_ESPERA` → aviso informativo y recarga |
| TS-03 | Aceptar con cupo (de la lista de espera) | `ACEPTADA` → éxito y recarga |
| TS-04 | Rechazar | motivo obligatorio; envía el motivo recortado |
| TS-05 | 409 y filtro | muestra el error; `estado=EN_ESPERA` |
| MK-01 | Mock | solicitar, listar (estudiante y docente), resolver y retirar |

## RED_SNAPSHOT

| Campo | Valor |
|---|---|
| Base commit | `df925f2` (rama apilada sobre HU051) |
| Commit RED | `1fa63b0` (solo specs) |
| Fallo esperado | servicio y componentes inexistentes (compilación) |
| Comando | `npm run test:ci` |
