import { cookies } from "next/headers";
import { format, parseISO, startOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { Suspense } from "react";
import { AdminCalendarShell } from "@/app/admin/admin-calendar-shell";
import { AdminLoginForm } from "@/app/admin/admin-login-form";
import { AdminMultiCalendar } from "@/app/admin/admin-multi-calendar";

export const metadata = {
  title: "Calendario",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ month?: string }> };

export default async function AdminPage(props: Props) {
  const store = await cookies();
  const ok = store.get("admin_session")?.value === "1";

  if (!ok) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16">
        <h1 className="text-xl font-semibold">Acceso equipo</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Defina <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">ADMIN_SECRET</code> en el entorno.
        </p>
        <AdminLoginForm />
      </div>
    );
  }

  const params = await props.searchParams;
  const initialMonth =
    params.month && /^\d{4}-\d{2}$/.test(params.month)
      ? params.month
      : format(startOfMonth(new Date()), "yyyy-MM");

  const title = format(parseISO(`${initialMonth}-01T12:00:00`), "LLLL yyyy", { locale: es });

  return (
    <AdminCalendarShell activeTab="calendario" title={`Calendario · ${title}`}>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-zinc-200" />}>
        <AdminMultiCalendar initialMonth={initialMonth} />
      </Suspense>
    </AdminCalendarShell>
  );
}
