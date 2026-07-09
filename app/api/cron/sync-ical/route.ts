import { hasDatabase } from "@/db/index";
import { getHealthReport } from "@/lib/health-query";
import { syncAllPropertiesIcal } from "@/lib/ical-sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorized(): Response {
  return new Response("Unauthorized", { status: 401 });
}

async function handle(request: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return Response.json({ error: "CRON_SECRET no configurado" }, { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${expected}`) {
    return unauthorized();
  }
  if (!hasDatabase()) {
    return Response.json({ error: "DATABASE_URL no configurada" }, { status: 503 });
  }
  try {
    const result = await syncAllPropertiesIcal();
    const health = await getHealthReport();
    const ok = result.failed === 0 && health.status !== "down";
    return Response.json(
      {
        success: ok,
        ...result,
        health: {
          status: health.status,
          ical: {
            staleCount: health.checks.ical.staleCount,
            neverSyncedCount: health.checks.ical.neverSyncedCount,
            recentErrorCount: health.checks.ical.recentErrorCount,
          },
        },
      },
      { status: ok ? 200 : 207 },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
