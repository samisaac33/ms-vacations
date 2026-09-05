"use client";

import { useState, type ReactNode } from "react";
import { useAdminEmbedded } from "@/app/admin/admin-embedded-context";

type Variant = "default" | "alert" | "success";

type Props = {
  id?: string;
  title: string;
  description?: string;
  children: ReactNode;
  variant?: Variant;
  className?: string;
  collapsible?: "mobile";
  defaultOpen?: boolean;
  badge?: string | number;
};

const variantStyles: Record<Variant, string> = {
  default: "border-zinc-200 bg-white",
  alert: "border-amber-300 bg-amber-50/80",
  success: "border-emerald-200 bg-emerald-50/50",
};

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={`shrink-0 text-zinc-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SectionBadge({ badge }: { badge: string | number }) {
  return (
    <span className="inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-zinc-900 px-2 py-0.5 text-xs font-semibold text-white">
      {badge}
    </span>
  );
}

export function AdminSectionCard({
  id,
  title,
  description,
  children,
  variant = "default",
  className = "",
  collapsible,
  defaultOpen = false,
  badge,
}: Props) {
  const embedded = useAdminEmbedded();
  const [open, setOpen] = useState(defaultOpen);
  const isMobileCollapsible = collapsible === "mobile" && !embedded;

  if (embedded) {
    return <div className={className}>{children}</div>;
  }

  return (
    <section
      id={id}
      className={`scroll-mt-24 rounded-xl border shadow-sm ${variantStyles[variant]} ${
        isMobileCollapsible ? "overflow-hidden p-0 md:p-5" : "p-4 sm:p-5"
      } ${className}`}
    >
      {isMobileCollapsible ? (
        <>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            className="flex w-full items-center gap-3 px-4 py-4 text-left md:hidden"
          >
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-lg font-semibold text-zinc-900">{title}</span>
                {badge !== undefined && badge !== "" ? (
                  <SectionBadge badge={badge} />
                ) : null}
              </span>
            </span>
            <ChevronIcon open={open} />
          </button>

          <div className="hidden md:block">
            <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
            {description ? <p className="mt-1 text-sm text-zinc-600">{description}</p> : null}
          </div>

          <div
            className={`${open ? "block" : "hidden"} border-t border-zinc-200/80 px-4 pb-4 pt-3 md:border-0 md:block md:p-0 md:pt-0`}
          >
            {description ? (
              <p className="mb-3 text-sm text-zinc-600 md:hidden">{description}</p>
            ) : null}
            <div className="md:mt-4">{children}</div>
          </div>
        </>
      ) : (
        <>
          <h2 className="text-lg font-semibold text-zinc-900">{title}</h2>
          {description ? <p className="mt-1 text-sm text-zinc-600">{description}</p> : null}
          <div className="mt-4">{children}</div>
        </>
      )}
    </section>
  );
}

export function AdminActionFeedback({
  error,
  success,
}: {
  error?: string | null;
  success?: string | null;
}) {
  if (!error && !success) return null;
  if (error) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
        {error}
      </p>
    );
  }
  return (
    <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">
      {success}
    </p>
  );
}
