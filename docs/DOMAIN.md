# Dominio: MS Vacations

Plataforma de alquiler vacacional directo en **San Clemente** (playa) y **Portoviejo** (ciudad), Manabí, Ecuador.

## Objetivo

Permitir que huéspedes descubran propiedades, consulten disponibilidad y reserven directamente con MS Vacations, sin comisiones de plataformas externas.

## Destinos

| Destino | Tipo | Perfil de viaje |
|---------|------|-----------------|
| San Clemente | Playa | Familias, grupos grandes (hasta 21 huéspedes), casas con piscina |
| Portoviejo | Ciudad | Viajes laborales, parejas, estadías urbanas cortas |

## Entidades

### Property (Propiedad)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | string | Identificador único |
| `slug` | string | URL amigable |
| `name` | string | Nombre comercial |
| `destination` | enum | `san-clemente` \| `portoviejo` |
| `guests` | number | Capacidad máxima |
| `bedrooms` | number | Dormitorios |
| `bathrooms` | number | Baños |
| `priceFrom` | number | Tarifa desde (USD/noche) |
| `description` | string | Descripción para ficha |
| `highlights` | string[] | Amenidades destacadas |
| `imageUrl` | string | Foto principal |

### BookingRequest (Fase C — pendiente)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `propertyId` | string | Propiedad solicitada |
| `checkIn` | date | Entrada |
| `checkOut` | date | Salida |
| `guests` | number | Huéspedes |
| `guestName` | string | Nombre del contacto |
| `guestPhone` | string | Teléfono / WhatsApp |
| `guestEmail` | string | Email |
| `status` | enum | `PENDING` \| `CONFIRMED` \| `CANCELLED` |

## Flujos principales

### 1. Descubrir destino

El usuario llega al home y elige **San Clemente** (playa) o **Portoviejo** (ciudad).

### 2. Explorar propiedades

Navega el listado filtrado por destino, ve capacidad, precio desde y fotos.

### 3. Consultar / reservar (Fase C)

Selecciona fechas, completa datos y envía solicitud. El equipo confirma por WhatsApp.

## Reglas de negocio

- Tarifas publicadas en **USD**.
- Reserva directa: sin comisión de plataformas externas.
- Ubicación exacta se confirma al reservar (mapa de referencia en ficha).
- Atención al cliente principalmente por **WhatsApp**.

## Inventario actual

### San Clemente (5 propiedades)

- Alojamiento en Arrecife — 14 huéspedes — desde $250/noche
- Casa vacacional Home One — 18 huéspedes — desde $260/noche
- Casa vacacional Home Two — 21 huéspedes — desde $280/noche
- Casa rústica — 18 huéspedes — desde $300/noche
- Home Luxury La Punta — 18 huéspedes — desde $500/noche

### Portoviejo (2 propiedades)

- Apartamento MS Vacations — 4 huéspedes — desde $65/noche
- Suite MS Vacations — 2 huéspedes — desde $45/noche

## Roadmap de fases

| Fase | Alcance | Estado |
|------|---------|--------|
| A | Home, destinos, cards, identidad visual | Completada |
| B | Fichas `/alojamientos/[slug]` con galería y reserva | Completada |
| C | iCal, cotización, formas de pago, API de reservas | Completada |
| D | Persistencia en DB, panel admin, notificaciones | Pendiente |
