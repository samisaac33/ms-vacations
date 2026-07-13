import { PaymentMethodList } from "@/components/booking/payment-method-list";
import type { PaymentMethod } from "@/lib/payments/types";

type Props = {
  paymentMethod: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
};

export function BookingStepPayment({ paymentMethod, onChange }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-semibold text-ink">Agrega un método de pago</h2>
      <PaymentMethodList paymentMethod={paymentMethod} onChange={onChange} />
    </div>
  );
}
