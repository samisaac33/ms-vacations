import type { PaymentMethod } from "@/lib/payments/types";

export function PaymentMethodIcon({
  method,
  className,
}: {
  method: PaymentMethod;
  className?: string;
}) {
  if (method === "bank_transfer") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
        <path
          d="M3 10.5L12 4l9 6.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9.5z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    );
  }
  if (method === "payphone") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
        <rect x="2" y="5" width="20" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.75" />
        <path d="M2 10h20" stroke="currentColor" strokeWidth="1.75" />
        <path d="M6 15h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M7.5 7.5h9c1.38 0 2.5 1.12 2.5 2.5v4c0 1.38-1.12 2.5-2.5 2.5h-9C6.12 16.5 5 15.38 5 14v-4c0-1.38 1.12-2.5 2.5-2.5z"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M8.5 10.5c0-1.1.9-2 2-2h3c1.1 0 2 .9 2 2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <text
        x="12"
        y="14.5"
        textAnchor="middle"
        fill="currentColor"
        fontSize="7"
        fontWeight="700"
        fontFamily="sans-serif"
      >
        P
      </text>
    </svg>
  );
}
