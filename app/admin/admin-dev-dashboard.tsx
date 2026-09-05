import { AdminCalendarShell } from "@/app/admin/admin-calendar-shell";
import { AdminDevView } from "@/app/admin/admin-dev-view";

export async function AdminDevDashboard() {
  return (
    <AdminCalendarShell title="Dev">
      <AdminDevView />
    </AdminCalendarShell>
  );
}
