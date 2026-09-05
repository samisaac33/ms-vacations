import { AdminCalendarShell } from "@/app/admin/admin-calendar-shell";
import { AdminDevPanel } from "@/app/admin/admin-dev-panel";

export async function AdminDevDashboard() {
  return (
    <AdminCalendarShell title="Dev">
      <div className="mx-auto max-w-5xl">
        <AdminDevPanel />
      </div>
    </AdminCalendarShell>
  );
}
