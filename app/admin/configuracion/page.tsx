import { cookies } from "next/headers";
import { AdminApplyBeachPricesPanel } from "@/app/admin/admin-apply-beach-prices";
import { AdminCalendarShell } from "@/app/admin/admin-calendar-shell";
import { AdminIcalPanel } from "@/app/admin/admin-ical-panel";
import { AdminLoginForm } from "@/app/admin/admin-login-form";
import { AdminPaymentsPanel } from "@/app/admin/admin-payments-panel";
import { getAdminIcalDashboard } from "@/lib/admin-dashboard";
import { getPendingVerificationBookings } from "@/lib/admin-payments";

export const metadata = {
  title: "Configuración",
  robots: { index: false, follow: false },
};

export default async function AdminConfiguracionPage() {
  const store = await cookies();
  const ok = store.get("admin_session")?.value === "1";

  if (!ok) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16">
        <h1 className="text-xl font-semibold">Acceso equipo</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Defina <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">ADMIN_SECRET</code> en el entorno.
        </p>
        <AdminLoginForm />
      </div>
    );
  }

  const dashboard = await getAdminIcalDashboard();
  let pendingPayments: Awaited<ReturnType<typeof getPendingVerificationBookings>> = [];
  let paymentsLoadError: string | null = null;
  try {
    pendingPayments = await getPendingVerificationBookings();
  } catch (e) {
    paymentsLoadError = e instanceof Error ? e.message : "Error al cargar transferencias pendientes.";
  }

  return (
    <AdminCalendarShell activeTab="configuracion" title="Configuración">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm text-zinc-600">
          Tarifas, calendarios iCal, sincronización y transferencias pendientes.
        </p>

        {dashboard ? (
          <>
            <AdminApplyBeachPricesPanel />
            <AdminIcalPanel
              properties={dashboard.properties.map((p) => ({
                ...p,
                lastIcalSyncAt: p.lastIcalSyncAt?.toISOString() ?? null,
              }))}
              logs={dashboard.logs.map((l) => ({
                ...l,
                createdAt: l.createdAt.toISOString(),
              }))}
            />
          </>
        ) : (
          <p className="mt-8 text-sm text-amber-800">
            <code className="rounded bg-amber-100 px-1">DATABASE_URL</code> no configurada. Defínala para
            gestionar calendarios.
          </p>
        )}

        {paymentsLoadError ? (
          <p className="mt-10 text-sm text-amber-800">
            No se pudieron cargar las transferencias pendientes: {paymentsLoadError}
          </p>
        ) : (
          <AdminPaymentsPanel bookings={pendingPayments} />
        )}

        <p className="mt-10 text-xs text-zinc-500">
          Guía: <code className="rounded bg-zinc-100 px-1">docs/operaciones.md</code>
        </p>
      </div>
    </AdminCalendarShell>
  );
}
