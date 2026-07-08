# MS Vacations

Alojamientos vacacionales en **San Clemente** (playa) y **Portoviejo** (ciudad), Manabí, Ecuador. Reserva directa sin comisiones.

## Estado del proyecto

**Fase A** en progreso: home con selector de destino, propiedades reales y nueva identidad visual costera.

Consulta [docs/DOMAIN.md](./docs/DOMAIN.md) para el modelo de dominio y roadmap.

## Producción

[https://ms-vacations.vercel.app](https://ms-vacations.vercel.app)

## Requisitos

- Node.js 20+
- npm 10+

## Inicio rápido

```bash
npm install
cp .env.example .env
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción |
| `npm run lint` | ESLint |
| `npm test` | Tests (watch) |
| `npm run test:ci` | Tests (CI) |

## Estructura

```
ms-vacations/
├── app/                    # App Router
├── components/
│   ├── destinations/       # Selector San Clemente / Portoviejo
│   ├── properties/         # Cards y secciones de alojamientos
│   ├── trust/              # Badges y ventajas
│   └── layout/             # Header, footer, WhatsApp
├── lib/properties.ts       # Datos de propiedades
└── docs/DOMAIN.md
```

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | URL pública del sitio |
| `NEXT_PUBLIC_WHATSAPP_URL` | Enlace de contacto WhatsApp |

## Stack

- Next.js 16 (App Router)
- React 19, TypeScript, Tailwind CSS 4
- Vitest + React Testing Library
