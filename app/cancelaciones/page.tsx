import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal-document";
import { PageHeader } from "@/components/page-header";
import {
  getCancellationPolicyMeta,
  getCancellationPolicySections,
} from "@/lib/legal/cancellation-policy";
import { siteConfig } from "@/lib/site";

const meta = getCancellationPolicyMeta();

export const metadata: Metadata = {
  title: "Política de cancelaciones",
  description: meta.description,
  robots: { index: false, follow: false },
};

export default function CancelacionesPage() {
  const sections = getCancellationPolicySections({
    siteName: siteConfig.name,
    siteUrl: siteConfig.url,
    contactEmail: siteConfig.contact.email,
    contactWhatsapp: siteConfig.contact.whatsapp,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <PageHeader title="Política de cancelaciones" />
      <LegalDocument
        lastUpdated={meta.lastUpdated}
        intro="Condiciones de cancelación y reembolso para reservas directas pagadas en este sitio. Política Moderate, alineada con el estándar de Airbnb para estancias de hasta 27 noches."
        sections={sections}
      />
    </div>
  );
}
