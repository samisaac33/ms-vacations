/** Carpeta en storage ({prefix}/) por slug de propiedad. */
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

const SUPABASE_PUBLIC_MARKER = "/storage/v1/object/public/MS_VACATIONS/";

export function getPropertyStoragePrefix(slug: string): string | undefined {
  return PROPERTY_STORAGE_PREFIX[slug];
}

/** Extrae `{prefix}/{file}.webp` desde una URL pública (Supabase legacy o R2). */
export function parseStoragePathFromPublicUrl(src: string): string | null {
  const supabaseIdx = src.indexOf(SUPABASE_PUBLIC_MARKER);
  if (supabaseIdx !== -1) {
    try {
      return decodeURIComponent(src.slice(supabaseIdx + SUPABASE_PUBLIC_MARKER.length));
    } catch {
      return null;
    }
  }

  try {
    const url = new URL(src);
    const path = url.pathname.replace(/^\/+/, "");
    if (!path || path.includes("..")) return null;
    return decodeURIComponent(path);
  } catch {
    return null;
  }
}

export function isSupabasePropertyImageUrl(src: string): boolean {
  return src.includes(SUPABASE_PUBLIC_MARKER);
}
