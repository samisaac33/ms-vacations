import type { PropertyBadge, PropertyBadgeTone } from "@/lib/property-badges";

const toneClasses: Record<PropertyBadgeTone, string> = {
  ocean: "badge-ocean",
  accent: "badge-accent",
  neutral: "badge-neutral",
};

type Props = {
  badges: PropertyBadge[];
};

function BadgeItems({
  badges,
  keyPrefix,
  hidden = false,
}: {
  badges: PropertyBadge[];
  keyPrefix: string;
  hidden?: boolean;
}) {
  return (
    <>
      {badges.map((badge) => (
        <li
          key={`${keyPrefix}-${badge.label}`}
          className={`badge shrink-0 ${toneClasses[badge.tone]}`}
          aria-hidden={hidden || undefined}
        >
          {badge.label}
        </li>
      ))}
    </>
  );
}

export function PropertyBadgeList({ badges }: Props) {
  if (badges.length === 0) return null;

  const useMarquee = badges.length >= 4;

  if (!useMarquee) {
    return (
      <ul className="-mx-1 flex max-w-full min-w-0 gap-1.5 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <BadgeItems badges={badges} keyPrefix="static" />
      </ul>
    );
  }

  return (
    <div
      className="badge-marquee-mask -mx-1 max-w-full min-w-0 overflow-hidden px-1 pb-0.5"
      aria-label="Comodidades destacadas"
    >
      <ul className="badge-marquee-track flex w-max gap-1.5 max-sm:w-full max-sm:overflow-x-auto max-sm:[animation:none] max-sm:[&_[aria-hidden=true]]:hidden max-sm:[scrollbar-width:none] max-sm:[&::-webkit-scrollbar]:hidden motion-reduce:overflow-x-auto motion-reduce:[scrollbar-width:none] motion-reduce:[&::-webkit-scrollbar]:hidden">
        <BadgeItems badges={badges} keyPrefix="a" />
        <BadgeItems badges={badges} keyPrefix="b" hidden />
      </ul>
    </div>
  );
}
