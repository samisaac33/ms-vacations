import { siteConfig } from "@/lib/site";

export type BusinessInfo = {
  tradeName: string;
  legalName: string;
  ruc: string;
  address: string;
  province: string;
  country: string;
  tourismRegistry?: string;
};

function optionalEnv(key: string): string | undefined {
  const v = process.env[key]?.trim();
  return v || undefined;
}

/** Datos del titular comercial; configurar en variables de entorno públicas. */
export function getBusinessInfo(): BusinessInfo {
  return {
    tradeName: siteConfig.name,
    legalName: optionalEnv("NEXT_PUBLIC_LEGAL_NAME") ?? siteConfig.name,
    ruc: optionalEnv("NEXT_PUBLIC_LEGAL_RUC") ?? "",
    address: optionalEnv("NEXT_PUBLIC_LEGAL_ADDRESS") ?? `${siteConfig.location.area}, Ecuador`,
    province: siteConfig.location.province,
    country: siteConfig.location.country,
    tourismRegistry: optionalEnv("NEXT_PUBLIC_TOURISM_REGISTRY"),
  };
}

export function formatBusinessIdentification(info: BusinessInfo): string {
  const parts = [info.legalName];
  if (info.ruc) parts.push(`RUC ${info.ruc}`);
  if (info.tourismRegistry) parts.push(`Registro turismo ${info.tourismRegistry}`);
  return parts.join(" · ");
}
