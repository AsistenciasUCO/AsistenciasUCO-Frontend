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
