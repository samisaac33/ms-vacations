import { AdminCalendarShell } from "@/app/admin/admin-calendar-shell";
import { AdminIcalPanel } from "@/app/admin/admin-ical-panel";
import { AdminMaintenanceSection } from "@/app/admin/admin-maintenance-section";
import {
  getAdminNotificationSettingsForPanel,
  billingMigrationNeeded,
  propertyImagesMigrationNeeded,
  splitPaymentMigrationNeeded,
} from "@/app/admin/actions";
import { getAdminIcalDashboard } from "@/lib/admin-dashboard";

function guestEmailFromEnv(): string {
  const raw = process.env.EMAIL_FROM?.trim();
  if (!raw) return "reservas@ms-vacations.com";
  const match = raw.match(/<([^>]+)>/);
  return match?.[1] ?? raw;
}

export async function AdminDevDashboard() {
  const dashboard = await getAdminIcalDashboard();
  const needsSplitPaymentMigration = await splitPaymentMigrationNeeded();
  const needsBillingMigration = await billingMigrationNeeded();
  const needsPropertyImagesMigration = await propertyImagesMigrationNeeded();
  let notificationSettings = { notificationEmail: null as string | null, envFallback: null as string | null };
  try {
    notificationSettings = await getAdminNotificationSettingsForPanel();
  } catch {
    // DB no disponible
  }

  const logs = dashboard?.logs ?? [];
  const hasRecentIcalErrors = logs.some((l) => l.level === "error");
  const propertyCount = dashboard?.properties.length ?? 0;

  return (
    <AdminCalendarShell activeTab="dev" title="Dev">
      <div className="mx-auto max-w-5xl space-y-6">
        {dashboard ? (
          <AdminIcalPanel
            properties={dashboard.properties.map((p) => ({
              ...p,
              lastIcalSyncAt: p.lastIcalSyncAt?.toISOString() ?? null,
            }))}
            logs={logs.map((l) => ({
              ...l,
              createdAt: l.createdAt.toISOString(),
            }))}
            defaultOpen={hasRecentIcalErrors}
          />
        ) : (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Base de datos no conectada. Contacte soporte técnico para gestionar calendarios.
          </p>
        )}

        <AdminMaintenanceSection
          needsSplitPaymentMigration={needsSplitPaymentMigration}
          needsBillingMigration={needsBillingMigration}
          needsPropertyImagesMigration={needsPropertyImagesMigration}
          notificationEmail={notificationSettings.notificationEmail}
          envFallback={notificationSettings.envFallback}
          guestEmailFrom={guestEmailFromEnv()}
          propertyCount={propertyCount}
          hasRecentIcalErrors={hasRecentIcalErrors}
        />
      </div>
    </AdminCalendarShell>
  );
}
