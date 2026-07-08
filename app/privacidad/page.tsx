import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal-document";
import { PageHeader } from "@/components/page-header";
import { getPrivacyPolicyMeta, getPrivacyPolicySections } from "@/lib/legal/privacy-policy";
import { siteConfig } from "@/lib/site";

const meta = getPrivacyPolicyMeta();

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: meta.description,
  robots: { index: false, follow: false },
};

export default function PrivacidadPage() {
  const sections = getPrivacyPolicySections({
    siteName: siteConfig.name,
    siteUrl: siteConfig.url,
    contactEmail: siteConfig.contact.email,
    contactWhatsapp: siteConfig.contact.whatsapp,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <PageHeader title="Política de privacidad" />
      <LegalDocument
        lastUpdated={meta.lastUpdated}
        intro="Cómo MS Vacations trata los datos personales cuando reservas directamente en este sitio web."
        sections={sections}
      />
    </div>
  );
}
