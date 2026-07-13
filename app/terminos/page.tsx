import type { Metadata } from "next";
import { LegalBusinessNotice } from "@/components/legal-business-notice";
import { LegalDocument } from "@/components/legal-document";
import { LegalNav } from "@/components/legal-nav";
import { PageHeader } from "@/components/page-header";
import { getLegalContactInfo } from "@/lib/legal/contact-info";
import { getTermsOfServiceMeta, getTermsOfServiceSections } from "@/lib/legal/terms-of-service";
import { getLegalPoliciesMeta } from "@/lib/legal/policies";
import { siteConfig } from "@/lib/site";

const meta = getTermsOfServiceMeta();
const policiesMeta = getLegalPoliciesMeta();

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description: meta.description,
  robots: { index: true, follow: true },
};

export default function TerminosPage() {
  const info = getLegalContactInfo();
  const sections = getTermsOfServiceSections(info);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <PageHeader
        title="Términos y condiciones de compra"
        breadcrumbs={[
          { label: siteConfig.name, href: "/" },
          { label: policiesMeta.title, href: policiesMeta.path },
          { label: "Términos" },
        ]}
      />
      <LegalBusinessNotice />
      <LegalDocument
        lastUpdated={meta.lastUpdated}
        intro="Condiciones generales para usar el sitio web de MS Vacations y contratar alojamiento vacacional de forma directa en Manabí (costa y Portoviejo)."
        sections={sections}
      />
      <LegalNav currentPath="/terminos" />
    </div>
  );
}
