# MAINT-004 — Validación

## Baseline

- HEAD auditado: `b0c2225`.
- Rama de integración creada: `jose-valencia/maint-004-frontend-utc-v2-integration`.
- `git status` inicial: limpio.
- `git fetch origin --prune`: bloqueado por `Permission denied` al escribir `.git/FETCH_HEAD`; se usaron referencias locales.
- `npm run test:ci`: el bundle se generó, pero ChromeHeadless no pudo arrancar en el entorno (`Cannot start ChromeHeadless`, 3 intentos). No se cuenta como PASS ni como ejecución funcional.

## Validación ejecutada durante el trabajo

- `npm ci`: PASS tras reintento con permisos elevados; el primer intento sandbox falló por `EPERM` en `node_modules` bloqueado por Windows/OneDrive. npm reportó 59 vulnerabilidades existentes en el árbol instalado; no se ejecutó `npm audit fix` porque no forma parte de MAINT-004.
- `npm run build -- --configuration=development`: PASS.
- `npm run test:ci`: bundle de pruebas PASS, pero Karma no pudo iniciar `ChromeHeadless`; no se cuenta como PASS funcional.
- `npm run coverage:realtime:check`: FAIL esperado porque el bloqueo del navegador no generó `coverage/**/lcov.info`.
- `npm run build -- --configuration=production`: PASS con acceso de red autorizado para inlining de Google Fonts.
- `npm run verify`: intentado; se detuvo en `test:ci` por el mismo bloqueo de `ChromeHeadless`, por lo que no alcanzó cobertura ni build dentro del encadenamiento.
- Pruebas unitarias agregadas: compiladas por el proyecto; ejecución completa queda condicionada a un ChromeHeadless disponible.
- Backend/DB reales: no se declaró E2E; el acceso al checkout backend permitió inspeccionar OpenAPI y configuración, no ejecutar un smoke contra servicios.

## Validación pendiente

1. Repetir `npm run test:ci`, cobertura y `npm run verify` con Node 20 y ChromeHeadless operativo en CI.
2. Smoke SSE y recorrido manual por rol contra backend/DB locales encendidos.

