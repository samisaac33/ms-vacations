import { uploadPaymentProof } from "@/lib/storage";
import { getBookingForGuest, submitBankTransferProof } from "@/lib/booking-service";
import { hasDatabase } from "@/db/index";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  if (!hasDatabase()) {
    return Response.json({ error: "Base de datos no configurada" }, { status: 503 });
  }

  const { id: bookingId } = await context.params;
  const booking = await getBookingForGuest(bookingId);
  if (!booking) {
    return Response.json({ error: "Reserva no encontrada" }, { status: 404 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Formulario inválido" }, { status: 400 });
  }

  const file = formData.get("proof");
  if (!(file instanceof File)) {
    return Response.json({ error: "Debe adjuntar un comprobante" }, { status: 400 });
  }

  const uploaded = await uploadPaymentProof(bookingId, file);
  if (!uploaded.ok) {
    return Response.json({ error: uploaded.message }, { status: 400 });
  }

  const result = await submitBankTransferProof({ bookingId, proofUrl: uploaded.publicUrl });
  if (!result.ok) {
    return Response.json({ error: result.reason }, { status: 409 });
  }

  return Response.json({ ok: true, proofUrl: uploaded.publicUrl });
}
