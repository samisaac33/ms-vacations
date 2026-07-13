import {
  formatVatRatePercent,
  hospitalityVatRatePercentForDate,
} from "@/lib/legal/hospitality-vat";
import type { PaymentMethod } from "@/lib/payments/types";
import {
  BANK_TRANSFER_DISCOUNT_PERCENT,
  formatUsd,
  totalCentsForPaymentMethod,
  totalUsdForPaymentMethod,
} from "@/lib/pricing";
import type { StayQuote } from "@/lib/pricing-query";

export type PriceBreakdownLine = {
  label: string;
  amountCents: number;
  emphasis?: boolean;
  indent?: boolean;
};

export type StayPriceBreakdown = {
  nightly: {
    date: string;
    totalCents: number;
    baseCents: number;
    vatCents: number;
    vatRatePercent: number;
  }[];
  lines: PriceBreakdownLine[];
  subtotalBaseCents: number;
  vatByRate: { ratePercent: number; cents: number }[];
  totalBeforeDiscountCents: number;
  discountCents: number;
  totalCents: number;
  totalUsd: number;
  paymentMethod: PaymentMethod;
};

function vatFromInclusiveCents(totalCents: number, rate: number) {
  const baseCents = Math.round(totalCents / (1 + rate));
  const vatCents = totalCents - baseCents;
  return { baseCents, vatCents };
}

export function buildStayPriceBreakdown(
  quote: StayQuote,
  paymentMethod: PaymentMethod,
): StayPriceBreakdown {
  const nightly = quote.nightly.map((night) => {
    const ratePercent = hospitalityVatRatePercentForDate(night.date);
    const rate = ratePercent / 100;
    const { baseCents, vatCents } = vatFromInclusiveCents(night.directCents, rate);
    return {
      date: night.date,
      totalCents: night.directCents,
      baseCents,
      vatCents,
      vatRatePercent: ratePercent,
    };
  });

  const subtotalBaseCents = nightly.reduce((sum, n) => sum + n.baseCents, 0);
  const totalBeforeDiscountCents = quote.totalDirectCents;

  const vatMap = new Map<number, number>();
  for (const night of nightly) {
    vatMap.set(night.vatRatePercent, (vatMap.get(night.vatRatePercent) ?? 0) + night.vatCents);
  }
  const vatByRate = [...vatMap.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([ratePercent, cents]) => ({ ratePercent, cents }));

  const totalCents = totalCentsForPaymentMethod(quote.totalDirectCents, paymentMethod);
  const discountCents =
    paymentMethod === "bank_transfer" ? totalBeforeDiscountCents - totalCents : 0;

  const lines: PriceBreakdownLine[] = [];

  if (quote.nights > 1) {
    lines.push({
      label: `${quote.nights} noches`,
      amountCents: totalBeforeDiscountCents,
    });
  } else {
    lines.push({
      label: "1 noche",
      amountCents: totalBeforeDiscountCents,
    });
  }

  lines.push({
    label: "Subtotal sin IVA",
    amountCents: subtotalBaseCents,
    indent: true,
  });

  for (const { ratePercent, cents } of vatByRate) {
    lines.push({
      label: `IVA ${formatVatRatePercent(ratePercent)} %`,
      amountCents: cents,
      indent: true,
    });
  }

  lines.push({
    label: "Subtotal con IVA incluido",
    amountCents: totalBeforeDiscountCents,
  });

  if (discountCents > 0) {
    lines.push({
      label: `Descuento transferencia (−${BANK_TRANSFER_DISCOUNT_PERCENT} %)`,
      amountCents: -discountCents,
    });
  }

  lines.push({
    label: "Total a pagar",
    amountCents: totalCents,
    emphasis: true,
  });

  return {
    nightly,
    lines,
    subtotalBaseCents,
    vatByRate,
    totalBeforeDiscountCents,
    discountCents,
    totalCents,
    totalUsd: totalUsdForPaymentMethod(quote.totalDirectCents, paymentMethod),
    paymentMethod,
  };
}

export function formatBreakdownUsd(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  return `${sign}$${formatUsd(Math.abs(cents) / 100)}`;
}
