"use server";

import { revalidatePath } from "next/cache";
import { clearAdminSessionCookie, setAdminSessionCookie } from "@/lib/admin-auth";
import { verifyAdminPassword } from "@/lib/admin-login";

export type AdminLoginState = { error?: string; success?: boolean };

/** @deprecated Usar POST /api/admin/login desde el cliente. */
export async function adminLogin(
  _prev: AdminLoginState | undefined,
  formData: FormData,
): Promise<AdminLoginState> {
  const result = verifyAdminPassword(formData.get("password"));
  if (!result.ok) return { error: result.error };
  await setAdminSessionCookie();
  revalidatePath("/admin");
  revalidatePath("/admin/configuracion");
  revalidatePath("/admin/dev");
  return { success: true };
}

/** @deprecated Usar POST /api/admin/logout desde el cliente. */
export async function adminLogout(): Promise<void> {
  await clearAdminSessionCookie();
  revalidatePath("/admin");
  revalidatePath("/admin/configuracion");
  revalidatePath("/admin/dev");
}
