"use client";

import { useEffect, useRef } from "react";
import { AdminApplyBeachPricesPanel } from "@/app/admin/admin-apply-beach-prices";
import { SummaryCard } from "@/app/admin/admin-config-summary";
import { AdminMigrateSplitPaymentPanel } from "@/app/admin/admin-migrate-split-payment";
import { AdminMigrateBillingPanel } from "@/app/admin/admin-migrate-billing";
import { AdminMigratePropertyImagesPanel } from "@/app/admin/admin-migrate-property-images";
import { AdminNotificationSettingsPanel } from "@/app/admin/admin-notification-settings";

type Props = {
  needsSplitPaymentMigration: boolean;
  needsBillingMigration: boolean;
  needsPropertyImagesMigration: boolean;
  notificationEmail: string | null;
  envFallback: string | null;
  guestEmailFrom: string;
  propertyCount: number;
  hasRecentIcalErrors: boolean;
};

function shouldOpenForHash(hash: string) {
  return hash === "#correo" || hash === "#mantenimiento" || hash === "#ical";
}

export function AdminMaintenanceSection({
  needsSplitPaymentMigration,
  needsBillingMigration,
  needsPropertyImagesMigration,
  notificationEmail,
  envFallback,
  guestEmailFrom,
  propertyCount,
  hasRecentIcalErrors,
}: Props) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const effectiveEmail = notificationEmail?.trim() || envFallback || "No configurado";

  useEffect(() => {
    const openIfNeeded = () => {
      if (shouldOpenForHash(window.location.hash) && detailsRef.current) {
        detailsRef.current.open = true;
      }
    };

    openIfNeeded();
    window.addEventListener("hashchange", openIfNeeded);
    return () => window.removeEventListener("hashchange", openIfNeeded);
  }, []);

  return (
    <details
      ref={detailsRef}
      id="mantenimiento"
      className="scroll-mt-24 rounded-xl border border-zinc-200 bg-white shadow-sm"
    >
      <summary className="cursor-pointer list-none px-5 py-4 font-semibold text-zinc-900 [&::-webkit-details-marker]:hidden">
        Mantenimiento técnico (uso único)
        <span className="mt-1 block text-sm font-normal text-zinc-600">
          Notificaciones, migraciones y ajustes puntuales.
        </span>
      </summary>
      <div className="space-y-4 border-t border-zinc-100 px-5 pb-5 pt-2">
        <div className="grid gap-3 sm:grid-cols-2">
          <SummaryCard
            label="Correo de alertas"
            value={effectiveEmail}
            truncate
            href="#correo"
          />
          <SummaryCard
            label="Calendarios iCal"
            value={`${propertyCount} propiedades`}
            highlight={hasRecentIcalErrors}
            href="#ical"
          />
        </div>
        <AdminNotificationSettingsPanel
          notificationEmail={notificationEmail}
          envFallback={envFallback}
          guestEmailFrom={guestEmailFrom}
        />
        {needsSplitPaymentMigration && <AdminMigrateSplitPaymentPanel embedded />}
        {needsBillingMigration && <AdminMigrateBillingPanel embedded />}
        {needsPropertyImagesMigration && <AdminMigratePropertyImagesPanel embedded />}
        <AdminApplyBeachPricesPanel embedded />
      </div>
    </details>
  );
}
