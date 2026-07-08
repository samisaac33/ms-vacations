import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal-document";
import { PageHeader } from "@/components/page-header";
import { getTermsOfServiceMeta, getTermsOfServiceSections } from "@/lib/legal/terms-of-service";
import { siteConfig } from "@/lib/site";

const meta = getTermsOfServiceMeta();

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description: meta.description,
  robots: { index: false, follow: false },
};

export default function TerminosPage() {
  const sections = getTermsOfServiceSections({
    siteName: siteConfig.name,
    siteUrl: siteConfig.url,
    contactEmail: siteConfig.contact.email,
    contactWhatsapp: siteConfig.contact.whatsapp,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <PageHeader title="Términos y condiciones" />
      <LegalDocument
        lastUpdated={meta.lastUpdated}
        intro="Condiciones generales para usar el sitio web de MS Vacations y contratar alojamiento vacacional de forma directa en Manabí (costa y Portoviejo)."
        sections={sections}
      />
    </div>
  );
}
