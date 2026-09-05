export type AdminLoginResult =
  | { ok: true }
  | { ok: false; error: string; status: 401 | 503 };

export function verifyAdminPassword(password: unknown): AdminLoginResult {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    return {
      ok: false,
      error: "El acceso al panel no está disponible. Contacta al soporte técnico.",
      status: 503,
    };
  }
  if (typeof password !== "string" || password !== secret) {
    return { ok: false, error: "Contraseña incorrecta.", status: 401 };
  }
  return { ok: true };
}
