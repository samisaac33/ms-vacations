import type { Metadata } from "next";
import { LegalBusinessNotice } from "@/components/legal-business-notice";
import { LegalDocument } from "@/components/legal-document";
import { LegalNav } from "@/components/legal-nav";
import { PageHeader } from "@/components/page-header";
import { getLegalContactInfo } from "@/lib/legal/contact-info";
import { getPrivacyPolicyMeta, getPrivacyPolicySections } from "@/lib/legal/privacy-policy";
import { getLegalPoliciesMeta } from "@/lib/legal/policies";
import { siteConfig } from "@/lib/site";

const meta = getPrivacyPolicyMeta();
const policiesMeta = getLegalPoliciesMeta();

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: meta.description,
  robots: { index: true, follow: true },
};

export default function PrivacidadPage() {
  const info = getLegalContactInfo();
  const sections = getPrivacyPolicySections(info);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <PageHeader
        title="Política de privacidad"
        breadcrumbs={[
          { label: siteConfig.name, href: "/" },
          { label: policiesMeta.title, href: policiesMeta.path },
          { label: "Privacidad" },
        ]}
      />
      <LegalBusinessNotice />
      <LegalDocument
        lastUpdated={meta.lastUpdated}
        intro="Cómo MS Vacations trata los datos personales cuando reservas directamente en este sitio web."
        sections={sections}
      />
      <LegalNav currentPath="/privacidad" />
    </div>
  );
}
