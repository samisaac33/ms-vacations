import { isAdminSession } from "@/lib/admin-auth";

export const metadata = {
  title: "Fotos de propiedad",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ slug: string }> };

export default async function AdminPropertyImagesPage(props: Props) {
  if (!(await isAdminSession())) {
    const { AdminLoginScreen } = await import("@/app/admin/admin-login-screen");
    return <AdminLoginScreen />;
  }

  const { AdminPropertyImagesDashboard } = await import(
    "@/app/admin/admin-property-images-dashboard"
  );
  return <AdminPropertyImagesDashboard params={props.params} />;
}
