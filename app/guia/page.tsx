import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { DestinationPropertySection } from "@/components/destination-property-section";
import { TourismGuideContent, TourismGuideNav } from "@/components/tourism-guide-content";
import { Button } from "@/components/ui/button";
import { getCatalogGroupedWithDbPrices } from "@/lib/property-db";
import { siteConfig } from "@/lib/site";
import {
  getTourismGuideFaqs,
  getTourismGuideMeta,
  getTourismGuideSections,
  TOURISM_GUIDE_PATH,
} from "@/lib/tourism-guide";

const meta = getTourismGuideMeta();
const sections = getTourismGuideSections();
const faqs = getTourismGuideFaqs();

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  openGraph: {
    title: `${meta.title} | ${siteConfig.name}`,
    description: meta.description,
    locale: siteConfig.locale,
    type: "article",
  },
  alternates: {
    canonical: TOURISM_GUIDE_PATH,
  },
};

function guideJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: "San Clemente",
    description: meta.description,
    containedInPlace: {
      "@type": "AdministrativeArea",
      name: "Manabí, Ecuador",
    },
    touristType: ["Familias", "Grupos", "Turismo de playa"],
  };
}

export default async function GuiaTuristicaPage() {
  const { beach, city } = await getCatalogGroupedWithDbPrices();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(guideJsonLd()) }}
      />

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <PageHeader
          title={meta.title}
          subtitle="Guía práctica de San Clemente: playas, actividades y recomendaciones para planear tu viaje a la costa de Manabí."
        />

        <p className="mt-6 rounded-lg border border-sand-dark bg-sand/50 px-4 py-3 text-sm text-muted">
          {siteConfig.copy.guideCityNote}{" "}
          <Link
            href={`${siteConfig.copy.catalogPath}#ciudad`}
            className="font-medium text-ocean hover:underline"
          >
            {siteConfig.copy.guideCityLink}
          </Link>
        </p>

        <TourismGuideNav sections={sections} />
        <TourismGuideContent sections={sections} faqs={faqs} />
      </div>

      <section className="section-alt mt-16 border-t border-sand-dark py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <DestinationPropertySection
            id="playa"
            heading={`Dónde hospedarte en ${siteConfig.destinations.beach.area}`}
            subtitle={siteConfig.destinations.beach.subtitle}
            properties={beach}
            showDiscountNote
          />

          {city.length > 0 ? (
            <div className="mt-16">
              <DestinationPropertySection
                id="ciudad"
                heading={`Alojamientos en ${siteConfig.destinations.city.area}`}
                subtitle={siteConfig.destinations.city.subtitle}
                properties={city}
                showDiscountNote
              />
            </div>
          ) : null}

          <Button href={siteConfig.copy.catalogPath} className="mt-10">
            {siteConfig.copy.heroCta}
          </Button>
        </div>
      </section>
    </>
  );
}
