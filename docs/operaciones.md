# Operación MS Vacations

## Base de datos

1. Crear proyecto Postgres (p. ej. Neon) y copiar `DATABASE_URL`.
2. Aplicar esquema: `npm run db:push` (desarrollo) o migraciones generadas con `npm run db:generate` + `npm run db:migrate`.
3. Poblar las 5 propiedades con precios e URLs iCal desde el catálogo en código: `npm run db:seed`.

Para aplicar solo el ajuste de tarifas de playa (+7 % sobre el precio directo anterior): `npm run db:update-beach-prices` (requiere `DATABASE_URL`), o pulse **Aplicar tarifas de playa** en `/admin/configuracion`.

Para el esquema de pago fraccionado (`pending_balance`, columnas split): `npm run db:migrate:split-payment` (requiere `DATABASE_URL`), o pulse **Aplicar migración de pago fraccionado** en `/admin/configuracion` si el panel aparece.

La transferencia bancaria revierte el +7 % (`base ÷ 1.07`), no multiplica por 0.93. Ej.: base $535 → transferencia $500.

## Sincronización iCal (Airbnb → web)

Importa reservas y bloqueos **desde Airbnb hacia la web** para evitar doble reserva en el canal directo.

### Mapa propiedad ↔ Google Maps

| Slug (web) | Google Maps |
|------------|-------------|
| `casa-rustica-18-personas-max` | [Rustic House](https://maps.app.goo.gl/qg4NrzUQuzQUhGhn9) |
| `casa-vacacional-home-one-18-personas-max` | [Home One / Home Two (compartido)](https://maps.app.goo.gl/GYGPf5TnSTMtAUkR9) |
| `casa-vacacional-home-two-21-personas` | Mismo enlace que Home One |
| `alojamiento-en-arrecife` | [Home Deluxe Arrecife](https://maps.app.goo.gl/pb7RNYVtzTSdk1Wm9) |
| `home-luxury-la-punta-18-personas-max` | [Home Luxury La Punta](https://maps.app.goo.gl/AcMXwczwft2fmtrZA) |

### Mapa propiedad ↔ listing Airbnb

| Slug (web) | Nombre | Listing iCal (ID en URL) |
|------------|--------|--------------------------|
| `alojamiento-en-arrecife` | Alojamiento en Arrecife | `847175742779477105` |
| `casa-vacacional-home-one-18-personas-max` | Home One | `43089929` |
| `casa-vacacional-home-two-21-personas` | Home Two | `43093803` |
| `casa-rustica-18-personas-max` | Casa rústica | `50403775` |
| `home-luxury-la-punta-18-personas-max` | Home Luxury La Punta | `664011177607035357` |
| `las-hamacas-portoviejo` | Las Hamacas | `1397408558028225842` |
| `los-pinos-portoviejo` | Los Pinos | `1542938339737311039` |

Las URLs completas (con token `t=...`) viven en `properties.ical_url` (seed desde `lib/properties.ts` o edición en `/admin`).

### Cómo sincronizar

**Panel admin (recomendado):**

1. Definir `ADMIN_SECRET` y `DATABASE_URL`.
2. Entrar en `/admin`.
3. Revisar URLs enmascaradas por propiedad; pegar una nueva URL si cambia en Airbnb.
4. Pulsar **Sincronizar iCal ahora** y revisar logs en la misma página.

**Cron automático (Vercel):**

- Variables: `CRON_SECRET`, `DATABASE_URL`.
- Job programado: `GET /api/cron/sync-ical` con cabecera `Authorization: Bearer <CRON_SECRET>` (ver `vercel.json`).
- La respuesta lista cada propiedad (`ok` / `error`) y un resumen de salud. HTTP `207` si hubo fallos parciales.
- Alternativa manual: misma URL y cabecera desde curl o Postman.

**Monitoreo:**

- `GET /api/health` — sin autenticación. Revisa conexión a Postgres, antigüedad de la última sync iCal por propiedad y errores recientes en `sync_logs`.
- Estados: `ok` (todo bien), `degraded` (iCal atrasado o errores recientes), `down` (DB caída → HTTP 503).
- Umbral de iCal obsoleto: **26 h** (cron diario a las 13:00 UTC + margen).

**Límites:** el feed iCal no es tiempo real; hay latencia de Airbnb + intervalo del cron. En Vercel plan Hobby el cron solo puede ejecutarse **como mucho una vez al día** (13:00 UTC en `vercel.json`). Con plan Pro puedes usar intervalos más frecuentes.

**Export inverso (web → Airbnb):** no implementado aún. Las reservas hechas en la web no bloquean Airbnb automáticamente hasta importar un calendario de exportación en el panel de Airbnb (fase 2).

## Pagos (transferencia, PayPal, PayPhone)

### Transferencia bancaria (−7% sobre el total directo)

- Variables: `BANK_ACCOUNT_HOLDER`, `BANK_NAME`, `BANK_ACCOUNT_NUMBER`, `BANK_ACCOUNT_TYPE`, `BANK_ID_TYPE`, `BANK_ID_NUMBER`, `BANK_EMAIL` (opcional).
- Plazo para transferir y subir comprobante: **72 h** (`pending_payment` → `pending_verification`).
- Comprobantes: bucket Supabase `MS_VACATIONS/payment-proofs/` — requiere `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`.
- Confirmación manual en `/admin` (sección «Transferencias pendientes»).

### PayPal

- `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_MODE=sandbox|live`.
- **Smart Buttons (wizard móvil y desktop):** botones embebidos vía SDK de PayPal; la orden se crea en `POST /api/payments/paypal/create-order` al pulsar pagar.
- Tras aprobar en el popup de PayPal, retorno a `/reserva/exito?provider=paypal&bookingId=…&token={ORDER_ID}` → captura vía `POST /api/payments/confirm`.

### PayPhone

- App en Payphone Developer de tipo **WEB** con dominio `NEXT_PUBLIC_SITE_URL` (p. ej. `https://ms-vacations.com`).
- `PAYPHONE_TOKEN`, `PAYPHONE_STORE_ID`.
- **Cajita de pagos (wizard móvil y desktop):** el formulario se carga embebido vía SDK (`PPaymentButtonBox`). Tras el pago, Payphone redirige a la URL de respuesta configurada en Developer.
- Configura la **URL de respuesta** en Payphone Developer como: `{NEXT_PUBLIC_SITE_URL}/reserva/exito?provider=payphone` (Payphone añade `id` y `clientTransactionId`; este último es el `bookingId`).
- Confirmación en servidor: `POST /api/payments/confirm` → `paymentbox.payphonetodoesposible.com/api/confirm` (con fallback al endpoint legacy del botón por redirección).

### General

- `NEXT_PUBLIC_SITE_URL` — URLs de retorno y cancelación.
- **Hold temporal (PayPal/PayPhone):** el bloqueo de fechas (hold 30 min) se crea al pulsar el botón de pago en el paso 4 — PayPal al iniciar la orden (`create-order`); PayPhone al pulsar «Pagar» — no al avanzar desde el desglose de precio.
- Reservas en línea (PayPal/PayPhone) expiran a los **30 min** si no se completa el pago.

## Precios (calendario admin)

- **Hub multi-calendario:** `/admin` — todas las propiedades en filas, días en columnas, precios por noche y barras de estancia (Airbnb / reserva web). `/admin/calendario` redirige aquí.
- **Detalle por propiedad:** `/admin/propiedades/{slug}/precios` — vista mes estilo Airbnb, panel lateral para editar precios por rango.
- Tarifa **base**: editable en el panel lateral «Precios» o vía seed inicial.
- **Overrides por noche:** selecciona días y define el precio final por noche; la web cobra ese valor.
- Días bloqueados (iCal / reserva web) se muestran con patrón rayado y no son editables.
- Cotización en reserva: `GET /api/pricing?slug=…&checkIn=…&checkOut=…` suma cada noche (override o base).
- No hay importación automática de precios desde Airbnb.

## Panel `/admin`

- `ADMIN_SECRET`: contraseña para iniciar sesión (cookie httpOnly).
- Gestión de URLs iCal por propiedad, **calendario multi** en `/admin`, detalle de precios por propiedad, **configuración** en `/admin/configuracion`, sincronización manual y logs.
- Valores iniciales de precio: `npm run db:seed` desde `lib/properties.ts`. Overrides y tarifa base en `/admin/propiedades/{slug}/precios`.
