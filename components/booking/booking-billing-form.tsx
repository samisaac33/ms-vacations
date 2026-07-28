"use client";

import { useEffect, useState } from "react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { BillingIdType } from "@/lib/billing-validation";

type BillingStatusResponse = {
  billingCompleted: boolean;
  voucherSent: boolean;
  billingName: string | null;
  billingIdType: string | null;
  billingIdNumber: string | null;
  billingCity: string | null;
  guestEmail: string | null;
  status: string;
};

type Props = {
  bookingId: string;
  guestEmail: string;
};

const ID_TYPES: { value: BillingIdType; label: string }[] = [
  { value: "RUC", label: "RUC" },
  { value: "CEDULA", label: "Cédula" },
  { value: "PASAPORTE", label: "Pasaporte" },
];

export function BookingBillingForm({ bookingId, guestEmail: initialGuestEmail }: Props) {
  const [billingName, setBillingName] = useState("");
  const [billingIdType, setBillingIdType] = useState<BillingIdType>("RUC");
  const [billingIdNumber, setBillingIdNumber] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [guestEmail, setGuestEmail] = useState(initialGuestEmail);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voucherSent, setVoucherSent] = useState(false);
  const [voucherPending, setVoucherPending] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/bookings/${bookingId}/billing`);
        const data = (await res.json()) as BillingStatusResponse & { error?: string };
        if (cancelled || !res.ok) return;

        if (data.billingName) setBillingName(data.billingName);
        if (data.billingIdType === "RUC" || data.billingIdType === "CEDULA" || data.billingIdType === "PASAPORTE") {
          setBillingIdType(data.billingIdType);
        }
        if (data.billingIdNumber) setBillingIdNumber(data.billingIdNumber);
        if (data.billingCity) setBillingCity(data.billingCity);
        if (data.guestEmail) setGuestEmail(data.guestEmail);
        setVoucherSent(data.voucherSent);
        setVoucherPending(data.billingCompleted && !data.voucherSent && data.status === "pending_verification");
        setCompleted(data.billingCompleted);
      } catch {
        if (!cancelled) setError("No se pudo cargar los datos de facturacion.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`/api/bookings/${bookingId}/billing`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billingName,
          billingIdType,
          billingIdNumber,
          billingCity,
          guestEmail,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        voucherSent?: boolean;
        voucherPending?: boolean;
      };

      if (!res.ok) {
        setError(data.error ?? "No se pudieron guardar los datos.");
        return;
      }

      setCompleted(true);
      setVoucherSent(Boolean(data.voucherSent));
      setVoucherPending(Boolean(data.voucherPending));
    } catch {
      setError("Error de red. Intente de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-sand-dark bg-white p-5 text-sm text-muted">
        Cargando datos de facturacion…
      </div>
    );
  }

  if (voucherSent) {
    return (
      <div
        className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 text-sm text-emerald-900"
        role="status"
      >
        <p className="font-semibold">Comprobante enviado</p>
        <p className="mt-1 leading-relaxed">
          Revisa tu correo <span className="font-medium">{guestEmail}</span> para descargar el PDF del
          comprobante de reserva.
        </p>
      </div>
    );
  }

  if (completed && voucherPending) {
    return (
      <div
        className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-sm text-amber-950"
        role="status"
      >
        <p className="font-semibold">Datos guardados</p>
        <p className="mt-1 leading-relaxed">
          Recibimos tus datos de facturacion. Te enviaremos el comprobante en PDF cuando confirmemos
          el pago de tu reserva.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-sand-dark bg-white p-5 shadow-sm"
    >
      <h3 className="font-display text-lg font-semibold text-ink">Datos para facturacion</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        Completa estos datos para recibir tu comprobante de reserva en PDF por correo.
      </p>

      <div className="mt-5 space-y-4">
        <div>
          <Label htmlFor="billing-name">Nombre o razon social</Label>
          <Input
            id="billing-name"
            required
            value={billingName}
            onChange={(e) => setBillingName(e.target.value)}
            placeholder="Ej. Juan Perez o Mi Empresa S.A."
            className="mt-2"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="billing-id-type">Tipo de identificacion</Label>
            <select
              id="billing-id-type"
              required
              value={billingIdType}
              onChange={(e) => setBillingIdType(e.target.value as BillingIdType)}
              className="mt-2 w-full rounded-lg border border-sand-dark bg-white px-3 py-2 text-ink focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/20"
            >
              {ID_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="billing-id-number">Numero de identificacion</Label>
            <Input
              id="billing-id-number"
              required
              value={billingIdNumber}
              onChange={(e) => setBillingIdNumber(e.target.value)}
              placeholder={billingIdType === "RUC" ? "1790012345001" : "1712345678"}
              className="mt-2"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="billing-city">Ciudad</Label>
          <Input
            id="billing-city"
            required
            value={billingCity}
            onChange={(e) => setBillingCity(e.target.value)}
            placeholder="Ej. Quito"
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="billing-email">Correo para el comprobante</Label>
          <Input
            id="billing-email"
            type="email"
            required
            autoComplete="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            className="mt-2"
          />
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" disabled={submitting} className="mt-5 w-full">
        {submitting ? "Enviando…" : "Enviar"}
      </Button>
    </form>
  );
}
