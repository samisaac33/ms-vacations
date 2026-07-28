"use client";

import { useActionState, useMemo, useState } from "react";
import { confirmBankTransfer, rejectBankTransfer, type AdminActionState } from "./actions";
import { AdminActionFeedback, AdminSectionCard } from "@/app/admin/admin-section-card";
import type { PendingVerificationBooking } from "@/lib/admin-payments-types";
import type { VerificationMode } from "@/lib/bank-transfer-verification";
import { formatBookingDateRange } from "@/lib/booking-dates";
import { formatBookingReference } from "@/lib/payments/bank-transfer";
import { formatUsd } from "@/lib/pricing";

type Props = {
  bookings: PendingVerificationBooking[];
};

const initial: AdminActionState = {};

function formatMoney(cents: number) {
  return `$${formatUsd(cents / 100)}`;
}

function guestLabel(guests: number) {
  return guests === 1 ? "1 huésped" : `${guests} huéspedes`;
}

function expectedAmountCents(booking: PendingVerificationBooking): number {
  if (booking.paymentTiming === "split" && booking.depositCents != null) {
    return booking.depositCents;
  }
  return booking.totalCents;
}

function resolvePreviewPaidCents(
  booking: PendingVerificationBooking,
  mode: VerificationMode | "",
  partialAmountUsd: string,
): number | null {
  if (mode === "full") return booking.totalCents;
  if (mode === "half") return Math.round(booking.totalCents / 2);
  if (mode === "partial") {
    const trimmed = partialAmountUsd.trim().replace(",", ".");
    if (!trimmed) return null;
    const parsed = Number.parseFloat(trimmed);
    if (!Number.isFinite(parsed) || parsed <= 0) return null;
    const cents = Math.round(parsed * 100);
    if (cents > booking.totalCents) return null;
    return cents;
  }
  return null;
}

type CardProps = {
  booking: PendingVerificationBooking;
  confirmAction: (formData: FormData) => void;
  rejectAction: (formData: FormData) => void;
  actionsDisabled: boolean;
};

