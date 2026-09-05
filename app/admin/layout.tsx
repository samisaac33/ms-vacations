import { connection } from "next/server";
import { AdminMenuContent } from "@/app/admin/admin-menu-content";
import { isAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await connection();
  const authed = await isAdminSession();

  return (
    <>
      {children}
      {authed ? <AdminMenuContent /> : null}
    </>
  );
}
