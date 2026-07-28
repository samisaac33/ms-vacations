"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";
import { cancelBankTransfer, type AdminActionState } from "./actions";
import { AdminActionFeedback, AdminSectionCard } from "@/app/admin/admin-section-card";
import {
  BANK_TRANSFER_STATUS_LABELS,
  type BankTransferBooking,
  type BankTransferBookingStatus,
} from "@/lib/admin-payments-types";
import { formatBookingDateRange } from "@/lib/booking-dates";
import { formatBookingReference } from "@/lib/payments/bank-transfer";
import { formatUsd } from "@/lib/pricing";

type Props = {
  bookings: BankTransferBooking[];
};

const initial: AdminActionState = {};

type StatusFilter = "all" | BankTransferBookingStatus;

const FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "pending_verification", label: "Pendiente verificación" },
  { value: "confirmed", label: "Confirmada" },
  { value: "pending_balance", label: "Saldo pendiente" },
  { value: "cancelled", label: "Cancelada" },
  { value: "expired", label: "Expirada" },
  { value: "pending_payment", label: "Pendiente pago" },
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

function StatusBadge({ status }: { status: BankTransferBookingStatus }) {
  const label = BANK_TRANSFER_STATUS_LABELS[status];
  const styles: Record<BankTransferBookingStatus, string> = {
    pending_verification: "bg-amber-100 text-amber-900",
    confirmed: "bg-emerald-100 text-emerald-900",
    pending_balance: "bg-sky-100 text-sky-900",
    cancelled: "bg-zinc-100 text-zinc-700",
    expired: "bg-zinc-100 text-zinc-600",
    pending_payment: "bg-orange-100 text-orange-900",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      {label}
    </span>
  );
}

function HistoryRow({
  booking: b,
  cancelAction,
  cancelPending,
}: {
  booking: BankTransferBooking;
  cancelAction: (formData: FormData) => void;
  cancelPending: boolean;
}) {
  const canCancel = b.status === "confirmed" || b.status === "pending_balance";

  return (
    <tr className="border-b border-zinc-100 last:border-0">
      <td className="px-3 py-3 align-top">
        <p className="font-medium text-zinc-900">{b.propertyName}</p>
        <p className="mt-0.5 text-xs text-zinc-500">{formatCreatedAt(b.createdAt)}</p>
      </td>
      <td className="hidden px-3 py-3 align-top text-sm text-zinc-700 sm:table-cell">
        {formatBookingDateRange(b.checkIn, b.checkOut)}
      </td>
      <td className="hidden px-3 py-3 align-top text-sm text-zinc-700 md:table-cell">
        <p className="break-words">{b.guestEmail ?? "—"}</p>
        <p className="mt-0.5 font-mono text-xs text-zinc-500">{formatBookingReference(b.id)}</p>
      </td>
      <td className="px-3 py-3 align-top text-sm font-medium text-zinc-800">{formatMoney(b.totalCents)}</td>
      <td className="px-3 py-3 align-top">
        <StatusBadge status={b.status} />
      </td>
      <td className="px-3 py-3 align-top">
        <div className="flex flex-col gap-2">
          {b.paymentProofUrl && (
            <a
              href={b.paymentProofUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-zinc-700 underline underline-offset-2 hover:text-zinc-900"
            >
              Comprobante
            </a>
          )}
          {canCancel && (
            <form
              action={cancelAction}
              onSubmit={(e) => {
                if (
                  !confirm(
                    "¿Cancelar esta reserva? Se liberarán las fechas. No se procesa reembolso automático.",
                  )
                ) {
                  e.preventDefault();
                }
              }}
            >
              <input type="hidden" name="bookingId" value={b.id} />
              <button
                type="submit"
                disabled={cancelPending}
                className="text-sm font-medium text-red-700 hover:text-red-900 disabled:opacity-60"
              >
                Cancelar reserva
              </button>
            </form>
          )}
        </div>
      </td>
    </tr>
  );
}

export function AdminPaymentsHistory({ bookings }: Props) {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [cancelState, cancelAction, cancelPending] = useActionState(cancelBankTransfer, initial);

  const filtered = useMemo(() => {
    if (filter === "all") return bookings;
    return bookings.filter((b) => b.status === filter);
  }, [bookings, filter]);

  return (
    <AdminSectionCard
      id="historial-pagos"
      title="Historial de transferencias"
      description="Todas las reservas por transferencia bancaria, en cualquier estado."
      className="mt-3 md:mt-6"
      collapsible="mobile"
      badge={bookings.length}
    >
      <div className="mb-4">
        <label htmlFor="transfer-status-filter" className="sr-only">
          Filtrar por estado
        </label>
        <select
          id="transfer-status-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value as StatusFilter)}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800"
        >
          {FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs text-zinc-500">
          {filtered.length === 1
            ? "1 transferencia"
            : `${filtered.length} transferencias`}
          {filter !== "all" ? ` · filtro: ${FILTER_OPTIONS.find((o) => o.value === filter)?.label}` : ""}
        </p>
      </div>

      <AdminActionFeedback error={cancelState.error} success={cancelState.success} />

      {filtered.length === 0 ? (
        <p className="text-sm text-zinc-600">No hay transferencias que coincidan con el filtro.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-3 py-2">Propiedad</th>
                <th className="hidden px-3 py-2 sm:table-cell">Estancia</th>
                <th className="hidden px-3 py-2 md:table-cell">Huésped / Ref.</th>
                <th className="px-3 py-2">Monto</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <HistoryRow
                  key={b.id}
                  booking={b}
                  cancelAction={cancelAction}
                  cancelPending={cancelPending}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminSectionCard>
  );
}
