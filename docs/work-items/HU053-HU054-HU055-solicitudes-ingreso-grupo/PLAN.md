# HU053-HU054-HU055-solicitudes-ingreso-grupo — Solicitudes de ingreso a un grupo

## Objetivo

El estudiante solicita el ingreso a un grupo con el enlace que comparte el docente; el docente titular ve las solicitudes de su grupo y acepta (con cupo matricula; sin cupo quedan en lista de espera) o rechaza con motivo; puede aceptar a cualquiera de la lista de espera cuando se libera cupo; el estudiante retira sus solicitudes abiertas.

## Alcance y límites

- Contrato HTTP, decisiones de John y validación de las 3 capas: work item homónimo del backend (`docs/work-items/HU053-HU054-HU055-solicitudes-ingreso-grupo/`).
- Rama apilada sobre HU051 (se integra después). Sin cambios en la matrícula directa del docente ni en las pantallas del coordinador.

## Pantallas, servicios y simulación

| Elemento | Cambio |
|---|---|
| `SolicitudIngresoService` (`core/services`) | Nuevo: solicitar, mis solicitudes, retirar, bandeja del grupo y resolver; sin toast global (cada pantalla muestra el mensaje del backend) |
| `StudentEnrollmentRequestsComponent` (`/app/estudiante/solicitudes`, menú ESTUDIANTE "Solicitudes de Ingreso") | Nuevo: campo del grupo (precargado con `?grupo=`), lista con estado, docente y motivo de rechazo, filtro por estado, paginación y "Retirar solicitud" en pendientes/en espera |
| `TeacherGrupoSolicitudesComponent` | Nuevo: pestaña "Solicitudes de Ingreso" en el hub del grupo; cupo disponible, orden de llegada, `#n en espera`, Aceptar / Rechazar (motivo obligatorio) |
| `TeacherGrupoHubComponent` | Pestaña nueva `SOLICITUDES` |
| `TeacherMatriculaModalComponent` | El enlace y el QR de auto-matrícula apuntan a `/app/estudiante/solicitudes?grupo={id}` (antes `/app/estudiante/materias?matricularGrupo=`, que llamaba a un endpoint 501) |
| `mock-backend.interceptor` | Las 5 rutas nuevas con la forma del backend |
