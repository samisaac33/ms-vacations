import type { PaymentTiming } from "@/lib/payment-schedule";
import type { PaymentMethod } from "@/lib/payments/types";

export type OnlinePaymentCheckoutSnapshot = {
  slug: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestEmail: string;
  paymentMethod: Extract<PaymentMethod, "paypal" | "payphone">;
  paymentTiming: PaymentTiming;
  termsVersion: string;
};

export function buildOnlineCheckoutSnapshot(params: {
  slug: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestEmail: string;
  paymentMethod: Extract<PaymentMethod, "paypal" | "payphone">;
  paymentTiming: PaymentTiming;
  termsVersion: string;
}): OnlinePaymentCheckoutSnapshot {
  return {
    slug: params.slug,
    checkIn: params.checkIn,
    checkOut: params.checkOut,
    guests: params.guests,
    guestEmail: params.guestEmail.trim(),
    paymentMethod: params.paymentMethod,
    paymentTiming: params.paymentTiming,
    termsVersion: params.termsVersion,
  };
}
