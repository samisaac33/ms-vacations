import { setAdminSessionCookie } from "@/lib/admin-auth";
import { verifyAdminPassword } from "@/lib/admin-login";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let password: unknown;
  try {
    const body = (await request.json()) as { password?: unknown };
    password = body.password;
  } catch {
    return Response.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const result = verifyAdminPassword(password);
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  await setAdminSessionCookie();
  return Response.json({ ok: true });
}
