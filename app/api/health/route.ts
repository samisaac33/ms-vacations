import { getHealthReport } from "@/lib/health-query";
import { healthHttpStatus } from "@/lib/health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const report = await getHealthReport();
  return Response.json(report, {
    status: healthHttpStatus(report.status),
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
