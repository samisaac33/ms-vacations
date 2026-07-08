"use client";

import { addDays, format } from "date-fns";
import { useEffect, useState } from "react";
import { PaymentMethods } from "@/components/booking/PaymentMethods";
import { Button } from "@/components/ui/Button";
import type { PaymentMethod, PropertyRecord } from "@/lib/catalog";

interface PriceQuote {
  nights: number;
  pricePerNight: number;
  subtotal: number;
  cleaningFee: number;
  total: number;
  deposit: number;
  currency: "USD";
  minNights: number;
}

interface BookingPanelProps {
  property: PropertyRecord;
  paymentMethods: PaymentMethod[];
}

export function BookingPanel({ property, paymentMethods }: BookingPanelProps) {
  const today = format(new Date(), "yyyy-MM-dd");
  const defaultCheckout = format(addDays(new Date(), property.minNights + 1), "yyyy-MM-dd");

  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(defaultCheckout);
  const [guests, setGuests] = useState(Math.min(2, property.guests));
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState(paymentMethods[0]?.id ?? "transferencia");
  const [notes, setNotes] = useState("");
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [quote, setQuote] = useState<PriceQuote | null>(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAvailability() {
      const response = await fetch(`/api/properties/${property.slug}/availability`);
      if (!response.ok) return;
      const data = (await response.json()) as { blockedDates: { date: string }[] };
      setBlockedDates(data.blockedDates.map((item) => item.date));
    }

    loadAvailability();
  }, [property.slug]);

  useEffect(() => {
    async function loadQuote() {
      setLoadingQuote(true);
      setError(null);

      const response = await fetch(`/api/properties/${property.slug}/quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkIn, checkOut, guests }),
      });

      const data = await response.json();

      if (!response.ok) {
        setQuote(null);
        setError(data.error ?? "No se pudo calcular el precio");
      } else {
        setQuote(data.quote);
        setError(null);
      }

      setLoadingQuote(false);
    }

    if (checkIn && checkOut) {
      loadQuote();
    }
  }, [checkIn, checkOut, guests, property.slug]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setError(null);

    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        propertySlug: property.slug,
        checkIn,
        checkOut,
        guests,
        guestName,
        guestEmail,
        guestPhone,
        paymentMethodId,
        notes: notes || undefined,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "No se pudo enviar la solicitud");
    } else {
      setMessage(
        `Solicitud ${data.booking.id} recibida. Te contactaremos pronto para confirmar y coordinar el pago.`,
      );
    }

    setSubmitting(false);
  }

  return (
    <aside className="rounded-2xl border border-border bg-white p-6 shadow-sm lg:sticky lg:top-24">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-2xl font-semibold text-foreground">
          ${property.pricePerNight}
          <span className="text-base font-normal text-muted"> / noche</span>
        </p>
        <p className="text-sm text-muted">Mín. {property.minNights} noches</p>
      </div>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            <span className="font-medium text-foreground">Entrada</span>
            <input
              type="date"
              value={checkIn}
              min={today}
              onChange={(event) => setCheckIn(event.target.value)}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2.5"
              required
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-foreground">Salida</span>
            <input
              type="date"
              value={checkOut}
              min={checkIn}
              onChange={(event) => setCheckOut(event.target.value)}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2.5"
              required
            />
          </label>
        </div>

        <label className="block text-sm">
          <span className="font-medium text-foreground">Huéspedes</span>
          <select
            value={guests}
            onChange={(event) => setGuests(Number(event.target.value))}
            className="mt-1 w-full rounded-xl border border-border px-3 py-2.5"
          >
            {Array.from({ length: property.guests }, (_, index) => index + 1).map((count) => (
              <option key={count} value={count}>
                {count} {count === 1 ? "huésped" : "huéspedes"}
              </option>
            ))}
          </select>
        </label>

        {blockedDates.length > 0 && (
          <p className="text-xs text-muted">
            {blockedDates.length} fechas bloqueadas sincronizadas desde calendario iCal.
          </p>
        )}

        {quote && !error && (
          <div className="rounded-xl bg-surface p-4 text-sm">
            <div className="flex justify-between">
              <span>
                ${quote.pricePerNight} x {quote.nights} noches
              </span>
              <span>${quote.subtotal}</span>
            </div>
            <div className="mt-2 flex justify-between">
              <span>Limpieza</span>
              <span>${quote.cleaningFee}</span>
            </div>
            <div className="mt-3 flex justify-between border-t border-border pt-3 font-semibold text-foreground">
              <span>Total</span>
              <span>${quote.total} USD</span>
            </div>
            <div className="mt-2 flex justify-between text-muted">
              <span>Depósito (50%)</span>
              <span>${quote.deposit} USD</span>
            </div>
          </div>
        )}

        {loadingQuote && <p className="text-sm text-muted">Calculando precio...</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="space-y-3 border-t border-border pt-4">
          <label className="block text-sm">
            <span className="font-medium text-foreground">Nombre completo</span>
            <input
              type="text"
              value={guestName}
              onChange={(event) => setGuestName(event.target.value)}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2.5"
              required
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-foreground">Correo</span>
            <input
              type="email"
              value={guestEmail}
              onChange={(event) => setGuestEmail(event.target.value)}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2.5"
              required
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-foreground">Teléfono / WhatsApp</span>
            <input
              type="tel"
              value={guestPhone}
              onChange={(event) => setGuestPhone(event.target.value)}
              className="mt-1 w-full rounded-xl border border-border px-3 py-2.5"
              required
            />
          </label>
        </div>

        <PaymentMethods
          methods={paymentMethods}
          selectedId={paymentMethodId}
          onSelect={setPaymentMethodId}
        />

        <label className="block text-sm">
          <span className="font-medium text-foreground">Notas (opcional)</span>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            className="mt-1 w-full rounded-xl border border-border px-3 py-2.5"
            placeholder="Cuéntanos si viajas con niños, mascotas, etc."
          />
        </label>

        <Button type="submit" className="w-full" disabled={submitting || !!error || !quote}>
          {submitting ? "Enviando..." : "Solicitar reserva"}
        </Button>

        {message && <p className="text-sm text-primary">{message}</p>}
      </form>
    </aside>
  );
}
