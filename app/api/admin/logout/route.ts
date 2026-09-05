import { clearAdminSessionCookie } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  await clearAdminSessionCookie();
  return Response.json({ ok: true });
}
