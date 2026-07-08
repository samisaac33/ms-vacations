# ms-vacations

Microservicio de gestión de vacaciones construido con [Next.js 16](https://nextjs.org) (App Router), React 19 y TypeScript.

## Estado del proyecto

El repositorio está en **Fase 0**: fundamentos de calidad y documentación de dominio. La lógica de negocio (API, base de datos, UI de vacaciones) se implementará en fases posteriores.

Consulta [docs/DOMAIN.md](./docs/DOMAIN.md) para el modelo de dominio, flujos y roadmap.

## Requisitos

- Node.js 20+
- npm 10+

## Inicio rápido

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

## Scripts

| Comando        | Descripción                              |
|----------------|------------------------------------------|
| `npm run dev`  | Servidor de desarrollo con hot reload    |
| `npm run build`| Build de producción                      |
| `npm run start`| Servidor de producción                   |
| `npm run lint` | Análisis estático con ESLint             |
| `npm test`     | Tests en modo watch (Vitest)             |
| `npm run test:ci` | Tests en modo CI (una sola ejecución) |

## Estructura

```
ms-vacations/
├── app/              # App Router (páginas y API routes)
├── docs/             # Documentación de dominio
├── __tests__/        # Tests unitarios
├── public/           # Assets estáticos
└── .github/workflows # CI con GitHub Actions
```

## CI

Cada push y pull request a `main` ejecuta automáticamente:

1. `npm ci`
2. `npm run lint`
3. `npm run test:ci`
4. `npm run build`

## Convenciones para agentes

Las reglas para agentes de IA (Cursor, etc.) están en [AGENTS.md](./AGENTS.md).

## Stack

- **Framework:** Next.js 16.2 (App Router, Turbopack)
- **UI:** React 19, Tailwind CSS 4
- **Lenguaje:** TypeScript (strict)
- **Tests:** Vitest, React Testing Library
- **Lint:** ESLint con `eslint-config-next`

## Próximos pasos (Fase 1)

- Modelo de datos con Prisma y PostgreSQL
- Route Handlers REST en `app/api/vacations/`
- Validación de entrada con Zod
- Endpoint de health check en `app/api/health/`
