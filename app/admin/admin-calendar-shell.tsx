import Link from "next/link";
import { AdminIcalSyncToolbar } from "@/app/admin/admin-ical-sync-header";
import { adminLogout } from "@/app/admin/actions";

type Props = {
  children: React.ReactNode;
  activeTab: "calendario" | "configuracion" | "dev";
  title?: string;
  configPendingCount?: number;
};

function GearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.09V21.5a2 2 0 1 1-4 0v-.41a1.7 1.7 0 0 0-.4-1.09 1.7 1.7 0 0 0-1-.6 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.09-.4H2.5a2 2 0 1 1 0-4h.41a1.7 1.7 0 0 0 1.09-.4 1.7 1.7 0 0 0 .6-1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.09V2.5a2 2 0 1 1 4 0v.41a1.7 1.7 0 0 0 .4 1.09 1.7 1.7 0 0 0 1 .6 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 .6 1 1.7 1.7 0 0 0 1.09.4H21.5a2 2 0 1 1 0 4h-.41a1.7 1.7 0 0 0-1.09.4 1.7 1.7 0 0 0-.6 1Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AdminCalendarShell({
  children,
  activeTab,
  title,
  configPendingCount = 0,
}: Props) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <nav className="flex flex-1 items-center gap-1">
            <TabLink href="/admin" active={activeTab === "calendario"}>
              Calendario
            </TabLink>
            <TabLink
              href="/admin/configuracion"
              active={activeTab === "configuracion"}
              badge={configPendingCount > 0 ? configPendingCount : undefined}
            >
              Configuración
            </TabLink>
            <TabIconLink href="/admin/dev" active={activeTab === "dev"} aria-label="Dev" className="ml-auto">
              <GearIcon />
            </TabIconLink>
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <AdminIcalSyncToolbar variant="admin" />
            <form action={adminLogout}>
              <button
                type="submit"
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
        {title && (
          <div className="border-t border-zinc-100 px-4 py-3 sm:px-6">
            <h1 className="text-lg font-semibold capitalize">{title}</h1>
          </div>
        )}
      </header>
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6">{children}</div>
    </div>
  );
}

function TabLink({
  href,
  active,
  badge,
  children,
}: {
  href: string;
  active: boolean;
  badge?: number;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ${
        active ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
      }`}
    >
      {children}
      {badge != null && badge > 0 && (
        <span
          className={`inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold ${
            active ? "bg-amber-400 text-amber-950" : "bg-amber-500 text-white"
          }`}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}

function TabIconLink({
  href,
  active,
  children,
  className = "",
  "aria-label": ariaLabel,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
  className?: string;
  "aria-label": string;
}) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${className} ${
        active ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
      }`}
    >
      {children}
    </Link>
  );
}
