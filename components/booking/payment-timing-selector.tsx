"use client";

import { useState } from "react";
import { BookingDesktopModal } from "@/components/booking/booking-desktop-modal";
import { formatUsd } from "@/lib/pricing";
import {
  formatBalanceDueDate,
  type PaymentTiming,
  type SplitSchedule,
} from "@/lib/payment-schedule";

type Props = {
  totalUsd: number;
  splitSchedule: SplitSchedule | null;
  paymentTiming: PaymentTiming;
  onChange: (timing: PaymentTiming) => void;
};

export function PaymentTimingSelector({
  totalUsd,
  splitSchedule,
  paymentTiming,
  onChange,
}: Props) {
  const [infoOpen, setInfoOpen] = useState(false);
  const depositUsd = splitSchedule ? splitSchedule.depositCents / 100 : totalUsd / 2;
  const balanceUsd = splitSchedule ? splitSchedule.balanceCents / 100 : totalUsd / 2;
  const balanceDateLabel = splitSchedule
    ? formatBalanceDueDate(splitSchedule.balanceDueDate)
    : null;

  return (
    <div className="space-y-3">
      <p className="text-base font-semibold text-ink">Elige cuándo quieres pagar</p>
      <div className="overflow-hidden rounded-2xl border border-sand-dark bg-white">
        <label className="flex cursor-pointer items-center justify-between gap-3 border-b border-sand-dark p-4">
          <span className="text-sm font-medium text-ink">Paga ${formatUsd(totalUsd)} ahora</span>
          <input
            type="radio"
            name="payment-timing"
            checked={paymentTiming === "full_now"}
            onChange={() => onChange("full_now")}
            className="h-4 w-4 shrink-0 accent-ocean"
          />
        </label>

        {splitSchedule && (
          <label className="flex cursor-pointer items-start justify-between gap-3 p-4">
            <span className="min-w-0 text-sm">
              <span className="font-medium text-ink">Paga una parte ahora y otra más adelante</span>
              <span className="mt-1 block text-muted">
                Paga ${formatUsd(depositUsd)} ahora y ${formatUsd(balanceUsd)} el{" "}
                {balanceDateLabel}. Sin tarifas adicionales.{" "}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setInfoOpen(true);
                  }}
                  className="font-medium text-ink underline underline-offset-2"
                >
                  Más información
                </button>
              </span>
            </span>
            <input
              type="radio"
              name="payment-timing"
              checked={paymentTiming === "split"}
              onChange={() => onChange("split")}
              className="mt-1 h-4 w-4 shrink-0 accent-ocean"
            />
          </label>
        )}
      </div>

      {infoOpen && (
        <>
          <div className="fixed inset-0 z-[60] flex flex-col justify-end bg-ink/40 lg:hidden">
            <button
              type="button"
              className="flex-1"
              aria-label="Cerrar"
              onClick={() => setInfoOpen(false)}
            />
            <div className="rounded-t-3xl bg-white px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-ink">Pago fraccionado</h3>
                <button
                  type="button"
                  onClick={() => setInfoOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-sand-dark"
                  aria-label="Cerrar"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm leading-relaxed text-muted">
                Pagas el 50 % al confirmar la reserva y el 50 % restante el día que falten 14 días
                para tu check-in. No hay cargos extra por pagar en dos partes. El saldo pendiente
                debe transferirse o pagarse online antes de esa fecha.
              </p>
            </div>
          </div>

          <BookingDesktopModal
            open
            title="Pago fraccionado"
            onClose={() => setInfoOpen(false)}
            maxWidthClass="max-w-md"
          >
            <p className="text-sm leading-relaxed text-muted">
              Pagas el 50 % al confirmar la reserva y el 50 % restante el día que falten 14 días
              para tu check-in. No hay cargos extra por pagar en dos partes. El saldo pendiente
              debe transferirse o pagarse online antes de esa fecha.
            </p>
          </BookingDesktopModal>
        </>
      )}
    </div>
  );
}
