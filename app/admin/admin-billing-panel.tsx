"use client";

import { useMemo, useState } from "react";
import { AdminSectionCard } from "@/app/admin/admin-section-card";
import type { AdminBillingBooking } from "@/lib/admin-billing-types";
import { billingIdTypeLabel } from "@/lib/billing-validation";
import { formatBookingDateRange } from "@/lib/booking-dates";
import { PAYMENT_OPTIONS } from "@/lib/payment-options";
import { formatUsd } from "@/lib/pricing";

type Props = {
  bookings: AdminBillingBooking[];
};

type BillingFilter = "all" | "complete" | "missing";

const FILTER_OPTIONS: { value: BillingFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "complete", label: "Datos completos" },
  { value: "missing", label: "Sin datos" },
];

function formatMoney(cents: number) {
  return `$${formatUsd(cents / 100)}`;
}

function formatCreatedAt(iso: string) {
  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Guayaquil",
  }).format(new Date(iso));
}

function paymentMethodLabel(method: string): string {
  return PAYMENT_OPTIONS.find((o) => o.id === method)?.label ?? method;
}

function billingClientLabel(booking: AdminBillingBooking): string {
  if (!booking.billingName) return "—";
  const idPart =
    booking.billingIdType && booking.billingIdNumber
      ? `${billingIdTypeLabel(booking.billingIdType)} ${booking.billingIdNumber}`
      : null;
  return idPart ? `${booking.billingName}\n${idPart}` : booking.billingName;
}

function amountLabel(booking: AdminBillingBooking): string {
  const total = formatMoney(booking.totalCents);
  if (booking.status === "pending_balance" && booking.depositCents != null && booking.balanceCents != null) {
    return `${total}\nAbono ${formatMoney(booking.depositCents)} · Saldo ${formatMoney(booking.balanceCents)}`;
  }
  return total;
}

function VoucherBadge({ booking }: { booking: AdminBillingBooking }) {
  if (!booking.billingCompletedAt) {
    return <span className="text-zinc-400">—</span>;
  }
  if (booking.voucherSentAt) {
    return (
      <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-900">
        Enviado
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-900">
      Pendiente
    </span>
  );
}

function BillingStatusBadge({ booking }: { booking: AdminBillingBooking }) {
  if (booking.billingCompletedAt) {
    return (
      <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-900">
        Completo
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700">
      Sin datos
    </span>
  );
}

function BillingRow({ booking: b }: { booking: AdminBillingBooking }) {
  const clientLines = billingClientLabel(b).split("\n");
  const amountLines = amountLabel(b).split("\n");

  return (
    <tr className="border-b border-zinc-100 last:border-0">
      <td className="px-3 py-3 align-top">
        <p className="font-medium text-zinc-900">{b.propertyName}</p>
        <p className="mt-0.5 text-xs text-zinc-500">{formatCreatedAt(b.createdAt)}</p>
      </td>
      <td className="hidden px-3 py-3 align-top text-sm text-zinc-700 sm:table-cell">
        {formatBookingDateRange(b.checkIn, b.checkOut)}
      </td>
      <td className="px-3 py-3 align-top text-sm text-zinc-800">
        <p className="font-medium">{clientLines[0]}</p>
        {clientLines[1] && <p className="mt-0.5 font-mono text-xs text-zinc-600">{clientLines[1]}</p>}
      </td>
      <td className="hidden px-3 py-3 align-top text-sm text-zinc-700 md:table-cell">
        {b.billingCity ?? "—"}
      </td>
      <td className="hidden px-3 py-3 align-top text-sm text-zinc-700 lg:table-cell">
        <p className="break-words">{b.guestEmail ?? "—"}</p>
      </td>
      <td className="px-3 py-3 align-top text-sm font-medium text-zinc-800">
        <p>{amountLines[0]}</p>
        {amountLines[1] && <p className="mt-0.5 text-xs font-normal text-zinc-600">{amountLines[1]}</p>}
      </td>
      <td className="hidden px-3 py-3 align-top text-sm text-zinc-700 md:table-cell">
        {paymentMethodLabel(b.paymentMethod)}
      </td>
      <td className="px-3 py-3 align-top">
        <VoucherBadge booking={b} />
      </td>
      <td className="hidden px-3 py-3 align-top sm:table-cell">
        <BillingStatusBadge booking={b} />
      </td>
      <td className="hidden px-3 py-3 align-top font-mono text-xs text-zinc-600 xl:table-cell">
        {b.reference}
      </td>
    </tr>
  );
}

export function AdminBillingPanel({ bookings }: Props) {
  const [filter, setFilter] = useState<BillingFilter>("all");

  const missingCount = useMemo(
    () => bookings.filter((b) => !b.billingCompletedAt).length,
    [bookings],
  );

  const filtered = useMemo(() => {
    if (filter === "complete") {
      return bookings.filter((b) => Boolean(b.billingCompletedAt));
    }
    if (filter === "missing") {
      return bookings.filter((b) => !b.billingCompletedAt);
    }
    return bookings;
  }, [bookings, filter]);

  return (
    <AdminSectionCard
      id="facturacion"
      title="Datos de facturación"
      description="Reservas confirmadas con datos enviados por el huésped para emitir factura o comprobante manualmente."
      className="mt-3 md:mt-6"
      collapsible="mobile"
      defaultOpen={missingCount > 0}
      badge={missingCount > 0 ? missingCount : undefined}
    >
      <div className="mb-4">
        <label htmlFor="billing-filter" className="sr-only">
          Filtrar por datos de facturación
        </label>
        <select
          id="billing-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value as BillingFilter)}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800"
        >
          {FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs text-zinc-500">
          {filtered.length === 1 ? "1 reserva" : `${filtered.length} reservas`}
          {filter !== "all" ? ` · filtro: ${FILTER_OPTIONS.find((o) => o.value === filter)?.label}` : ""}
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-zinc-600">No hay reservas que coincidan con el filtro.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-3 py-2">Propiedad</th>
                <th className="hidden px-3 py-2 sm:table-cell">Estancia</th>
                <th className="px-3 py-2">Cliente facturación</th>
                <th className="hidden px-3 py-2 md:table-cell">Ciudad</th>
                <th className="hidden px-3 py-2 lg:table-cell">Correo</th>
                <th className="px-3 py-2">Monto</th>
                <th className="hidden px-3 py-2 md:table-cell">Pago</th>
                <th className="px-3 py-2">Comprobante PDF</th>
                <th className="hidden px-3 py-2 sm:table-cell">Estado</th>
                <th className="hidden px-3 py-2 xl:table-cell">Ref.</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <BillingRow key={b.id} booking={b} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminSectionCard>
  );
}
