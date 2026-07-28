"use client";

import { useEffect, type ReactNode } from "react";

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  maxWidthClass?: string;
};

export function PropertyDetailModal({
  open,
  title,
  onClose,
  children,
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
    <>
      <div className="fixed inset-0 z-[70] flex flex-col justify-end bg-ink/40 lg:hidden">
        <button type="button" className="flex-1" aria-label="Cerrar" onClick={onClose} />
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="property-detail-modal-title-mobile"
          className="flex max-h-[85vh] flex-col overflow-hidden rounded-t-3xl bg-white"
        >
          <div className="flex shrink-0 items-center justify-between border-b border-sand-dark px-4 py-4">
            <h2 id="property-detail-modal-title-mobile" className="text-lg font-semibold text-ink">
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
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            {children}
          </div>
        </div>
      </div>

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
          aria-labelledby="property-detail-modal-title-desktop"
          className={`relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-3xl bg-white shadow-xl ${maxWidthClass}`}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-sand-dark px-6 py-5">
            <h2 id="property-detail-modal-title-desktop" className="text-xl font-semibold text-ink">
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
        </div>
      </div>
    </>
  );
}

function ShowMoreButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-4 rounded-lg border border-ink/20 bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-sand-dark"
    >
      {label}
    </button>
  );
}

export { ShowMoreButton };
