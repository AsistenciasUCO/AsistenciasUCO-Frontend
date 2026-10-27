# TEST_PLAN — HU010-HU011-consulta-reclamos-estudiante

Spec: `src/app/features/student/student-claims/student-claims.component.spec.ts`.

| ID | Escenario | Esperado |
|---|---|---|
| SC-01 | Carga inicial | `pagina=1`, `tamano=10`, sin `estado`; muestra materia, estados, respuesta y nombre del soporte |
| SC-02 | Filtro por estado | `estado=RECHAZADA`, página reiniciada a 1; mensaje de lista vacía; "TODOS" quita el parámetro |
| SC-03 | Paginación y tamaño | `pagina=2`; cambiar tamaño reinicia a la página 1 |
| SC-04 | Error 403 | lista vacía, total 0, toast de error |
| SC-05 | Descarga del soporte | `GET /archivos/{fileId}` como blob, nombre de archivo y toast de éxito |
| SC-06 | Error al descargar (404) | toast de error |
| SC-07 | Sin soporte | sin petición, aviso |
| SC-08 | Modo mock | respuesta con la forma de `ApiListResponse` y `total` |

## RED_SNAPSHOT

| Campo | Valor |
|---|---|
| Base commit | `d592bff` |
| Commit RED | `f01f953` (solo el spec) |
| Fallo esperado | módulo `./student-claims.component` y `getReclamosEstudiante` inexistentes (compilación) |
| Comando | `npm run test:ci` |
