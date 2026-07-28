import { cookies } from "next/headers";
import { AdminCalendarShell } from "@/app/admin/admin-calendar-shell";
import { AdminIcalPanel } from "@/app/admin/admin-ical-panel";
import { AdminLoginForm } from "@/app/admin/admin-login-form";
import { AdminMaintenanceSection } from "@/app/admin/admin-maintenance-section";
import {
  getAdminNotificationSettingsForPanel,
  billingMigrationNeeded,
  splitPaymentMigrationNeeded,
} from "@/app/admin/actions";
import { getAdminIcalDashboard } from "@/lib/admin-dashboard";

export const metadata = {
  title: "Dev",
  robots: { index: false, follow: false },
};

function guestEmailFromEnv(): string {
  const raw = process.env.EMAIL_FROM?.trim();
  if (!raw) return "reservas@ms-vacations.com";
  const match = raw.match(/<([^>]+)>/);
  return match?.[1] ?? raw;
}

export default async function AdminDevPage() {
  const store = await cookies();
  const ok = store.get("admin_session")?.value === "1";

  if (!ok) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16">
        <h1 className="text-xl font-semibold">Acceso equipo</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Defina la contraseña de administrador en el entorno del servidor.
        </p>
        <AdminLoginForm />
      </div>
    );
  }

  const dashboard = await getAdminIcalDashboard();
  const needsSplitPaymentMigration = await splitPaymentMigrationNeeded();
  const needsBillingMigration = await billingMigrationNeeded();
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
