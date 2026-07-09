import type { PropertyBadge, PropertyBadgeTone } from "@/lib/property-badges";

const toneClasses: Record<PropertyBadgeTone, string> = {
  ocean: "badge-ocean",
  accent: "badge-accent",
  neutral: "badge-neutral",
};

type Props = {
  badges: PropertyBadge[];
};

export function PropertyBadgeList({ badges }: Props) {
  if (badges.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-1.5">
      {badges.map((badge) => (
        <li key={badge.label} className={`badge ${toneClasses[badge.tone]}`}>
          {badge.label}
        </li>
      ))}
    </ul>
  );
}
