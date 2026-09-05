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

function AcIcon({ className = "h-6 w-6" }: AmenityIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3v18M8 7l4-4 4 4M8 17l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TvIcon({ className = "h-6 w-6" }: AmenityIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 21h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function BeachIcon({ className = "h-6 w-6" }: AmenityIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 17c3-2 6-2 9 0s6 2 9 0M4 20h16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GrillIcon({ className = "h-6 w-6" }: AmenityIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 10h14v8H5zM8 10V6M12 10V6M16 10V6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SecurityIcon({ className = "h-6 w-6" }: AmenityIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3l7 4v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V7l7-4z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WasherIcon({ className = "h-6 w-6" }: AmenityIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function KeyIcon({ className = "h-6 w-6" }: AmenityIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 11l9 9M16 16l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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

export function AmenityIcon({ label, className = "h-6 w-6" }: { label: string; className?: string }) {
  const lower = label.toLowerCase();
  if (lower.includes("wi") || lower.includes("wifi") || lower.includes("internet")) {
    return <WifiIcon className={className} />;
  }
  if (lower.includes("cocina") || lower.includes("horno") || lower.includes("microondas")) {
    return <KitchenIcon className={className} />;
  }
  if (lower.includes("piscina")) return <PoolIcon className={className} />;
  if (lower.includes("estacionamiento") || lower.includes("parqueadero")) {
    return <ParkingIcon className={className} />;
  }
  if (lower.includes("aire acondicionado") || lower.includes("calefacción")) {
    return <AcIcon className={className} />;
  }
  if (lower.includes("televisor") || lower.includes("televisión") || lower.includes("tv")) {
    return <TvIcon className={className} />;
  }
  if (lower.includes("playa")) return <BeachIcon className={className} />;
  if (lower.includes("parrilla") || lower.includes("bbq") || lower.includes("parrillada")) {
    return <GrillIcon className={className} />;
  }
  if (lower.includes("cámara") || lower.includes("detector") || lower.includes("seguridad")) {
    return <SecurityIcon className={className} />;
  }
  if (lower.includes("lavadora") || lower.includes("secadora") || lower.includes("plancha")) {
    return <WasherIcon className={className} />;
  }
  if (lower.includes("ingreso") || lower.includes("llaves") || lower.includes("cerradura")) {
    return <KeyIcon className={className} />;
  }
  return <DefaultIcon className={className} />;
}
