import Link from "next/link";
import { adminLogout } from "@/app/admin/actions";
import { siteConfig } from "@/lib/site";

type Props = {
  children: React.ReactNode;
  activeTab: "calendario" | "configuracion";
  title?: string;
};

export function AdminCalendarShell({ children, activeTab, title }: Props) {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-sm font-semibold tracking-tight text-zinc-900">
              {siteConfig.name}
            </Link>
            <nav className="flex items-center gap-1">
              <TabLink href="/admin" active={activeTab === "calendario"}>
                Calendario
              </TabLink>
              <TabLink href="/admin/configuracion" active={activeTab === "configuracion"}>
                Configuración
              </TabLink>
            </nav>
          </div>
          <form action={adminLogout}>
            <button
              type="submit"
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              Cerrar sesión
            </button>
          </form>
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
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
        active ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
      }`}
    >
      {children}
    </Link>
  );
}
