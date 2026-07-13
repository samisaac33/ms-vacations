import {
  CardNetworkLogos,
  CreditCardIcon,
  PayPalLogoIcon,
  ProdubancoIcon,
} from "@/components/booking/payment-brand-icons";
import { PAYMENT_OPTIONS } from "@/lib/payment-options";
import type { PaymentMethod } from "@/lib/payments/types";

type Props = {
  paymentMethod: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  disabled?: boolean;
  name?: string;
};

function PaymentMethodBrandIcon({ method }: { method: PaymentMethod }) {
  if (method === "bank_transfer") {
    return <ProdubancoIcon className="shrink-0" />;
  }
  if (method === "payphone") {
    return <CreditCardIcon className="shrink-0" />;
  }
  return <PayPalLogoIcon className="shrink-0" />;
}

function PaymentMethodSecondary({ method, subtitle }: { method: PaymentMethod; subtitle?: string }) {
  if (method === "payphone") {
    return <CardNetworkLogos className="mt-1.5" />;
  }
  if (subtitle) {
    return <span className="mt-0.5 block text-xs text-muted">{subtitle}</span>;
  }
  return null;
}

export function PaymentMethodList({
  paymentMethod,
  onChange,
  disabled = false,
  name = "paymentMethod",
}: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-sand-dark bg-white">
      {PAYMENT_OPTIONS.map((opt, index) => (
        <label
          key={opt.id}
          className={`flex cursor-pointer items-center gap-3 px-4 py-4 ${
            index > 0 ? "border-t border-sand-dark" : ""
          } ${disabled ? "pointer-events-none opacity-50" : ""}`}
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center">
            <PaymentMethodBrandIcon method={opt.id} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-ink">{opt.label}</span>
            <PaymentMethodSecondary method={opt.id} subtitle={opt.subtitle} />
          </span>
          <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
            <input
              type="radio"
              name={name}
              value={opt.id}
              checked={paymentMethod === opt.id}
              onChange={() => onChange(opt.id)}
              disabled={disabled}
              className="peer sr-only"
            />
            <span className="h-5 w-5 rounded-full border-2 border-ink/30 peer-checked:border-ink peer-focus-visible:ring-2 peer-focus-visible:ring-ocean/40" />
            <span className="pointer-events-none absolute h-2.5 w-2.5 scale-0 rounded-full bg-ink transition-transform peer-checked:scale-100" />
          </span>
        </label>
      ))}
    </div>
  );
}