function PendingTransferVerificationForm({
  booking: b,
  confirmAction,
  rejectAction,
  actionsDisabled,
}: CardProps) {
  const [mode, setMode] = useState<VerificationMode | "">("");
  const [partialAmountUsd, setPartialAmountUsd] = useState("");

  const halfCents = Math.round(b.totalCents / 2);
  const expectedCents = expectedAmountCents(b);
  const previewPaidCents = useMemo(
    () => resolvePreviewPaidCents(b, mode, partialAmountUsd),
    [b, mode, partialAmountUsd],
  );
  const previewBalanceCents =
    previewPaidCents != null ? Math.max(0, b.totalCents - previewPaidCents) : null;

  const canConfirm =
    mode !== "" &&
    (mode !== "partial" || previewPaidCents != null) &&
    !actionsDisabled;

  return (
    <li className="rounded-lg border border-amber-200 bg-white p-4">
      <div className="flex flex-col gap-4">
        <div className="w-full min-w-0 space-y-1">
          <p className="font-medium text-zinc-900">{b.propertyName}</p>
          <p className="text-sm text-zinc-600">{formatBookingDateRange(b.checkIn, b.checkOut)}</p>
          <p className="text-sm text-zinc-600">
            {guestLabel(b.guests)} · Total {formatMoney(b.totalCents)}
          </p>
          <p className="text-sm text-zinc-500">
            Esperado según reserva: {formatMoney(expectedCents)}
            {b.paymentTiming === "split" ? " (50 %)" : " (pago total)"}
          </p>
          <p className="text-sm text-zinc-700">
            Ref. <span className="font-mono">{formatBookingReference(b.id)}</span>
          </p>
          {b.guestEmail && (
            <p className="break-words text-sm text-zinc-700">{b.guestEmail}</p>
          )}
          {!b.paymentProofUrl && (
            <span className="mt-1 inline-flex rounded-full bg-[#25D366]/15 px-2.5 py-0.5 text-xs font-medium text-[#128C7E]">
              Comprobante vía WhatsApp
            </span>
          )}
        </div>

        <fieldset className="space-y-2 rounded-lg border border-zinc-200 bg-zinc-50/80 p-3">
          <legend className="px-1 text-sm font-medium text-zinc-800">
            Monto verificado en comprobante
          </legend>

          <label className="flex cursor-pointer items-start gap-2 text-sm text-zinc-700">
            <input
              type="radio"
              name={`verificationMode-${b.id}`}
              value="full"
              checked={mode === "full"}
              onChange={() => setMode("full")}
              className="mt-0.5"
            />
            <span>
              Pago total <span className="text-zinc-500">({formatMoney(b.totalCents)})</span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-2 text-sm text-zinc-700">
            <input
              type="radio"
              name={`verificationMode-${b.id}`}
              value="half"
              checked={mode === "half"}
              onChange={() => setMode("half")}
              className="mt-0.5"
            />
            <span>
              Pago 50 % <span className="text-zinc-500">({formatMoney(halfCents)})</span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-2 text-sm text-zinc-700">
            <input
              type="radio"
              name={`verificationMode-${b.id}`}
              value="partial"
              checked={mode === "partial"}
              onChange={() => setMode("partial")}
              className="mt-0.5"
            />
            <span>Pago parcial</span>
          </label>

          {mode === "partial" && (
            <div className="ml-6">
              <label className="block text-xs font-medium text-zinc-600" htmlFor={`partial-${b.id}`}>
                Monto recibido (USD)
              </label>
              <input
                id={`partial-${b.id}`}
                type="number"
                min={0.01}
                max={b.totalCents / 100}
                step={0.01}
                inputMode="decimal"
                value={partialAmountUsd}
                onChange={(e) => setPartialAmountUsd(e.target.value)}
                placeholder="0.00"
                className="mt-1 w-full max-w-xs rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900"
              />
            </div>
          )}

          {previewPaidCents != null && (
            <p className="border-t border-zinc-200 pt-2 text-sm text-zinc-700">
              Abono verificado: {formatMoney(previewPaidCents)}
              {previewBalanceCents != null && previewBalanceCents > 0 && (
                <>
                  {" "}
                  · Saldo pendiente: {formatMoney(previewBalanceCents)}
                </>
              )}
              {previewBalanceCents === 0 && <> · Sin saldo pendiente</>}
            </p>
          )}
        </fieldset>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          {b.paymentProofUrl && (
            <a
              href={b.paymentProofUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50 sm:min-h-0 sm:py-1.5"
            >
              Ver comprobante
            </a>
          )}

          <form
            action={confirmAction}
            className="min-w-0 sm:contents"
            onSubmit={(e) => {
              if (!canConfirm) {
                e.preventDefault();
                return;
              }
              const paidLabel =
                previewPaidCents != null ? formatMoney(previewPaidCents) : "este monto";
              if (!confirm(`¿Confirmar abono de ${paidLabel}?`)) {
                e.preventDefault();
              }
            }}
          >
            <input type="hidden" name="bookingId" value={b.id} />
            {mode !== "" && <input type="hidden" name="verificationMode" value={mode} />}
            {mode === "partial" && (
              <input type="hidden" name="partialAmountUsd" value={partialAmountUsd} />
            )}
            <button
              type="submit"
              disabled={!canConfirm}
              className="min-h-11 w-full rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-0 sm:w-auto sm:py-1.5"
            >
              Confirmar
            </button>
          </form>

          <form
            action={rejectAction}
            className="min-w-0 sm:contents"
            onSubmit={(e) => {
              if (!confirm("¿Rechazar esta transferencia? Se liberarán las fechas de la reserva.")) {
                e.preventDefault();
              }
            }}
          >
            <input type="hidden" name="bookingId" value={b.id} />
            <button
              type="submit"
              disabled={actionsDisabled}
              className="min-h-11 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-60 sm:min-h-0 sm:w-auto sm:py-1.5"
            >
              Rechazar
            </button>
          </form>
        </div>
      </div>
    </li>
  );
}

export function AdminPaymentsPanel({ bookings }: Props) {
  const [confirmState, confirmAction, confirmPending] = useActionState(confirmBankTransfer, initial);
  const [rejectState, rejectAction, rejectPending] = useActionState(rejectBankTransfer, initial);

  const hasItems = bookings.length > 0;
  const actionsDisabled = confirmPending || rejectPending;

  return (
    <AdminSectionCard
      id="pagos"
      title="Transferencias pendientes"
      description="Verifica el monto recibido y confirma o rechaza reservas con comprobante de transferencia bancaria."
      variant={hasItems ? "alert" : "success"}
      collapsible="mobile"
      defaultOpen={hasItems}
      badge={hasItems ? bookings.length : undefined}
    >
      <AdminActionFeedback
        error={confirmState.error ?? rejectState.error}
        success={confirmState.success ?? rejectState.success}
      />

      {!hasItems ? (
        <div className="flex items-start gap-3 rounded-lg border border-emerald-100 bg-emerald-50/50 px-4 py-3">
          <span className="text-lg text-emerald-600" aria-hidden>
            ✓
          </span>
          <p className="text-sm text-emerald-900">No hay comprobantes por revisar. Todo al día.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {bookings.map((b) => (
            <PendingTransferVerificationForm
              key={b.id}
              booking={b}
              confirmAction={confirmAction}
              rejectAction={rejectAction}
              actionsDisabled={actionsDisabled}
            />
          ))}
        </ul>
      )}
    </AdminSectionCard>
  );
}
