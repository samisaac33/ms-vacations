export const PAYMENT_METHODS = ["bank_transfer", "paypal", "payphone"] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export function isPaymentMethod(value: string): value is PaymentMethod {
  return (PAYMENT_METHODS as readonly string[]).includes(value);
}

export type PaymentNextStep = "bank_instructions" | "redirect" | "payphone_box" | "paypal_buttons";

export type InitiatePaymentResult =
  | { next: "bank_instructions"; redirectUrl: string }
  | { next: "redirect"; redirectUrl: string }
  | { next: "payphone_box"; redirectUrl: string }
  | { next: "paypal_buttons"; redirectUrl: string };
