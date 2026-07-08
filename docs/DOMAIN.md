# Dominio: ms-vacations

Microservicio de gestión de vacaciones para empleados. Este documento define el modelo de dominio y los flujos que guiarán las fases de implementación.

## Objetivo

Permitir que los empleados consulten su saldo de vacaciones, soliciten días libres y hagan seguimiento del estado de sus solicitudes. En fases posteriores, los managers podrán aprobar o rechazar solicitudes.

## Entidades

### Employee

Representa a un empleado de la organización.

| Campo        | Tipo     | Descripción                          |
|--------------|----------|--------------------------------------|
| `id`         | UUID     | Identificador único                  |
| `name`       | string   | Nombre completo                      |
| `email`      | string   | Correo corporativo (único)           |
| `department` | string   | Departamento o área                  |
| `hireDate`   | date     | Fecha de incorporación               |

### VacationBalance

Saldo anual de días de vacaciones por empleado.

| Campo         | Tipo   | Descripción                              |
|---------------|--------|------------------------------------------|
| `employeeId`  | UUID   | Referencia al empleado                   |
| `year`        | number | Año calendario                           |
| `totalDays`   | number | Días asignados al año                    |
| `usedDays`    | number | Días ya consumidos                       |
| `pendingDays` | number | Días en solicitudes pendientes de aprobación |

### VacationRequest

Solicitud de vacaciones de un empleado.

| Campo        | Tipo     | Descripción                    |
|--------------|----------|--------------------------------|
| `id`         | UUID     | Identificador único            |
| `employeeId` | UUID     | Empleado solicitante           |
| `startDate`  | date     | Primer día de vacaciones       |
| `endDate`    | date     | Último día de vacaciones       |
| `status`     | enum     | Ver estados abajo              |
| `reason`     | string?  | Motivo opcional                |
| `createdAt`  | datetime | Fecha de creación              |

#### Estados (`VacationRequestStatus`)

| Estado     | Descripción                                      |
|------------|--------------------------------------------------|
| `DRAFT`    | Borrador, aún no enviada                         |
| `PENDING`  | Enviada, esperando aprobación                    |
| `APPROVED` | Aprobada por manager                             |
| `REJECTED` | Rechazada por manager                            |
| `CANCELLED`| Cancelada por el empleado                        |

## Flujos principales

### 1. Consultar saldo

El empleado accede a su dashboard y ve los días disponibles, usados y pendientes del año en curso.

### 2. Crear solicitud

1. El empleado indica rango de fechas (`startDate`, `endDate`).
2. El sistema valida que las fechas sean futuras y que el saldo sea suficiente.
3. La solicitud se crea con estado `PENDING`.

### 3. Seguimiento

El empleado consulta el listado de sus solicitudes con el estado actual de cada una.

### 4. Aprobación (Fase posterior)

Un manager revisa solicitudes `PENDING` y las aprueba o rechaza.

## Reglas de negocio

- `endDate` debe ser igual o posterior a `startDate`.
- Los días solicitados no pueden superar el saldo disponible (`totalDays - usedDays - pendingDays`).
- No se permiten solicitudes con fechas en el pasado.
- Una solicitud `APPROVED` incrementa `usedDays` y decrementa `pendingDays` en el saldo.

## API prevista (Fase 1)

| Método | Ruta                      | Descripción                    |
|--------|---------------------------|--------------------------------|
| GET    | `/api/health`             | Health check del servicio      |
| GET    | `/api/vacations`          | Listar solicitudes             |
| POST   | `/api/vacations`          | Crear solicitud                |
| GET    | `/api/vacations/[id]`     | Obtener solicitud por ID       |
| PATCH  | `/api/vacations/[id]`     | Actualizar estado o cancelar   |
| GET    | `/api/balances/[employeeId]` | Consultar saldo anual       |

## Roadmap de fases

| Fase | Alcance                                              | Estado      |
|------|------------------------------------------------------|-------------|
| 0    | CI, tests, documentación, convenciones para agentes  | En progreso |
| 1    | Modelo de datos, API REST, validación con Zod        | Pendiente   |
| 2    | UI de dashboard, formularios, i18n (español)         | Pendiente   |
| 3    | Seguridad, E2E, Docker, observabilidad               | Pendiente   |
