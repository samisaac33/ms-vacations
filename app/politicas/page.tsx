import type { Metadata } from "next";
import Link from "next/link";
import { LegalBusinessNotice } from "@/components/legal-business-notice";
import { PageHeader } from "@/components/page-header";
import { LEGAL_POLICIES, getLegalPoliciesMeta } from "@/lib/legal/policies";
import { siteConfig } from "@/lib/site";

const meta = getLegalPoliciesMeta();

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  robots: { index: true, follow: true },
};

export default function PoliticasPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <PageHeader
        title={meta.title}
        subtitle="Documentos legales aplicables a reservas directas en MS Vacations."
        breadcrumbs={[{ label: siteConfig.name, href: "/" }, { label: meta.title }]}
      />

      <LegalBusinessNotice />

      <ul className="mt-8 space-y-4">
        {LEGAL_POLICIES.map((policy) => (
          <li key={policy.href}>
            <Link
              href={policy.href}
              className="block rounded-2xl border border-sand-dark bg-white p-5 transition-colors hover:border-ocean/40 hover:bg-ocean-light/20"
            >
              <h2 className="font-display text-lg font-semibold text-ink">{policy.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{policy.description}</p>
              <span className="mt-3 inline-block text-sm font-medium text-ocean">Leer documento →</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
