import { AdminLoginForm } from "@/app/admin/admin-login-form";
import { isAdminSession } from "@/lib/admin-auth";

export const metadata = {
  title: "Calendario",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ month?: string }> };

export default async function AdminPage(props: Props) {
  if (!(await isAdminSession())) {
    const { AdminLoginScreen } = await import("@/app/admin/admin-login-screen");
    return <AdminLoginScreen />;
  }

  const { AdminDashboard } = await import("@/app/admin/admin-dashboard");
  return <AdminDashboard searchParams={props.searchParams} />;
}
