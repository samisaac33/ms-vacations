type AmenityIconProps = { className?: string };

function WifiIcon({ className = "h-6 w-6" }: AmenityIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2 8.5C7.5 4 16.5 4 22 8.5M5.5 12c4-3 9.5-3 13.5 0M9 15.5c2-1.5 4.5-1.5 6.5 0M12 19a1 1 0 100-2 1 1 0 000 2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function KitchenIcon({ className = "h-6 w-6" }: AmenityIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 3v6M10 3v6M6 6h4M14 3v18M18 3v6M18 6h2v15H4V9h2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PoolIcon({ className = "h-6 w-6" }: AmenityIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 14c2 2 4 2 6 0s4-2 6 0 4 2 6 0M4 18c2 2 4 2 6 0s4-2 6 0 4 2 6 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ParkingIcon({ className = "h-6 w-6" }: AmenityIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M9 17V7h4a2.5 2.5 0 010 5H9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DefaultIcon({ className = "h-6 w-6" }: AmenityIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function amenityIcon(label: string) {
  const lower = label.toLowerCase();
  if (lower.includes("wi") || lower.includes("wifi")) return WifiIcon;
  if (lower.includes("cocina")) return KitchenIcon;
  if (lower.includes("piscina")) return PoolIcon;
  if (lower.includes("estacionamiento") || lower.includes("parqueadero")) return ParkingIcon;
  return DefaultIcon;
}

type Props = {
  amenities: string[];
};

export function PropertyAmenitiesList({ amenities }: Props) {
  if (amenities.length === 0) return null;

  return (
    <section>
      <h2 className="text-xl font-semibold text-ink">Lo que este lugar ofrece</h2>
      <ul className="mt-4 space-y-4">
        {amenities.map((amenity) => {
          const Icon = amenityIcon(amenity);
          return (
            <li key={amenity} className="flex items-start gap-4">
              <span className="mt-0.5 shrink-0 text-ink">
                <Icon />
              </span>
              <span className="text-base text-ink">{amenity}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
