/** Categorías para alt text y agrupación del recorrido fotográfico. */
export const PROPERTY_IMAGE_CATEGORIES = [
  { value: "exterior", label: "Exterior" },
  { value: "piscina", label: "Piscina" },
  { value: "sala", label: "Sala" },
  { value: "comedor", label: "Comedor" },
  { value: "cocina", label: "Cocina completa" },
  { value: "bar", label: "Bar" },
  { value: "interior", label: "Interior" },
  { value: "balcon", label: "Balcón" },
  { value: "rooftop", label: "Rooftop" },
  { value: "garaje", label: "Garaje" },
  { value: "bano-social", label: "Baño social" },
  { value: "bbq", label: "Zona BBQ" },
  { value: "habitacion-1", label: "Habitación 1" },
  { value: "habitacion-2", label: "Habitación 2" },
  { value: "habitacion-3", label: "Habitación 3" },
  { value: "habitacion-4", label: "Habitación 4" },
  { value: "habitacion-5", label: "Habitación 5" },
  { value: "adicional", label: "Vista adicional" },
  { value: "otro", label: "Otra" },
] as const;

export type PropertyImageCategory = (typeof PROPERTY_IMAGE_CATEGORIES)[number]["value"];

export const PROPERTY_IMAGE_CATEGORY_VALUES = new Set<PropertyImageCategory>(
  PROPERTY_IMAGE_CATEGORIES.map((c) => c.value),
);

export function isPropertyImageCategory(value: string): value is PropertyImageCategory {
  return PROPERTY_IMAGE_CATEGORY_VALUES.has(value as PropertyImageCategory);
}

export function categoryLabelForValue(category: PropertyImageCategory): string {
  return PROPERTY_IMAGE_CATEGORIES.find((c) => c.value === category)?.label ?? category;
}

export function categoryToAltSuffix(category: PropertyImageCategory, customLabel?: string): string {
  if (category === "otro" && customLabel?.trim()) {
    return customLabel.trim();
  }
  const found = PROPERTY_IMAGE_CATEGORIES.find((c) => c.value === category);
  if (!found) return "vista adicional";
  if (category.startsWith("habitacion-")) {
    const num = category.replace("habitacion-", "");
    return `habitación ${num}`;
  }
  if (category === "bano-social") return "baño social";
  if (category === "bbq") return "zona BBQ";
  if (category === "adicional") return "vista adicional";
  if (category === "balcon") return "balcón";
  return found.label.toLowerCase();
}

export function buildPropertyImageAlt(propertyName: string, category: PropertyImageCategory, customLabel?: string): string {
  return `${propertyName} — ${categoryToAltSuffix(category, customLabel)}`;
}

/** Etiqueta legible para admin a partir del alt guardado en BD. */
export function displayCategoryLabelFromAlt(propertyName: string, alt: string): string {
  const inferred = inferPropertyImageCategoryFromAlt(propertyName, alt);
  if (!inferred) return alt;
  if (inferred.category === "otro" && inferred.customLabel.trim()) {
    return inferred.customLabel.trim();
  }
  return categoryLabelForValue(inferred.category);
}

/**
 * Deduce categoría (y etiqueta custom si es «Otra») desde el alt de una foto existente.
 */
export function inferPropertyImageCategoryFromAlt(
  propertyName: string,
  alt: string,
): { category: PropertyImageCategory; customLabel: string } | null {
  const prefix = `${propertyName} — `;
  if (!alt.startsWith(prefix)) return null;
  const suffix = alt.slice(prefix.length).trim();
  const suffixLower = suffix.toLowerCase();

  const bedroomBano = suffix.match(/^habitación\s+(\d+)\s+—\s+baño$/i);
  if (bedroomBano) {
    const num = bedroomBano[1];
    if (num && isPropertyImageCategory(`habitacion-${num}`)) {
      return { category: `habitacion-${num}` as PropertyImageCategory, customLabel: "" };
    }
  }

  const bedroom = suffix.match(/^habitación\s+(\d+)$/i);
  if (bedroom?.[1] && isPropertyImageCategory(`habitacion-${bedroom[1]}`)) {
    return { category: `habitacion-${bedroom[1]}` as PropertyImageCategory, customLabel: "" };
  }

  for (const entry of PROPERTY_IMAGE_CATEGORIES) {
    if (entry.value === "otro") continue;
    if (categoryToAltSuffix(entry.value).toLowerCase() === suffixLower) {
      return { category: entry.value, customLabel: "" };
    }
  }

  if (suffixLower === "otra") {
    return { category: "otro", customLabel: "" };
  }

  return { category: "otro", customLabel: suffix };
}

export function nextStorageFileName(
  existingPaths: string[],
  prefix: string,
  category: PropertyImageCategory,
): string {
  const base =
    category === "otro"
      ? "adicional"
      : category.startsWith("habitacion-")
        ? category
        : category === "bano-social"
          ? "bano-social"
          : category === "bbq"
            ? "bbq"
            : category;

  const pattern = new RegExp(`^${prefix}/${base.replace(/-/g, "\\-")}-(\\d+)\\.webp$`);
  let max = 0;
  for (const path of existingPaths) {
    const m = path.match(pattern);
    if (m) max = Math.max(max, Number.parseInt(m[1]!, 10));
  }
  return `${base}-${String(max + 1).padStart(2, "0")}.webp`;
}
