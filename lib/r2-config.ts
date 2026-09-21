const DEFAULT_BUCKET = "ms-vacations";

export function getR2AccountId(): string | undefined {
  return process.env.R2_ACCOUNT_ID;
}

export function getR2BucketName(): string {
  return process.env.R2_BUCKET_NAME ?? DEFAULT_BUCKET;
}

export function getR2PublicUrlBase(): string | undefined {
  const raw = process.env.R2_PUBLIC_URL?.trim();
  if (!raw) return undefined;
  return raw.replace(/\/+$/, "");
}

export function isR2Configured(): boolean {
  return Boolean(
    getR2AccountId() &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      getR2PublicUrlBase(),
  );
}

/** URL pública de una foto de propiedad en R2 (misma ruta que en Supabase: `{prefix}/{file}.webp`). */
export function propertyImagePublicUrl(storagePath: string): string {
  const base = getR2PublicUrlBase();
  if (!base) {
    throw new Error("R2_PUBLIC_URL no está configurada.");
  }
  const encoded = storagePath
    .split("/")
    .map(encodeURIComponent)
    .join("/");
  return `${base}/${encoded}`;
}
