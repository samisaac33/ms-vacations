# MS Vacations

Sitio de alquiler vacacional directo en **San Clemente** (playa) y **Portoviejo** (ciudad), Manabí, Ecuador.

Producción: [ms-vacations.vercel.app](https://ms-vacations.vercel.app)

## Stack

- Next.js 16 (App Router)
- PostgreSQL + Drizzle ORM
- Sincronización iCal (`node-ical`)
- Pagos: transferencia bancaria, PayPal, PayPhone
- Deploy en Vercel

## Requisitos

- Node.js 20+
- PostgreSQL (local o remoto)

## Configuración local

```bash
cp .env.example .env.local
# Edita .env.local con DATABASE_URL, ADMIN_SECRET, etc.

npm install
npm run db:push    # crea tablas
npm run db:seed    # datos iniciales de propiedades
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### Variables de entorno

Consulta `.env.example` para la lista completa. Las mínimas para desarrollo:

| Variable | Uso |
|----------|-----|
| `DATABASE_URL` | Conexión PostgreSQL |
| `ADMIN_SECRET` | Acceso al panel `/admin` |
| `NEXT_PUBLIC_SITE_URL` | URL base del sitio |

En producción (Vercel) configura también `CRON_SECRET`, credenciales de pago y Supabase si usas comprobantes de transferencia.

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | ESLint |
| `npm run test` | Tests (Vitest, watch) |
| `npm run test:ci` | Tests una sola vez (CI) |
| `npm run db:generate` | Generar migraciones Drizzle |
| `npm run db:migrate` | Aplicar migraciones |
| `npm run db:push` | Sincronizar esquema sin migración |
| `npm run db:seed` | Seed de propiedades |

## Estructura

```
app/           Páginas y API routes
components/    UI reutilizable
db/            Esquema y conexión Drizzle
lib/           Lógica de negocio (reservas, precios, iCal, pagos)
docs/          Documentación de dominio
```

El modelo de dominio está descrito en [`docs/DOMAIN.md`](docs/DOMAIN.md).

## CI

Cada push/PR a `main` ejecuta lint, tests y build (`.github/workflows/ci.yml`).

## Admin

1. Define `ADMIN_SECRET` en el entorno
2. Visita `/admin` e inicia sesión
3. Desde ahí: iCal, calendario, precios y pagos pendientes

## Cron iCal

Vercel ejecuta `/api/cron/sync-ical` diariamente (ver `vercel.json`). Requiere `CRON_SECRET` en el header `Authorization: Bearer <secret>`.

La respuesta incluye resultado por propiedad y un resumen de salud iCal. Si alguna propiedad falla, el endpoint devuelve HTTP `207`.

## Monitoreo

`GET /api/health` devuelve el estado operativo del sitio:

- **`ok`**: base de datos accesible, iCal al día, sin errores recientes
- **`degraded`**: DB ok pero iCal desactualizado o errores en las últimas 24 h (HTTP 200)
- **`down`**: base de datos no disponible (HTTP 503)

Útil para UptimeRobot, Better Stack o revisión manual. Ejemplo:

```bash
curl -s https://ms-vacations.vercel.app/api/health | jq .
```
