type Props = {
  className?: string;
  height?: number;
  showTagline?: boolean;
  showName?: boolean;
};

function textSize(height: number): { name: string; tagline: string } {
  if (height <= 32) {
    return { name: "text-[11px] sm:text-xs", tagline: "text-[9px] sm:text-[10px]" };
  }
  if (height >= 48) {
    return { name: "text-base sm:text-lg", tagline: "text-[11px] sm:text-xs" };
  }
  return { name: "text-[13px] sm:text-[15px]", tagline: "text-[10px] sm:text-[11px]" };
}

export function SiteLogo({
  className = "",
  height = 40,
  showTagline = true,
  showName = true,
}: Props) {
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
      {showName ? (
        <span className="min-w-0 leading-tight">
          <span
            className={`block font-logo font-bold uppercase tracking-[0.14em] text-ink ${sizes.name}`}
          >
            MS VACATIONS
          </span>
          {showTagline ? (
            <span
              className={`block font-logo font-normal tracking-[0.02em] text-muted ${sizes.tagline}`}
            >
              Home &amp; Apartments for Rent
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}
