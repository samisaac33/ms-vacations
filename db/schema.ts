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
  "pending_balance",
  "confirmed",
  "cancelled",
  "expired",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "bank_transfer",
  "paypal",
  "payphone",
]);

export const paymentTimingEnum = pgEnum("payment_timing", ["full_now", "split"]);

export const billingIdTypeEnum = pgEnum("billing_id_type", ["RUC", "CEDULA", "PASAPORTE"]);

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
  paymentTiming: paymentTimingEnum("payment_timing").notNull().default("full_now"),
  totalCents: integer("total_cents").notNull(),
  depositCents: integer("deposit_cents"),
  balanceCents: integer("balance_cents"),
  balanceDueAt: date("balance_due_at"),
  depositPaidAt: timestamp("deposit_paid_at", { withTimezone: true }),
  currency: text("currency").notNull().default("USD"),
  pendingExpiresAt: timestamp("pending_expires_at", { withTimezone: true }),
  paymentExternalId: text("payment_external_id"),
  paymentProofUrl: text("payment_proof_url"),
  paymentProofUploadedAt: timestamp("payment_proof_uploaded_at", { withTimezone: true }),
  guestEmail: text("guest_email"),
  billingName: text("billing_name"),
  billingIdType: billingIdTypeEnum("billing_id_type"),
  billingIdNumber: text("billing_id_number"),
  billingCity: text("billing_city"),
  billingCompletedAt: timestamp("billing_completed_at", { withTimezone: true }),
  voucherSentAt: timestamp("voucher_sent_at", { withTimezone: true }),
  termsAcceptedAt: timestamp("terms_accepted_at", { withTimezone: true }),
  termsVersion: text("terms_version"),
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

/** Configuración global del panel admin (fila única id = default). */
export const adminSettings = pgTable("admin_settings", {
  id: text("id").primaryKey().default("default"),
  notificationEmail: text("notification_email"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Períodos globales con IVA promocional 8 % (todas las propiedades). */
export const promotionalVatPeriods = pgTable("promotional_vat_periods", {
  id: uuid("id").defaultRandom().primaryKey(),
  label: text("label"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Temporadas altas con estancia mínima configurable (por propiedad vía junction). */
export const highSeasonPeriods = pgTable("high_season_periods", {
  id: uuid("id").defaultRandom().primaryKey(),
  label: text("label"),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  minNights: integer("min_nights").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const highSeasonPeriodProperties = pgTable(
  "high_season_period_properties",
  {
    periodId: uuid("period_id")
      .notNull()
      .references(() => highSeasonPeriods.id, { onDelete: "cascade" }),
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("high_season_period_properties_period_property_idx").on(
      table.periodId,
      table.propertyId,
    ),
  ],
);

/** Galería de fotos por propiedad (admin). Sin filas → catálogo estático en lib/properties.ts. */
export const propertyImages = pgTable(
  "property_images",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    propertyId: uuid("property_id")
      .notNull()
      .references(() => properties.id, { onDelete: "cascade" }),
    storagePath: text("storage_path").notNull(),
    src: text("src").notNull(),
    alt: text("alt").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("property_images_property_storage_path_idx").on(
      table.propertyId,
      table.storagePath,
    ),
  ],
);
