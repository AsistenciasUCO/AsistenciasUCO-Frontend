# TEST_PLAN — HU051-retirar-estudiante-grupo

Specs: `teacher-retiro-estudiante-modal.component.spec.ts` y el caso HU051 de `teacher-grupo-estudiantes.component.spec.ts`.

| ID | Escenario | Esperado |
|---|---|---|
| RT-01 | Modal abierto | muestra el nombre y el campo "Motivo del retiro" |
| RT-02 | Motivo vacío/espacios | error "obligatorio", sin petición |
| RT-03 | Motivo de 501 caracteres | error "500", sin petición |
| RT-04 | Confirmar | `POST .../docente/grupos/grp-1/estudiantes/est-1/retiro` con `{motivo}` recortado; toast de éxito; emite `retirado` |
| RT-05 | Backend 409 (período terminado) | muestra el mensaje del backend; no emite `retirado` |
| RT-06 | Cerrar | emite `closed` y limpia el motivo |
| RT-07 | Padrón con activo e inactivo | muestra nombre, documento y estado; un solo botón "Retirar" (activo) que emite el estudiante |

## RED_SNAPSHOT

| Campo | Valor |
|---|---|
| Base commit | `73d1119` |
| Commit RED | `e5afbbb` (solo specs) |
| Fallo esperado | componente `TeacherRetiroEstudianteModalComponent` y salida `retirar` inexistentes |
| Comando | `npm run test:ci` |

## Pruebas añadidas por la revisión del PR (SonarCloud, 2026-10-27)

SonarCloud reportó 68.6 % de cobertura en código nuevo (umbral 80 %) y pidió `toHaveSize` en lugar de comparar `length`. Se añadieron:

| ID | Escenario | Esperado |
|---|---|---|
| RT-08 | `GroupService.retirarEstudiante` | `POST .../docente/grupos/{grupoId}/estudiantes/{estudianteId}/retiro` con `{motivo}` |
| RT-09 | Interceptor mock | el retiro responde `exitoso` |
| RT-10 | Hub del grupo | "Retirar" del padrón llega al padre (`retirarEstudiante`) |
| RT-11 | `TeacherGruposComponent` | abre el modal con el estudiante y, tras el retiro, recarga el padrón |
| RT-12 | `TeacherGruposComponent` | acepta la forma heredada (`studentId`), no abre el modal sin id y no recarga sin grupo |
| RT-13 | Modal | sin grupo o mientras envía no llama al backend |
| RT-14 | Modal | sin nombre usa un texto genérico |

**Defecto encontrado por RT-10:** el hub no conectaba `(retirar)` del padrón con su salida `retirarEstudiante` (la inserción original no aplicó por los fines de línea CRLF del archivo), así que el botón "Retirar" no abría el modal en la pantalla real. Corregido en `teacher-grupo-hub.component.ts`.
