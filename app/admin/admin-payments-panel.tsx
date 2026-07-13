"use client";

import { useActionState } from "react";
import { confirmBankTransfer, rejectBankTransfer, type AdminActionState } from "./actions";
import type { PendingVerificationBooking } from "@/lib/admin-payments";
import { formatUsd } from "@/lib/pricing";

type Props = {
  bookings: PendingVerificationBooking[];
};

const initial: AdminActionState = {};

function formatMoney(cents: number) {
  return `$${formatUsd(cents / 100)}`;
}

export function AdminPaymentsPanel({ bookings }: Props) {
  const [confirmState, confirmAction, confirmPending] = useActionState(confirmBankTransfer, initial);
  const [rejectState, rejectAction, rejectPending] = useActionState(rejectBankTransfer, initial);

  if (bookings.length === 0) {
    return (
      <section className="mt-10">
        <h2 className="text-lg font-semibold">Transferencias pendientes</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          No hay comprobantes por revisar.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold">Transferencias pendientes</h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        Confirma o rechaza reservas pendientes de verificación.
      </p>

      {(confirmState.error || confirmState.success || rejectState.error || rejectState.success) && (
        <p className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900">
          {confirmState.error ?? confirmState.success ?? rejectState.error ?? rejectState.success}
        </p>
      )}

      <ul className="mt-6 space-y-4">
        {bookings.map((b) => (
          <li
            key={b.id}
            className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">{b.slug}</p>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {b.checkIn} → {b.checkOut} · {b.guests} huéspedes · {formatMoney(b.totalCents)}
                </p>
                <p className="mt-1 text-sm">{b.guestEmail ?? "—"}</p>
                {!b.paymentProofUrl && (
                  <span className="mt-2 inline-flex rounded-full bg-[#25D366]/15 px-2.5 py-0.5 text-xs font-medium text-[#128C7E]">
                    Comprobante vía WhatsApp
                  </span>
                )}
                {b.paymentProofUrl && (
                  <a
                    href={b.paymentProofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-sm text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Ver comprobante →
                  </a>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <form action={confirmAction}>
                  <input type="hidden" name="bookingId" value={b.id} />
                  <button
                    type="submit"
                    disabled={confirmPending || rejectPending}
                    className="rounded-lg bg-emerald-700 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-60"
                  >
                    Confirmar
                  </button>
                </form>
                <form action={rejectAction}>
                  <input type="hidden" name="bookingId" value={b.id} />
                  <button
                    type="submit"
                    disabled={confirmPending || rejectPending}
                    className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600"
                  >
                    Rechazar
                  </button>
                </form>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
