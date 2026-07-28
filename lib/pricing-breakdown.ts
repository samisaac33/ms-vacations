import {
  formatVatRatePercent,
  HOSPITALITY_VAT_STANDARD_RATE,
  hospitalityVatRatePercentForNight,
} from "@/lib/legal/hospitality-vat";
import type { PaymentMethod } from "@/lib/payments/types";
import {
  CARD_PAYMENT_MARKUP_PERCENT,
  bookingTotalCentsForPaymentMethod,
  bookingTotalUsdForPaymentMethod,
  formatUsd,
  refundableGuaranteeCents,
  stayTotalCentsForPaymentMethod,
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
  totalBeforeMarkupCents: number;
  markupCents: number;
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
    const ratePercent = hospitalityVatRatePercentForNight(night);
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
  const lodgingBeforeMarkupCents = quote.nightlyTotalDirectCents;
  const totalBeforeMarkupCents = lodgingBeforeMarkupCents + quote.cleaningFeeCents;

  const vatMap = new Map<number, number>();
  for (const night of nightly) {
    vatMap.set(night.vatRatePercent, (vatMap.get(night.vatRatePercent) ?? 0) + night.vatCents);
  }
  const vatByRate = [...vatMap.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([ratePercent, cents]) => ({ ratePercent, cents }));

  const stayTotalCents = stayTotalCentsForPaymentMethod(
    quote.nightlyTotalDirectCents,
    quote.cleaningFeeCents,
    paymentMethod,
  );
  const totalCents = bookingTotalCentsForPaymentMethod(
    quote.nightlyTotalDirectCents,
    quote.cleaningFeeCents,
    paymentMethod,
    quote.slug,
  );
  const markupCents =
    paymentMethod !== "bank_transfer" ? stayTotalCents - totalBeforeMarkupCents : 0;

  const lines: PriceBreakdownLine[] = [];

  if (quote.nights > 1) {
    lines.push({
      label: `${quote.nights} noches`,
      amountCents: lodgingBeforeMarkupCents,
    });
  } else {
    lines.push({
      label: "1 noche",
      amountCents: lodgingBeforeMarkupCents,
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

  if (quote.cleaningFeeCents > 0) {
    const { baseCents: cleaningBaseCents, vatCents: cleaningVatCents } = vatFromInclusiveCents(
      quote.cleaningFeeCents,
      HOSPITALITY_VAT_STANDARD_RATE,
    );
    const cleaningVatRatePercent = HOSPITALITY_VAT_STANDARD_RATE * 100;

    lines.push({
      label: "Recargo de limpieza",
      amountCents: quote.cleaningFeeCents,
    });
    lines.push({
      label: "Subtotal sin IVA",
      amountCents: cleaningBaseCents,
      indent: true,
    });
    lines.push({
      label: `IVA ${formatVatRatePercent(cleaningVatRatePercent)} %`,
      amountCents: cleaningVatCents,
      indent: true,
    });
  }

  if (markupCents > 0) {
    lines.push({
      label: `Recargo tarjeta (+${CARD_PAYMENT_MARKUP_PERCENT} %)`,
      amountCents: markupCents,
    });
  }

  const guaranteeCents = refundableGuaranteeCents(quote.slug);
  if (guaranteeCents > 0) {
    lines.push({
      label: "Garantía reembolsable",
      amountCents: guaranteeCents,
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
    totalBeforeMarkupCents,
    markupCents,
    totalCents,
    totalUsd: bookingTotalUsdForPaymentMethod(
      quote.nightlyTotalDirectCents,
      quote.cleaningFeeCents,
      paymentMethod,
      quote.slug,
    ),
    paymentMethod,
  };
}

export function formatBreakdownUsd(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  return `${sign}$${formatUsd(Math.abs(cents) / 100)}`;
}
