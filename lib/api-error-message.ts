const SPLIT_SCHEMA_MARKERS = [
  "payment_timing",
  "deposit_cents",
  "balance_cents",
  "balance_due_at",
  "deposit_paid_at",
  "terms_accepted_at",
  "terms_version",
  "pending_balance",
] as const;

function isSplitSchemaError(msg: string): boolean {
  if (!msg.includes("does not exist")) return false;
  return SPLIT_SCHEMA_MARKERS.some((marker) => msg.includes(marker));
}

/** Mensaje legible para errores de API de reservas (sin filtrar datos sensibles). */
export function bookingApiErrorMessage(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);

  if (msg.includes('invalid input value for enum payment_method: "payphone"')) {
    return "PayPhone no está habilitado en la base de datos. Contacte al administrador.";
  }

  if (
    msg.includes('invalid input value for enum payment_timing: "split"') ||
    (msg.includes("payment_timing") && msg.includes("does not exist"))
  ) {
    return "El pago fraccionado no está habilitado en la base de datos. Contacte al administrador.";
  }

  if (isSplitSchemaError(msg)) {
    return "La base de datos necesita la migración de pago fraccionado. Contacte al administrador.";
  }

  if (msg.includes("does not exist") || msg.includes("42P01")) {
    return "La base de datos necesita actualizarse. Contacte al administrador.";
  }

  if (msg.includes("Precio referencia no definido") || msg.includes("Recargo de limpieza no definido")) {
    return "Precio no configurado para esta propiedad. Contacte al administrador.";
  }

  if (
    msg.includes("ECONNREFUSED") ||
    msg.includes("connection") ||
    msg.includes("timeout") ||
    msg.includes("ENOTFOUND")
  ) {
    return "No se pudo conectar con la base de datos. Intente de nuevo en unos minutos.";
  }

  if (msg.includes("prepared statement") || msg.includes("bind message")) {
    return "Error de conexión con la base de datos. Contacte al administrador.";
  }

  return "No se pudo completar la reserva. Intente de nuevo.";
}
