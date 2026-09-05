import { isAdminSession } from "@/lib/admin-auth";

export const metadata = {
  title: "Dev",
  robots: { index: false, follow: false },
};

export default async function AdminDevPage() {
  if (!(await isAdminSession())) {
    const { AdminLoginScreen } = await import("@/app/admin/admin-login-screen");
    return <AdminLoginScreen />;
  }

  const { AdminDevDashboard } = await import("@/app/admin/admin-dev-dashboard");
  return <AdminDevDashboard />;
}
