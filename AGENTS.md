<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Guía para agentes: ms-vacations

## Contexto del proyecto

`ms-vacations` es un microservicio de gestión de vacaciones. El dominio está documentado en [docs/DOMAIN.md](./docs/DOMAIN.md). Consulta ese archivo antes de implementar lógica de negocio.

## Stack y versiones

| Tecnología  | Versión / nota                          |
|-------------|-----------------------------------------|
| Next.js     | 16.x — App Router, consultar docs locales |
| React       | 19.x                                    |
| TypeScript  | strict mode                             |
| Tailwind    | v4 (`@import "tailwindcss"`)            |
| Tests       | Vitest + React Testing Library          |
| Validación  | Zod (desde Fase 1)                      |
| ORM         | Prisma (desde Fase 1)                   |

## Convenciones de código

### Estructura de carpetas

```
app/
  (dashboard)/          # Rutas de UI agrupadas (Fase 2)
  api/
    health/route.ts     # Health check
    vacations/route.ts  # CRUD de solicitudes
components/             # Componentes reutilizables
lib/
  validations/          # Esquemas Zod
  db/                   # Cliente Prisma
types/                  # Tipos de dominio compartidos
__tests__/              # Tests unitarios
docs/                   # Documentación
```

### Nombres

- Archivos de componentes: `PascalCase.tsx` (ej. `VacationCard.tsx`)
- Utilidades y validaciones: `camelCase.ts` (ej. `vacation.ts`)
- Route Handlers: siempre `route.ts` dentro de la carpeta de ruta
- Tests: `*.test.ts` o `*.test.tsx` en `__tests__/` o colocados junto al módulo

### TypeScript

- Usar tipos explícitos en APIs públicas y Route Handlers
- Preferir `interface` para entidades de dominio, `type` para uniones y utilidades
- No usar `any`; usar `unknown` con narrowing cuando sea necesario

### API (Route Handlers)

- Respuestas JSON con `NextResponse.json()`
- Códigos HTTP semánticos: 200, 201, 400, 404, 409, 500
- Validar body y query con Zod antes de procesar
- Mensajes de error en español para respuestas al cliente

### Tests

- Tests unitarios con Vitest; no usar Jest
- Mock de `next/image` ya configurado en `vitest.setup.ts`
- Ejecutar `npm run test:ci` antes de abrir PR (modo no-watch)
- No testear Server Components `async` con Vitest; usar E2E para esos casos

### Estilo y UI

- Tailwind CSS para estilos; evitar CSS modules salvo casos excepcionales
- Textos de interfaz en **español**
- `lang="es"` en el layout raíz (aplicar en Fase 2)
- Componentes accesibles: labels, roles ARIA, navegación por teclado

## Flujo de trabajo para agentes

1. **Una responsabilidad por PR** — cambios acotados y revisables
2. **Ramas:** `cursor/<descripcion>-54ec`
3. **Verificar localmente:** `npm run lint && npm run test:ci && npm run build`
4. **No modificar** archivos no relacionados con la tarea
5. **Documentar** cambios de dominio o API en `docs/DOMAIN.md`

## Variables de entorno

Ver [.env.example](./.env.example). Nunca commitear archivos `.env` con secretos reales.

## Fases de implementación

| Fase | Estado      | Alcance principal                        |
|------|-------------|------------------------------------------|
| 0    | En progreso | CI, tests, docs, convenciones            |
| 1    | Pendiente   | Prisma, API REST, Zod, health check      |
| 2    | Pendiente   | Dashboard UI, formularios, i18n          |
| 3    | Pendiente   | Seguridad, E2E, Docker, observabilidad   |

Al implementar una fase, actualizar el estado en `docs/DOMAIN.md` y esta tabla.

## Referencias útiles

- Docs locales Next.js: `node_modules/next/dist/docs/`
- Vitest con Next.js: `node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md`
- Dominio: [docs/DOMAIN.md](./docs/DOMAIN.md)
