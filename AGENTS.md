<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Guía para agentes: ms-vacations

## Contexto del proyecto

**MS Vacations** es una plataforma de alquiler vacacional directo en San Clemente (playa) y Portoviejo (ciudad), Manabí, Ecuador. El dominio está documentado en [docs/DOMAIN.md](./docs/DOMAIN.md).

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
  alojamientos/[slug]/   # Fichas de propiedad (Fase B)
  api/                   # Route Handlers futuros
components/
  destinations/          # Selector de destino
  properties/            # Cards y listados
  trust/                 # Badges, ventajas
  layout/                # Header, footer, WhatsApp
lib/
  properties.ts          # Datos de propiedades
types/
__tests__/
docs/
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

- **Dirección visual:** costa cálida + confianza local (NO clonar Airbnb)
- **Color primario:** `#0D6E6E` (mar) — clases `text-primary`, `bg-primary`
- **Acento:** `#E8A838` (sol/arena) — precios y destacados
- **Tipografía:** DM Sans (cuerpo) + Fraunces (titulares, clase `font-display`)
- **Patrones:** selector de destino primero, cards con foto real, badge "Reserva directa", WhatsApp visible
- Textos en **español ecuatoriano** (`lang="es-EC"`)
- Fotos reales de propiedades; evitar gradientes abstractos como sustituto
- Componentes en `components/properties/`, `components/destinations/`, `components/trust/`

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
| A    | En progreso | Home, destinos, cards reales, identidad  |
| B    | Pendiente   | Fichas de propiedad, landings por destino|
| C    | Pendiente   | Calendario, reserva, WhatsApp integrado  |
| D    | Pendiente   | CMS/DB, disponibilidad, admin            |

Al implementar una fase, actualizar el estado en `docs/DOMAIN.md` y esta tabla.

## Referencias útiles

- Docs locales Next.js: `node_modules/next/dist/docs/`
- Vitest con Next.js: `node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md`
- Dominio: [docs/DOMAIN.md](./docs/DOMAIN.md)
