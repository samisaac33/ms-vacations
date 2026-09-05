import { AdminContenidoPanel } from "@/app/admin/admin-contenido-panel";
import { AdminBillingPanel } from "@/app/admin/admin-billing-panel";
import { AdminDevView } from "@/app/admin/admin-dev-view";
import { AdminHamburgerMenu } from "@/app/admin/admin-hamburger-menu";
import { AdminHighSeasonPanel } from "@/app/admin/admin-high-season-panel";
import { AdminMigrateBillingPanel } from "@/app/admin/admin-migrate-billing";
import { AdminPaymentsHistory } from "@/app/admin/admin-payments-history";
import { AdminPaymentsPanel } from "@/app/admin/admin-payments-panel";
import { AdminSectionCard } from "@/app/admin/admin-section-card";
import { AdminVatPeriodsPanel } from "@/app/admin/admin-vat-periods-panel";
import { countBookingsMissingBilling, getBookingsForBillingAdmin } from "@/lib/admin-billing";
import { billingMigrationNeeded } from "@/lib/apply-billing-migration";
import { listAdminCalendarProperties } from "@/lib/admin-calendar-query";
import { getAdminIcalDashboard } from "@/lib/admin-dashboard";
import { getBankTransferHistory, getPendingVerificationBookings } from "@/lib/admin-payments";
import { listHighSeasonPeriodRows } from "@/lib/high-season-query";
import { listPromotionalVatPeriodRows } from "@/lib/vat-periods-query";
import type { AdminMenuModalId } from "@/lib/admin-menu-events";

export async function AdminMenuContent() {
  let vatPeriods: Awaited<ReturnType<typeof listPromotionalVatPeriodRows>> = [];
  let highSeasonPeriods: Awaited<ReturnType<typeof listHighSeasonPeriodRows>> = [];
  let adminProperties: { id: string; name: string }[] = [];
  let propertyList = listAdminCalendarProperties();

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

  const menuItems = [
    {
      id: "pagos" as const,
      label: "Transferencias pendientes",
      badge: pendingPayments.length,
      modalId: "pagos" as AdminMenuModalId,
    },
    {
      id: "historial" as const,
      label: "Historial de transferencias",
      badge: transferHistory.length,
      modalId: "historial" as AdminMenuModalId,
    },
    {
      id: "facturacion" as const,
      label: "Datos de facturación",
      badge: missingBillingCount,
      modalId: "facturacion" as AdminMenuModalId,
    },
    {
      id: "temporadas" as const,
      label: "Temporadas altas",
      badge: highSeasonPeriods.length,
      modalId: "temporadas" as AdminMenuModalId,
    },
    {
      id: "iva" as const,
      label: "Períodos IVA 8 %",
      badge: vatPeriods.length,
      modalId: "iva" as AdminMenuModalId,
    },
    {
      id: "contenido" as const,
      label: "Contenido — Proceso de reserva",
      modalId: "contenido" as AdminMenuModalId,
    },
    {
      id: "fotos" as const,
      label: "Fotos",
      modalId: "fotos" as AdminMenuModalId,
    },
    {
      id: "dev" as const,
      label: "Dev",
      modalId: "dev" as AdminMenuModalId,
    },
    { id: "ical" as const, label: "Sincronización iCal" },
    { id: "logout" as const, label: "Cerrar sesión" },
  ];

  const modals = [
    {
      id: "pagos" as AdminMenuModalId,
      title: "Transferencias pendientes",
      maxWidthClass: "max-w-4xl",
      content: paymentsLoadError ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          No se pudieron cargar las transferencias pendientes: {paymentsLoadError}
        </p>
      ) : (
        <AdminPaymentsPanel bookings={pendingPayments} />
      ),
    },
    {
      id: "historial" as AdminMenuModalId,
      title: "Historial de transferencias",
      maxWidthClass: "max-w-5xl",
      content: historyLoadError ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          No se pudo cargar el historial: {historyLoadError}
        </p>
      ) : (
        <AdminPaymentsHistory bookings={transferHistory} />
      ),
    },
    {
      id: "facturacion" as AdminMenuModalId,
      title: "Datos de facturación",
      maxWidthClass: "max-w-5xl",
      content: (
        <>
          {needsBillingMigration && (
            <AdminSectionCard
              title="Migrar esquema de facturación"
              variant="alert"
              collapsible="mobile"
              defaultOpen
              className="mb-4"
              description="Añade las columnas de facturación en PostgreSQL. Ejecutar una vez si fallan reservas o datos de facturación."
            >
              <AdminMigrateBillingPanel embedded />
            </AdminSectionCard>
          )}
          {billingLoadError ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              No se pudieron cargar los datos de facturación: {billingLoadError}
            </p>
          ) : (
            <AdminBillingPanel bookings={billingBookings} />
          )}
        </>
      ),
    },
    {
      id: "temporadas" as AdminMenuModalId,
      title: "Temporadas altas",
      maxWidthClass: "max-w-3xl",
      content: <AdminHighSeasonPanel periods={highSeasonPeriods} properties={adminProperties} />,
    },
    {
      id: "iva" as AdminMenuModalId,
      title: "Períodos IVA 8 %",
      maxWidthClass: "max-w-3xl",
      content: <AdminVatPeriodsPanel periods={vatPeriods} />,
    },
    {
      id: "contenido" as AdminMenuModalId,
      title: "Contenido — Proceso de reserva",
      maxWidthClass: "max-w-3xl",
      content: <AdminContenidoPanel />,
    },
    {
      id: "fotos" as AdminMenuModalId,
      title: "Fotos",
      maxWidthClass: "max-w-lg",
      content: null,
    },
    {
      id: "dev" as AdminMenuModalId,
      title: "Dev",
      maxWidthClass: "max-w-5xl",
      content: <AdminDevView />,
    },
  ];

  return (
    <AdminHamburgerMenu menuItems={menuItems} modals={modals} properties={propertyList} />
  );
}
