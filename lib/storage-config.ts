/** Comprobación ligera sin cargar sharp ni el resto del módulo de storage. */
export function isStorageConfigured(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}
