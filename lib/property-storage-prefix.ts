/** Carpeta en Supabase Storage (MS_VACATIONS/{prefix}/) por slug de propiedad. */
export const PROPERTY_STORAGE_PREFIX: Record<string, string> = {
  "alojamiento-en-arrecife": "arrecife",
  "casa-vacacional-home-one-18-personas-max": "home-one",
  "casa-vacacional-home-two-21-personas": "home-two",
  "casa-rustica-18-personas-max": "rustic-house",
  "home-luxury-la-punta-18-personas-max": "home-luxury-la-punta",
  "villa-palmera": "villa-palmera",
  "porto-norte": "porto-norte",
  "las-hamacas-portoviejo": "las-hamacas",
  "los-pinos-portoviejo": "los-pinos",
  "container-stay-1-san-clemente": "container-stay-1",
  "container-stay-2-san-clemente": "container-stay-2",
};

export function getPropertyStoragePrefix(slug: string): string | undefined {
  return PROPERTY_STORAGE_PREFIX[slug];
}

export function parseStoragePathFromPublicUrl(src: string): string | null {
  const marker = "/storage/v1/object/public/MS_VACATIONS/";
  const idx = src.indexOf(marker);
  if (idx === -1) return null;
  try {
    return decodeURIComponent(src.slice(idx + marker.length));
  } catch {
    return null;
  }
}
