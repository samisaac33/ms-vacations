"use server";

import { revalidatePath } from "next/cache";
import {
  clearAdminSessionCookie,
  setAdminSessionCookie,
} from "@/lib/admin-auth";

export type AdminLoginState = { error?: string; success?: boolean };

export async function adminLogin(
  _prev: AdminLoginState | undefined,
  formData: FormData,
): Promise<AdminLoginState> {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    return { error: "El acceso al panel no está disponible. Contacta al soporte técnico." };
  }
  const password = formData.get("password");
  if (typeof password !== "string" || password !== secret) {
    return { error: "Contraseña incorrecta." };
  }
  await setAdminSessionCookie();
  revalidatePath("/admin");
  revalidatePath("/admin/configuracion");
  revalidatePath("/admin/dev");
  return { success: true };
}

export async function adminLogout(): Promise<void> {
  await clearAdminSessionCookie();
  revalidatePath("/admin");
  revalidatePath("/admin/configuracion");
  revalidatePath("/admin/dev");
}
