import { NextResponse } from "next/server";
import { createBooking, bookingRequestSchema } from "@/lib/bookings";
import { getIcalUrl, getPropertyBySlug, paymentMethods } from "@/lib/catalog";
import { getBlockedDates, isRangeAvailable } from "@/lib/ical";
import { calculateQuote } from "@/lib/pricing";

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = bookingRequestSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const input = parsed.data;
  const property = getPropertyBySlug(input.propertySlug);

  if (!property) {
    return NextResponse.json({ error: "Propiedad no encontrada" }, { status: 404 });
  }

  if (input.guests > property.guests) {
    return NextResponse.json(
      { error: `Máximo ${property.guests} huéspedes` },
      { status: 400 },
    );
  }

  const paymentMethod = paymentMethods.find((method) => method.id === input.paymentMethodId);

  if (!paymentMethod) {
    return NextResponse.json({ error: "Forma de pago no válida" }, { status: 400 });
  }

  const quote = calculateQuote(property, input.checkIn, input.checkOut);

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
        new Date(input.checkIn),
        new Date(input.checkOut),
      );

      if (!isRangeAvailable(blocked, input.checkIn, input.checkOut)) {
        return NextResponse.json(
          { error: "Las fechas ya no están disponibles" },
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

  const booking = createBooking(input, {
    propertyName: property.name,
    total: quote.total,
    deposit: quote.deposit,
  });

  return NextResponse.json(
    {
      booking,
      message:
        "Solicitud recibida. Te contactaremos por WhatsApp o correo para confirmar y coordinar el pago.",
    },
    { status: 201 },
  );
}
