# VALIDATION — HU051-retirar-estudiante-grupo

| Comando | Resultado |
|---|---|
| `npm run test:ci` (2026-10-27, tras la revisión de SonarCloud del PR #17) | `TOTAL: 1241 SUCCESS` (1227 de develop + 14 de HU051: RT-01..RT-14), exit 0 |
| Cobertura de líneas en código nuevo frente a `develop` (lcov × diff) | 50/50 = 100 % (SonarCloud exige ≥ 80 %) |
| `npm run coverage:realtime:check` | `PASSED` |
| `npx ng build --configuration=production` | exit 0 |
| GitHub Actions / SonarCloud | en el PR hacia `develop` (re-ejecución tras el próximo push) |

Limitaciones: prueba manual en pantalla pendiente (MV-008); en modo Security Baseline la ruta requiere reaprovisionar el PDP (Alejo).
