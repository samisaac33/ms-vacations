import type { BillingIdType } from "@/lib/billing-validation";
import type { PaymentMethod } from "@/lib/payments/types";

export type AdminBillingBookingStatus = "confirmed" | "pending_balance";

export type AdminBillingBooking = {
  id: string;
  reference: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  guestEmail: string | null;
  totalCents: number;
  depositCents: number | null;
  balanceCents: number | null;
  paymentMethod: PaymentMethod;
  status: AdminBillingBookingStatus;
  billingName: string | null;
  billingIdType: BillingIdType | null;
  billingIdNumber: string | null;
  billingCity: string | null;
  billingCompletedAt: string | null;
  voucherSentAt: string | null;
  createdAt: string;
};
