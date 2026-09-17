/** Mensaje legible para errores de API de reservas (sin filtrar datos sensibles). */
export function bookingApiErrorMessage(error: unknown): string {
  const msg = error instanceof Error ? error.message : String(error);

  if (msg.includes('invalid input value for enum payment_method: "payphone"')) {
    return "PayPhone no está habilitado en la base de datos. Contacte al administrador.";
  }

  if (msg.includes("does not exist") || msg.includes("42P01")) {
    return "La base de datos necesita actualizarse. Contacte al administrador.";
  }

  if (msg.includes("Precio referencia no definido") || msg.includes("Recargo de limpieza no definido")) {
    return "Precio no configurado para esta propiedad. Contacte al administrador.";
  }

  if (msg.includes("ECONNREFUSED") || msg.includes("connection") || msg.includes("timeout")) {
    return "No se pudo conectar con la base de datos. Intente de nuevo en unos minutos.";
  }

  return "No se pudo completar la reserva. Intente de nuevo.";
}
