export type BankTransferBookingStatus =
  | "pending_payment"
  | "pending_verification"
  | "pending_balance"
  | "confirmed"
  | "cancelled"
  | "expired";

export type BankTransferBooking = {
  id: string;
  slug: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestEmail: string | null;
  totalCents: number;
  depositCents: number | null;
  status: BankTransferBookingStatus;
  paymentTiming: "full_now" | "split";
  paymentProofUrl: string | null;
  paymentProofUploadedAt: string | null;
  createdAt: string;
};

export type PendingVerificationBooking = Omit<BankTransferBooking, "status">;

export const BANK_TRANSFER_STATUS_LABELS: Record<BankTransferBookingStatus, string> = {
  pending_verification: "Pendiente verificación",
  confirmed: "Confirmada",
  pending_balance: "Saldo pendiente",
  cancelled: "Cancelada",
  expired: "Expirada",
  pending_payment: "Pendiente pago",
};
