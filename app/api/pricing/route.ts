import { hasDatabase } from "@/db/index";
import { isValidDateOrder } from "@/lib/dates";
import { validateStayLength } from "@/lib/stay-rules";
import { getStayQuoteBySlug } from "@/lib/pricing-query";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(r: Request) {
  if (!hasDatabase()) {
    return Response.json({ error: "Base de datos no configurada" }, { status: 503 });
  }

  const url = new URL(r.url);
  const slug = url.searchParams.get("slug");
  const checkIn = url.searchParams.get("checkIn");
  const checkOut = url.searchParams.get("checkOut");

  if (!slug || !checkIn || !checkOut) {
    return Response.json({ error: "Parámetros slug, checkIn y checkOut requeridos" }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkIn) || !/^\d{4}-\d{2}-\d{2}$/.test(checkOut)) {
    return Response.json({ error: "Fechas inválidas" }, { status: 400 });
  }
  if (!isValidDateOrder(checkIn, checkOut)) {
    return Response.json({ error: "Rango de fechas inválido" }, { status: 400 });
  }
  const stayLengthError = validateStayLength(checkIn, checkOut);
  if (stayLengthError) {
    return Response.json({ error: stayLengthError }, { status: 400 });
  }

  const quote = await getStayQuoteBySlug(slug, checkIn, checkOut);
  if (!quote) {
    return Response.json({ error: "Propiedad no encontrada" }, { status: 404 });
  }

  return Response.json(quote, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
