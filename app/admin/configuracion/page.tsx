import { redirect } from "next/navigation";
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

  redirect("/admin");
}
