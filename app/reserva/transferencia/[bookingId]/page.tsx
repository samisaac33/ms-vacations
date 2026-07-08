import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getBookingForGuest } from "@/lib/booking-service";
import { formatBookingReference, getBankAccountDetails } from "@/lib/payments/bank-transfer";
import { hasDatabase } from "@/db/index";
import { BankTransferUploadForm } from "./bank-transfer-upload-form";

type Props = { params: Promise<{ bookingId: string }> };

export default async function BankTransferPage({ params }: Props) {
  if (!hasDatabase()) notFound();
  const { bookingId } = await params;
  const booking = await getBookingForGuest(bookingId);
  if (!booking || booking.paymentMethod !== "bank_transfer") notFound();

  const bank = getBankAccountDetails();
  const reference = formatBookingReference(bookingId);

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold text-ink">Transferencia bancaria</h1>
      <p className="mt-2 text-sm text-muted">
        Realiza la transferencia por el monto indicado e indica la referencia <strong>{reference}</strong>.
        Luego sube el comprobante para que confirmemos tu reserva.
      </p>

      <div className="mt-8">
        <BankTransferUploadForm
          bookingId={bookingId}
          reference={reference}
          totalUsd={booking.totalCents / 100}
          bank={bank}
          status={booking.status}
          proofUrl={booking.paymentProofUrl}
        />
      </div>

      <Button href="/propiedades" variant="secondary" className="mt-8">
        Volver al catálogo
      </Button>
    </div>
  );
}
