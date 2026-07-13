import type { Property } from "@/lib/properties";

type Props = {
  capacity: Property["capacity"];
};

export function PropertySummaryStats({ capacity }: Props) {
  const guestsLabel = capacity.guests === 1 ? "huésped" : "huéspedes";
  const bedroomsLabel = capacity.bedrooms === 1 ? "habitación" : "habitaciones";
  const bedsLabel = capacity.beds === 1 ? "cama" : "camas";
  const bathroomsLabel = capacity.bathrooms === 1 ? "baño" : "baños";

  return (
    <p className="mt-2 text-sm text-muted">
      {capacity.guests} {guestsLabel} · {capacity.bedrooms} {bedroomsLabel} · {capacity.beds}{" "}
      {bedsLabel} · {capacity.bathrooms} {bathroomsLabel}
    </p>
  );
}
