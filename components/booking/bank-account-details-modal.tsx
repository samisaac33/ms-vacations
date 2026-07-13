"use client";

import { useEffect } from "react";
import { BankAccountDetailsCard } from "@/components/booking/bank-account-details";
import type { BankAccountDetails } from "@/lib/payments/bank-transfer";

type Props = {
  open: boolean;
  onClose: () => void;
  bank: BankAccountDetails;
  reference?: string;
};

export function BankAccountDetailsModal({ open, onClose, bank, reference }: Props) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end bg-ink/40 lg:hidden">
      <button type="button" className="flex-1" aria-label="Cerrar" onClick={onClose} />
      <div className="max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-ink">Datos para transferir</h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-sand-dark"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        <BankAccountDetailsCard bank={bank} reference={reference} hideTitle />
      </div>
    </div>
  );
}

