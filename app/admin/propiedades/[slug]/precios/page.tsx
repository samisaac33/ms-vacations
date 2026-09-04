import { isAdminSession } from "@/lib/admin-auth";

export const metadata = {
  title: "Calendario de precios",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ slug: string }> };

export default async function AdminPropertyPricingPage(props: Props) {
  if (!(await isAdminSession())) {
    const { AdminLoginScreen } = await import("@/app/admin/admin-login-screen");
    return <AdminLoginScreen />;
  }

  const { AdminPropertyPricingDashboard } = await import(
    "@/app/admin/admin-property-pricing-dashboard"
  );
  return <AdminPropertyPricingDashboard params={props.params} />;
}
