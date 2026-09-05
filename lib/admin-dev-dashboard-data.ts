import { getAdminIcalDashboard } from "@/lib/admin-dashboard";
import { getAdminSettings, getEnvNotificationEmailFallback } from "@/lib/admin-settings";
import { billingMigrationNeeded } from "@/lib/apply-billing-migration";
import { propertyImagesMigrationNeeded } from "@/lib/apply-property-images-migration";
import { splitPaymentMigrationNeeded } from "@/lib/apply-split-payment-migration";

export type AdminDevPropertyRow = {
  id: string;
  slug: string;
  name: string;
  icalUrl: string;
  icalUrlMasked: string;
  lastIcalSyncAt: string | null;
  blockCount: number;
  priceUsd: number;
};

export type AdminDevLogRow = {
  id: string;
  level: string;
  message: string;
  createdAt: string;
  propertySlug: string | null;
};

export type AdminDevDashboardPayload = {
  dbConnected: boolean;
  properties: AdminDevPropertyRow[];
  logs: AdminDevLogRow[];
  needsSplitPaymentMigration: boolean;
  needsBillingMigration: boolean;
  needsPropertyImagesMigration: boolean;
  notificationEmail: string | null;
  envFallback: string | null;
  guestEmailFrom: string;
};

function guestEmailFromEnv(): string {
  const raw = process.env.EMAIL_FROM?.trim();
  if (!raw) return "reservas@ms-vacations.com";
  const match = raw.match(/<([^>]+)>/);
  return match?.[1] ?? raw;
}

export async function getAdminDevDashboardPayload(): Promise<AdminDevDashboardPayload> {
  let dashboard: Awaited<ReturnType<typeof getAdminIcalDashboard>> = null;
  try {
    dashboard = await getAdminIcalDashboard();
  } catch {
    // DB no disponible
  }

  let needsSplitPaymentMigration = false;
  let needsBillingMigration = false;
  let needsPropertyImagesMigration = false;
  try {
    [needsSplitPaymentMigration, needsBillingMigration, needsPropertyImagesMigration] = await Promise.all([
      splitPaymentMigrationNeeded(),
      billingMigrationNeeded(),
      propertyImagesMigrationNeeded(),
    ]);
  } catch {
    // DB no disponible
  }

  let notificationEmail: string | null = null;
  let envFallback: string | null = null;
  try {
    const settings = await getAdminSettings();
    notificationEmail = settings.notificationEmail;
    envFallback = getEnvNotificationEmailFallback() ?? null;
  } catch {
    // DB no disponible
  }

  return {
    dbConnected: dashboard != null,
    properties:
      dashboard?.properties.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        icalUrl: p.icalUrl,
        icalUrlMasked: p.icalUrlMasked,
        lastIcalSyncAt: p.lastIcalSyncAt?.toISOString() ?? null,
        blockCount: p.blockCount,
        priceUsd: p.priceUsd,
      })) ?? [],
    logs:
      dashboard?.logs.map((l) => ({
        id: l.id,
        level: l.level,
        message: l.message,
        createdAt: l.createdAt.toISOString(),
        propertySlug: l.propertySlug,
      })) ?? [],
    needsSplitPaymentMigration,
    needsBillingMigration,
    needsPropertyImagesMigration,
    notificationEmail,
    envFallback,
    guestEmailFrom: guestEmailFromEnv(),
  };
}
