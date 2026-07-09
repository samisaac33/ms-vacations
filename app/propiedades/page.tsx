import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { HomeDestinationNav } from "@/components/home-destination-nav";
import { DestinationPropertySection } from "@/components/destination-property-section";
import { StaySearchBanner } from "@/components/stay-search-banner";
import { getCatalogGroupedWithDbPrices } from "@/lib/property-db";
import { siteConfig } from "@/lib/site";
import {
  buildStaySearchQuery,
  parseStaySearchFromParams,
  validateStaySearch,
  type StaySearch,
} from "@/lib/stay-search";

export const metadata: Metadata = {
  title: siteConfig.copy.catalogTitle,
  description: siteConfig.description,
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function resolveStaySearch(
  params: Record<string, string | string[] | undefined>,
): { search: StaySearch | null; stayQuery: string } {
  const parsed = parseStaySearchFromParams(params);
  if (!parsed?.checkIn || !parsed.checkOut || !parsed.destino) {
    return { search: null, stayQuery: "" };
  }

  const huespedes = parsed.huespedes ?? 2;
  const error = validateStaySearch(parsed.checkIn, parsed.checkOut);
  if (error) return { search: null, stayQuery: "" };

  const search: StaySearch = {
    destino: parsed.destino,
    checkIn: parsed.checkIn,
    checkOut: parsed.checkOut,
    huespedes,
  };

  return {
    search,
    stayQuery: buildStaySearchQuery(search),
  };
}

export default async function PropiedadesPage({ searchParams }: Props) {
  const params = await searchParams;
  const { beach, city } = await getCatalogGroupedWithDbPrices();
  const { search, stayQuery } = resolveStaySearch(params);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <PageHeader
        title={siteConfig.copy.catalogTitle}
        subtitle={`${siteConfig.copy.catalogSubtitle} Precios de reserva directa en USD.`}
      />

      {search && <StaySearchBanner search={search} />}

      <div className="mt-10 space-y-10">
        <HomeDestinationNav />

        <div className="space-y-16">
          <DestinationPropertySection
            id="playa"
            heading={`${siteConfig.copy.featuredBeachHeading} — ${siteConfig.destinations.beach.area}`}
            subtitle={siteConfig.destinations.beach.subtitle}
            properties={beach}
            stayQuery={stayQuery}
          />

          <DestinationPropertySection
            id="ciudad"
            heading={`${siteConfig.copy.featuredCityHeading} — ${siteConfig.destinations.city.area}`}
            subtitle={siteConfig.destinations.city.subtitle}
            properties={city}
            stayQuery={stayQuery}
          />
        </div>
      </div>
    </div>
  );
}
