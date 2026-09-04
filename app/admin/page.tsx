import { AdminLoginForm } from "@/app/admin/admin-login-form";
import { isAdminSession } from "@/lib/admin-auth";

export const metadata = {
  title: "Calendario",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ month?: string }> };

function AdminLoginScreen() {
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-xl font-semibold">Acceso equipo</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Defina <code className="rounded bg-zinc-200 px-1">ADMIN_SECRET</code> en el entorno.
      </p>
      <AdminLoginForm />
    </div>
  );
}

export default async function AdminPage(props: Props) {
  if (!(await isAdminSession())) {
    return <AdminLoginScreen />;
  }

  const { AdminDashboard } = await import("@/app/admin/admin-dashboard");
  return <AdminDashboard searchParams={props.searchParams} />;
}
