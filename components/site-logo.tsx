type Props = {
  className?: string;
  height?: number;
  showTagline?: boolean;
};

function textSize(height: number): { name: string; tagline: string } {
  if (height <= 32) {
    return { name: "text-xs sm:text-sm", tagline: "text-[9px] sm:text-[10px]" };
  }
  return { name: "text-sm sm:text-base", tagline: "text-[10px] sm:text-[11px]" };
}

export function SiteLogo({ className = "", height = 40, showTagline = true }: Props) {
  const sizes = textSize(height);

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-mark.svg"
        alt=""
        aria-hidden
        height={height}
        style={{ height, width: "auto", maxHeight: height }}
        className="block shrink-0 object-contain"
      />
      <span className="min-w-0 leading-tight">
        <span
          className={`block font-display font-semibold tracking-wide text-ink ${sizes.name}`}
        >
          MS VACATIONS
        </span>
        {showTagline ? (
          <span className={`block font-medium tracking-wide text-muted ${sizes.tagline}`}>
            Home &amp; Apartments for Rent
          </span>
        ) : null}
      </span>
    </span>
  );
}
