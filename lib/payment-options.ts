import type { PaymentMethod } from "@/lib/payments/types";

export type PaymentOption = {
  id: PaymentMethod;
  label: string;
  subtitle?: string;
  iconBg: string;
  iconColor: string;
};

export const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    id: "bank_transfer",
    label: "Transferencia bancaria",
    subtitle: "Produbanco · −7 %",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-700",
  },
  {
    id: "payphone",
    label: "Tarjeta de crédito o débito",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
  },
  {
    id: "paypal",
    label: "PayPal",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
];
