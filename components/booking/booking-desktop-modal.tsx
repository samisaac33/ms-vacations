"use client";

import { useEffect, type ReactNode } from "react";

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  maxWidthClass?: string;
};

export function BookingDesktopModal({
  open,
  title,
  onClose,
  children,
  footer,
  maxWidthClass = "max-w-[720px]",
}: Props) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] hidden items-center justify-center p-6 lg:flex">
      <button
        type="button"
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-desktop-modal-title"
        className={`relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-3xl bg-white shadow-xl ${maxWidthClass}`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-sand-dark px-6 py-5">
          <h2 id="booking-desktop-modal-title" className="text-xl font-semibold text-ink">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-sand-dark"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">{children}</div>

        {footer ? (
          <div className="flex shrink-0 items-center justify-between border-t border-sand-dark px-6 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
