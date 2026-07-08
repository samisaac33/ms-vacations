import { PropertyCard } from "@/components/properties/PropertyCard";
import type { DestinationId } from "@/lib/catalog";
import { getPropertiesByDestination } from "@/lib/catalog";

interface PropertySectionProps {
  id: DestinationId;
  title: string;
  description: string;
  eyebrow: string;
}

export function PropertySection({
  id,
  title,
  description,
  eyebrow,
}: PropertySectionProps) {
  const sectionProperties = getPropertiesByDestination(id);

  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-24">
      <div className="mb-8 max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          {eyebrow}
        </p>
        <h2
          id={`${id}-heading`}
          className="font-display mt-2 text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
        >
          {title}
        </h2>
        <p className="mt-3 text-muted">{description}</p>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {sectionProperties.map((property, index) => (
          <div
            key={property.id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <PropertyCard property={property} />
          </div>
        ))}
      </div>
    </section>
  );
}
