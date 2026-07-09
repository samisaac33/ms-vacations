# Dominio: MS Vacations

Plataforma de **alquiler vacacional directo** en Manabí, Ecuador. No es un sistema de vacaciones de empleados (RRHH).

## Destinos

| Destino | Ubicación | Tipo |
|---------|-----------|------|
| Playa | San Clemente | Casas vacacionales |
| Ciudad | Portoviejo | Apartamentos |

## Entidades principales

### Property (catálogo estático + fila en DB)

- Datos de presentación: nombre, fotos, capacidad, ubicación (`lib/properties.ts`)
- Datos operativos en PostgreSQL: `slug`, `ical_url`, `base_price_per_night_cents`

### ExternalBlock

Bloqueos importados desde calendarios iCal externos (Airbnb, Booking, etc.).

### Booking

Reserva del huésped con fechas, huéspedes, método de pago y estado.

| Estado | Significado |
|--------|-------------|
| `pending_payment` | Esperando pago del huésped |
| `pending_verification` | Transferencia enviada, pendiente de revisión admin |
| `confirmed` | Reserva confirmada |
| `cancelled` | Cancelada |
| `expired` | Caducó el plazo de pago |

### NightlyRate

Override de precio por noche (admin). Sin fila → tarifa base de la propiedad.

## Flujos del huésped

1. Explorar catálogo en `/` o `/propiedades`
2. Ver ficha en `/propiedades/[slug]`
3. Reservar en `/reservar/[slug]` — calendario, huéspedes, método de pago
4. Pagar (PayPal, PayPhone o transferencia bancaria)
5. Confirmación en `/reserva/exito` o subida de comprobante en `/reserva/transferencia/[bookingId]`

## Flujos del administrador

- Login en `/admin` con `ADMIN_SECRET`
- Sincronizar iCal, revisar calendario multi-propiedad
- Gestionar precios por noche
- Aprobar o rechazar comprobantes de transferencia

## Reglas de negocio relevantes

- Fechas en zona `America/Guayaquil` (sin horario de verano)
- Estancia modelada como `[checkIn, checkOut)` — la noche del check-out no se cobra
- Transferencia bancaria aplica **7 % de descuento** sobre el total (`BANK_TRANSFER_DISCOUNT_RATE = 0.93`)
- Cron diario (`vercel.json`) sincroniza iCal con `CRON_SECRET`

## Rutas clave

| Ruta | Propósito |
|------|-----------|
| `/api/availability` | Disponibilidad por propiedad y rango |
| `/api/pricing` | Cotización de estancia |
| `/api/bookings` | Crear reserva |
| `/api/cron/sync-ical` | Sincronización programada |
| `/api/health` | Estado de DB e iCal (monitoreo) |
| `/api/admin/pricing` | API admin de precios |

## Para agentes de código

- **No reimplementar** backend si ya existe en `app/api/` y `lib/`
- Cambios de UI deben conservar rutas y contratos de API existentes
- El catálogo visual vive en `lib/properties.ts`; precios y bloqueos en PostgreSQL
