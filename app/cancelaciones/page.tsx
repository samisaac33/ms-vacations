import type { Metadata } from "next";
import { LegalBusinessNotice } from "@/components/legal-business-notice";
import { LegalDocument } from "@/components/legal-document";
import { LegalNav } from "@/components/legal-nav";
import { PageHeader } from "@/components/page-header";
import { getLegalContactInfo } from "@/lib/legal/contact-info";
import {
  getCancellationPolicyMeta,
  getCancellationPolicySections,
} from "@/lib/legal/cancellation-policy";
import { getLegalPoliciesMeta } from "@/lib/legal/policies";
import { siteConfig } from "@/lib/site";

const meta = getCancellationPolicyMeta();
const policiesMeta = getLegalPoliciesMeta();

export const metadata: Metadata = {
  title: "Cancelaciones, cambios y devoluciones",
  description: meta.description,
  robots: { index: true, follow: true },
};

export default function CancelacionesPage() {
  const info = getLegalContactInfo();
  const sections = getCancellationPolicySections(info);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <PageHeader
        title="Política de cancelaciones, cambios y devoluciones"
        breadcrumbs={[
          { label: siteConfig.name, href: "/" },
          { label: policiesMeta.title, href: policiesMeta.path },
          { label: "Cancelaciones" },
        ]}
      />
      <LegalBusinessNotice />
      <LegalDocument
        lastUpdated={meta.lastUpdated}
        intro="Condiciones de cancelación, modificación de fechas y reembolso para reservas directas pagadas en este sitio. Política Moderate, alineada con el estándar de Airbnb para estancias de hasta 27 noches."
        sections={sections}
      />
      <LegalNav currentPath="/cancelaciones" />
    </div>
  );
}
