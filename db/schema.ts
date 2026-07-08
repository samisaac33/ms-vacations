import {
  date,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending_payment",
  "pending_verification",
  "confirmed",
  "cancelled",
  "expired",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "bank_transfer",
  "paypal",
  "payphone",
]);

export const properties = pgTable("properties", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  icalUrl: text("ical_url").notNull(),
  basePricePerNightCents: integer("base_price_per_night_cents").notNull(),
  lastIcalSyncAt: timestamp("last_ical_sync_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const externalBlocks = pgTable(
  "external_blocks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    /** UID del evento en el ICS (estable por importación) */
    uid: text("uid").notNull(),
    /** Inicio de la estancia (fecha civil, America/Guayaquil) */
    startDate: date("start_date").notNull(),
    /** Fin exclusivo (la noche anterior a salida / igual a DTEND en eventos de día completo típicos) */
    endDate: date("end_date").notNull(),
  },
  (table) => [uniqueIndex("external_blocks_property_uid_idx").on(table.propertyId, table.uid)],
);

export const bookings = pgTable("bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  propertyId: uuid("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "restrict" }),
  checkIn: date("check_in").notNull(),
  checkOut: date("check_out").notNull(),
  guests: integer("guests").notNull(),
  status: bookingStatusEnum("status").notNull(),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  totalCents: integer("total_cents").notNull(),
  currency: text("currency").notNull().default("USD"),
  pendingExpiresAt: timestamp("pending_expires_at", { withTimezone: true }),
  paymentExternalId: text("payment_external_id"),
  paymentProofUrl: text("payment_proof_url"),
  paymentProofUploadedAt: timestamp("payment_proof_uploaded_at", { withTimezone: true }),
  guestEmail: text("guest_email"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const syncLogs = pgTable("sync_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  propertyId: uuid("property_id").references(() => properties.id, { onDelete: "set null" }),
  level: text("level").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Precio por noche (override); sin fila → tarifa base de la propiedad. */
export const propertyNightlyRates = pgTable(
  "property_nightly_rates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    referencePriceCents: integer("reference_price_cents").notNull(),
  },
  (table) => [
    uniqueIndex("property_nightly_rates_property_date_idx").on(table.propertyId, table.date),
  ],
);
