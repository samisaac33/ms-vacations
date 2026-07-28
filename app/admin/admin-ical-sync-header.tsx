"use client";

import { useRouter } from "next/navigation";
import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { triggerIcalSync, type IcalActionState } from "./actions";

function formatSyncDate(iso: string | null): string {
  if (!iso) return "Nunca";
  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Guayaquil",
  }).format(new Date(iso));
}

function SyncIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={spinning ? "animate-spin" : undefined}
    >
      <path
        d="M20 12a8 8 0 1 1-2.34-5.66M20 4v6h-6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type Props = {
  variant?: "site" | "admin";
};

export function AdminIcalSyncToolbar({ variant = "site" }: Props) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(triggerIcalSync, {} as IcalActionState);
  const rootRef = useRef<HTMLDivElement>(null);

  const loadStatus = useCallback(async () => {
    const res = await fetch("/api/admin/ical-sync-status");
    if (res.status === 401) {
      setAuthorized(false);
      return;
    }
    if (!res.ok) {
      setAuthorized(true);
      return;
    }
    const data = (await res.json()) as { lastSyncAt: string | null };
    setAuthorized(true);
    setLastSyncAt(data.lastSyncAt);
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    if (state?.success && !state?.error) {
      router.refresh();
      void loadStatus();
    }
  }, [state?.success, state?.error, router, loadStatus]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open]);

  if (authorized === false || authorized === null) {
    return null;
  }

  const label = `Sincronizar calendarios iCal. Última sync: ${formatSyncDate(lastSyncAt)}`;
  const isAdmin = variant === "admin";
  const triggerClass = isAdmin
    ? "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 disabled:opacity-60"
    : "inline-flex h-10 w-10 items-center justify-center rounded-lg border border-sand-dark bg-white text-ink disabled:opacity-60";
  const popoverClass = isAdmin
    ? "absolute right-0 top-full z-[60] mt-1 w-64 rounded-xl border border-zinc-200 bg-white p-4 shadow-lg"
    : "absolute right-0 top-full z-[60] mt-1 w-64 rounded-xl border border-sand-dark bg-white p-4 shadow-lg";
  const labelClass = isAdmin ? "text-xs font-medium uppercase tracking-wide text-zinc-500" : "text-xs font-medium uppercase tracking-wide text-muted";
  const textClass = isAdmin ? "mt-2 text-sm text-zinc-700" : "mt-2 text-sm text-ink";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className={triggerClass}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={label}
        disabled={pending}
        onClick={() => setOpen((v) => !v)}
      >
        <SyncIcon spinning={pending} />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Sincronización iCal"
          className={popoverClass}
        >
          <p className={labelClass}>Calendarios iCal</p>
          <p className={textClass}>
            Última sync:{" "}
            <span className="font-medium">{formatSyncDate(lastSyncAt)}</span>
          </p>

          <form action={formAction} className="mt-3">
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {pending ? "Sincronizando…" : "Sincronizar ahora"}
            </button>
          </form>

          {state?.error && (
            <p className="mt-2 text-xs text-red-700" role="alert">
              {state.error}
            </p>
          )}
          {state?.success && (
            <p className="mt-2 text-xs text-emerald-700" role="status">
              {state.success}
            </p>
          )}
        </div>
      )}
    </div>
  );
}