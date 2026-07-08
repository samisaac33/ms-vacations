import { addMonths, format } from "date-fns";
import { NextResponse } from "next/server";
import { getIcalUrl, getPropertyBySlug } from "@/lib/catalog";
import { getBlockedDates } from "@/lib/ical";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const property = getPropertyBySlug(slug);

  if (!property) {
    return NextResponse.json({ error: "Propiedad no encontrada" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const from = fromParam ? new Date(fromParam) : new Date();
  const to = toParam ? new Date(toParam) : addMonths(from, 6);

  const icalUrl = getIcalUrl(property);

  if (!icalUrl) {
    return NextResponse.json({
      propertySlug: slug,
      source: "none",
      blockedDates: [],
      from: format(from, "yyyy-MM-dd"),
      to: format(to, "yyyy-MM-dd"),
    });
  }

  try {
    const blockedDates = await getBlockedDates(icalUrl, from, to);

    return NextResponse.json({
      propertySlug: slug,
      source: "ical",
      blockedDates,
      from: format(from, "yyyy-MM-dd"),
      to: format(to, "yyyy-MM-dd"),
    });
  } catch {
    return NextResponse.json(
      { error: "No se pudo cargar la disponibilidad desde iCal" },
      { status: 502 },
    );
  }
}
