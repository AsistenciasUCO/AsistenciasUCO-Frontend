# MAINT-004 — Handoff

## Listo para revisión

- Rama de integración creada sin merge a `develop`.
- v1 preservado y v2 encapsulado en `SessionV2Service`.
- URLs de API separadas y feature flag `USE_SESSIONS_V2`.
- Zona IANA, DST explícito, medianoche y precisión de strings v2.
- Estados temporales visibles y sesiones históricas no reinterpretadas.
- POST/PATCH recargan desde backend; no hay selección por coincidencia de nombre/fecha.
- Directorio coordinador migrado a página real en modo real.
- Constructor administrativo sin side effects.
- Reclamos 501 y perfil sin contrato se separan de los flujos exitosos.
- Archivos alineados a `fileId` y descarga autenticada.

## No declarar terminado

- No hay ejecución E2E real documentada.
- ChromeHeadless no inicia en este entorno.
- No se verificó que el backend/DB locales estén encendidos ni se cambió `APP_SESIONES_V2_ENABLED`.
- Reclamos docentes listado y perfil institucional siguen pendientes del backend.
- No se debe hacer merge a `develop` hasta completar CI y smoke manual.

## Siguiente paso recomendado

Repetir `npm run verify` con Node 20/ChromeHeadless operativo y ejecutar el smoke SSE en un ambiente backend/DB compatible; después activar v2 y recorrer la guía por rol. La instalación limpia `npm ci` ya fue validada en esta rama.

