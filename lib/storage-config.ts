import { isR2Configured } from "@/lib/r2-config";

/** Fotos de propiedades (Cloudflare R2). */
export function isPropertyImageStorageConfigured(): boolean {
  return isR2Configured();
}

/** Comprobantes de transferencia (Supabase Storage). */
export function isPaymentProofStorageConfigured(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/** @deprecated Use isPropertyImageStorageConfigured */
export function isStorageConfigured(): boolean {
  return isPropertyImageStorageConfigured();
}
