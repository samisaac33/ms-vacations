import { isR2Configured } from "@/lib/r2-config";

/** Fotos de propiedades (Cloudflare R2). */
export function isPropertyImageStorageConfigured(): boolean {
  return isR2Configured();
}

/** Comprobantes de transferencia (Cloudflare R2). */
export function isPaymentProofStorageConfigured(): boolean {
  return isR2Configured();
}

/** @deprecated Use isPropertyImageStorageConfigured */
export function isStorageConfigured(): boolean {
  return isPropertyImageStorageConfigured();
}
