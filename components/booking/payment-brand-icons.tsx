import { LuCreditCard } from "react-icons/lu";
import {
  SiAmericanexpress,
  SiDinersclub,
  SiDiscover,
  SiMastercard,
  SiPaypal,
  SiVisa,
} from "react-icons/si";

export function ProdubancoIcon({ className }: { className?: string }) {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden
      className={className}
    >
      <rect width="28" height="28" rx="4" fill="#006B3F" />
      <path
        d="M6 20V10.5L14 6l8 4.5V20H6z"
        fill="white"
        fillOpacity="0.95"
      />
      <path d="M11 20v-5.5h6V20" fill="#006B3F" />
      <path
        d="M9.5 12.5h9M9.5 15h6"
        stroke="#006B3F"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CreditCardIcon({ className }: { className?: string }) {
  return (
    <LuCreditCard
      aria-hidden
      className={`h-7 w-7 text-ink ${className ?? ""}`}
      strokeWidth={1.75}
    />
  );
}

export function PayPalLogoIcon({ className }: { className?: string }) {
  return (
    <SiPaypal
      aria-hidden
      className={`h-7 w-auto text-[#003087] ${className ?? ""}`}
    />
  );
}

const CARD_NETWORK_ICON_CLASS = "h-3.5 w-auto shrink-0";

export function CardNetworkLogos({ className }: { className?: string }) {
  return (
    <span className={`flex flex-wrap items-center gap-2 ${className ?? ""}`} aria-hidden>
      <SiVisa className={`${CARD_NETWORK_ICON_CLASS} text-[#1A1F71]`} />
      <SiMastercard className={`${CARD_NETWORK_ICON_CLASS} text-[#EB001B]`} />
      <SiAmericanexpress className={`${CARD_NETWORK_ICON_CLASS} text-[#2E77BC]`} />
      <SiDiscover className={`${CARD_NETWORK_ICON_CLASS} text-[#F47216]`} />
      <SiDinersclub className={`${CARD_NETWORK_ICON_CLASS} text-[#0079BE]`} />
    </span>
  );
}
