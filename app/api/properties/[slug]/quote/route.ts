import { NextResponse } from "next/server";
import { getIcalUrl, getPropertyBySlug } from "@/lib/catalog";
import { getBlockedDates, isRangeAvailable } from "@/lib/ical";
import { calculateQuote } from "@/lib/pricing";

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const property = getPropertyBySlug(slug);

  if (!property) {
    return NextResponse.json({ error: "Propiedad no encontrada" }, { status: 404 });
  }

  const body = (await request.json()) as {
    checkIn?: string;
    checkOut?: string;
    guests?: number;
  };

  if (!body.checkIn || !body.checkOut) {
    return NextResponse.json({ error: "Fechas requeridas" }, { status: 400 });
  }

  if (body.guests && body.guests > property.guests) {
    return NextResponse.json(
      { error: `Máximo ${property.guests} huéspedes` },
      { status: 400 },
    );
  }

  const quote = calculateQuote(property, body.checkIn, body.checkOut);

  if (!quote) {
    return NextResponse.json(
      { error: `Estancia mínima de ${property.minNights} noches` },
      { status: 400 },
    );
  }

  const icalUrl = getIcalUrl(property);

  if (icalUrl) {
    try {
      const blocked = await getBlockedDates(
        icalUrl,
        new Date(body.checkIn),
        new Date(body.checkOut),
      );

      if (!isRangeAvailable(blocked, body.checkIn, body.checkOut)) {
        return NextResponse.json(
          { error: "Las fechas seleccionadas no están disponibles" },
          { status: 409 },
        );
      }
    } catch {
      return NextResponse.json(
        { error: "No se pudo validar disponibilidad" },
        { status: 502 },
      );
    }
  }

  return NextResponse.json({ quote });
}
