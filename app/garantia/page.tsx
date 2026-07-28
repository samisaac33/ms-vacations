import type { Metadata } from "next";
import { LegalBusinessNotice } from "@/components/legal-business-notice";
import { LegalDocument } from "@/components/legal-document";
import { LegalNav } from "@/components/legal-nav";
import { PageHeader } from "@/components/page-header";
import { getLegalContactInfo } from "@/lib/legal/contact-info";
import { getLegalPoliciesMeta } from "@/lib/legal/policies";
import {
  getRefundableGuaranteePolicyMeta,
  getRefundableGuaranteePolicySections,
} from "@/lib/legal/refundable-guarantee-policy";
import { siteConfig } from "@/lib/site";

const meta = getRefundableGuaranteePolicyMeta();
const policiesMeta = getLegalPoliciesMeta();

export const metadata: Metadata = {
  title: "Garantía reembolsable",
  description: meta.description,
  robots: { index: true, follow: true },
};

export default function GarantiaPage() {
  const info = getLegalContactInfo();
  const sections = getRefundableGuaranteePolicySections(info);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <PageHeader
        title="Política de garantía reembolsable"
        breadcrumbs={[
          { label: siteConfig.name, href: "/" },
          { label: policiesMeta.title, href: policiesMeta.path },
          { label: "Garantía reembolsable" },
        ]}
      />
      <LegalBusinessNotice />
      <LegalDocument
        lastUpdated={meta.lastUpdated}
        intro="Garantía reembolsable de USD 300 para reservas directas: inspección post check-out, condiciones de devolución y descuentos por daños."
        sections={sections}
      />
      <LegalNav currentPath="/garantia" />
    </div>
  );
}
