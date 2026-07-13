import { getBusinessInfo } from "@/lib/legal/business";
import { siteConfig } from "@/lib/site";
import type { LegalContactInfo } from "@/lib/legal/types";

export function getLegalContactInfo(): LegalContactInfo {
  const business = getBusinessInfo();
  return {
    siteName: siteConfig.name,
    siteUrl: siteConfig.url,
    contactEmail: siteConfig.contact.email,
    contactWhatsapp: siteConfig.contact.whatsapp,
    legalName: business.legalName,
    ruc: business.ruc,
    address: business.address,
    province: business.province,
    country: business.country,
    tourismRegistry: business.tourismRegistry,
  };
}

export function formatLegalEntityBlock(info: LegalContactInfo): string {
  const lines = [info.legalName];
  if (info.ruc) lines.push(`RUC: ${info.ruc}`);
  lines.push(`${info.address}, ${info.province}, ${info.country}`);
  if (info.tourismRegistry) lines.push(`Registro de turismo: ${info.tourismRegistry}`);
  return lines.join(". ");
}
