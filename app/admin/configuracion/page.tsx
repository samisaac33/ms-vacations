import { isAdminSession } from "@/lib/admin-auth";

export const metadata = {
  title: "Configuración",
  robots: { index: false, follow: false },
};

export default async function AdminConfiguracionPage() {
  if (!(await isAdminSession())) {
    const { AdminLoginScreen } = await import("@/app/admin/admin-login-screen");
    return <AdminLoginScreen />;
  }

  const { AdminConfigDashboard } = await import("@/app/admin/admin-config-dashboard");
  return <AdminConfigDashboard />;
}
