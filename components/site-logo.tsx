type Props = {
  className?: string;
  size?: number;
};

export function SiteLogoMark({ className = "", size = 36 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className={className}
    >
      <rect width="32" height="32" rx="8" fill="currentColor" className="text-ocean" />
      <path
        d="M4 22c3-2 5-2 8 0s5 2 8 0 5-2 8 0"
        stroke="#E6F4F6"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M4 26c3-2 5-2 8 0s5 2 8 0 5-2 8 0"
        stroke="#FAF7F2"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.75"
      />
      <circle cx="24" cy="9" r="3" fill="#E8A838" />
    </svg>
  );
}
