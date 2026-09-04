import { format, parseISO, startOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { Suspense } from "react";
import { AdminCalendarShell } from "@/app/admin/admin-calendar-shell";
import { AdminMultiCalendar } from "@/app/admin/admin-multi-calendar";
import { getPendingVerificationBookings } from "@/lib/admin-payments";

type Props = {
  searchParams: Promise<{ month?: string }>;
};

export async function AdminDashboard({ searchParams }: Props) {
  const params = await searchParams;
  const initialMonth =
    params.month && /^\d{4}-\d{2}$/.test(params.month)
      ? params.month
      : format(startOfMonth(new Date()), "yyyy-MM");

  const title = format(parseISO(`${initialMonth}-01T12:00:00`), "LLLL yyyy", { locale: es });

  let pendingCount = 0;
  try {
    const pending = await getPendingVerificationBookings();
    pendingCount = pending.length;
  } catch {
    // ignore
  }

  return (
    <AdminCalendarShell
      activeTab="calendario"
      title={`Calendario · ${title}`}
      configPendingCount={pendingCount}
    >
      <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-zinc-200" />}>
        <AdminMultiCalendar initialMonth={initialMonth} />
      </Suspense>
    </AdminCalendarShell>
  );
}
