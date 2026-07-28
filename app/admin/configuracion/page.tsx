import { cookies } from "next/headers";
import { AdminContenidoPanel } from "@/app/admin/admin-contenido-panel";
import { AdminBillingPanel } from "@/app/admin/admin-billing-panel";
import { AdminSectionCard } from "@/app/admin/admin-section-card";
import { AdminMigrateBillingPanel } from "@/app/admin/admin-migrate-billing";
import { AdminCalendarShell } from "@/app/admin/admin-calendar-shell";
import { AdminConfigNav } from "@/app/admin/admin-config-nav";
import { AdminConfigSummary } from "@/app/admin/admin-config-summary";
import { AdminLoginForm } from "@/app/admin/admin-login-form";
import { AdminPaymentsHistory } from "@/app/admin/admin-payments-history";
import { AdminPaymentsPanel } from "@/app/admin/admin-payments-panel";
import { AdminHighSeasonPanel } from "@/app/admin/admin-high-season-panel";
import { AdminVatPeriodsPanel } from "@/app/admin/admin-vat-periods-panel";
import { countBookingsMissingBilling, getBookingsForBillingAdmin } from "@/lib/admin-billing";
import { billingMigrationNeeded } from "@/lib/apply-billing-migration";
import { getAdminIcalDashboard } from "@/lib/admin-dashboard";
import { getBankTransferHistory, getPendingVerificationBookings } from "@/lib/admin-payments";
import { listHighSeasonPeriodRows } from "@/lib/high-season-query";
import { listPromotionalVatPeriodRows } from "@/lib/vat-periods-query";

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
        <p className="mt-2 text-sm text-zinc-600">
          Defina la contraseña de administrador en el entorno del servidor.
        </p>
        <AdminLoginForm />
      </div>
    );
  }

  let vatPeriods: Awaited<ReturnType<typeof listPromotionalVatPeriodRows>> = [];
  let highSeasonPeriods: Awaited<ReturnType<typeof listHighSeasonPeriodRows>> = [];
  let adminProperties: { id: string; name: string }[] = [];
  try {
    vatPeriods = await listPromotionalVatPeriodRows();
  } catch {
    // DB no disponible
  }
  try {
    highSeasonPeriods = await listHighSeasonPeriodRows();
  } catch {
    // DB no disponible
  }
  try {
    const dashboard = await getAdminIcalDashboard();
    adminProperties =
      dashboard?.properties.map((p) => ({ id: p.id, name: p.name })) ?? [];
  } catch {
    // DB no disponible
  }
  let pendingPayments: Awaited<ReturnType<typeof getPendingVerificationBookings>> = [];
  let transferHistory: Awaited<ReturnType<typeof getBankTransferHistory>> = [];
  let billingBookings: Awaited<ReturnType<typeof getBookingsForBillingAdmin>> = [];
  let paymentsLoadError: string | null = null;
  let historyLoadError: string | null = null;
  let billingLoadError: string | null = null;
  let needsBillingMigration = false;
  try {
    needsBillingMigration = await billingMigrationNeeded();
  } catch {
    needsBillingMigration = true;
  }
  try {
    pendingPayments = await getPendingVerificationBookings();
  } catch (e) {
    paymentsLoadError = e instanceof Error ? e.message : "Error al cargar transferencias pendientes.";
  }
  try {
    transferHistory = await getBankTransferHistory();
  } catch (e) {
    historyLoadError = e instanceof Error ? e.message : "Error al cargar el historial de transferencias.";
  }
  try {
    billingBookings = await getBookingsForBillingAdmin();
  } catch (e) {
    billingLoadError = e instanceof Error ? e.message : "Error al cargar datos de facturación.";
  }

  const missingBillingCount = countBookingsMissingBilling(billingBookings);

  return (
    <AdminCalendarShell
      activeTab="configuracion"
      title="Configuración"
      configPendingCount={pendingPayments.length}
    >
      <div className="mx-auto max-w-5xl">
        <AdminConfigNav />
        <AdminConfigSummary
          pendingPaymentsCount={pendingPayments.length}
          missingBillingCount={missingBillingCount}
        />

        {pendingPayments.length > 0 && (
          <p className="mb-4 hidden rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900 md:block">
            {pendingPayments.length === 1
              ? "1 transferencia pendiente de verificación"
              : `${pendingPayments.length} transferencias pendientes de verificación`}
          </p>
        )}

        {paymentsLoadError ? (
          <p className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            No se pudieron cargar las transferencias pendientes: {paymentsLoadError}
          </p>
        ) : (
          <AdminPaymentsPanel bookings={pendingPayments} />
        )}

        {historyLoadError ? (
          <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            No se pudo cargar el historial: {historyLoadError}
          </p>
        ) : (
          <AdminPaymentsHistory bookings={transferHistory} />
        )}

        {needsBillingMigration && (
          <AdminSectionCard
            title="Migrar esquema de facturación"
            variant="alert"
            collapsible="mobile"
            defaultOpen
            className="mb-3 md:mb-6"
            description="Añade las columnas de facturación en PostgreSQL. Ejecutar una vez si fallan reservas o datos de facturación."
          >
            <AdminMigrateBillingPanel embedded />
          </AdminSectionCard>
        )}

        {billingLoadError ? (
          <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            No se pudieron cargar los datos de facturación: {billingLoadError}
          </p>
        ) : (
          <AdminBillingPanel bookings={billingBookings} />
        )}

        <div className="mt-3 space-y-3 md:mt-6 md:space-y-6">
          <AdminHighSeasonPanel periods={highSeasonPeriods} properties={adminProperties} />
          <AdminVatPeriodsPanel periods={vatPeriods} />
          <AdminContenidoPanel />
        </div>
      </div>
    </AdminCalendarShell>
  );
}
