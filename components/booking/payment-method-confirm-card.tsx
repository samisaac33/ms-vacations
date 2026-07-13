import { PaymentMethodIcon } from "@/components/booking/payment-method-icon";
import { PAYMENT_OPTIONS } from "@/lib/payment-options";

type OnlinePaymentMethod = "paypal" | "payphone";

const CONFIRM_COPY: Record<
  OnlinePaymentMethod,
  { detail: string; paymentNote: string }
> = {
  paypal: {
    detail: "Usa tu saldo PayPal o una tarjeta vinculada a tu cuenta.",
    paymentNote: "Al confirmar verás los botones de PayPal en el siguiente paso para completar el pago.",
  },
  payphone: {
    detail: "Paga con tarjeta débito o crédito. Procesado de forma segura por PayPhone.",
    paymentNote: "Al confirmar verás el formulario de PayPhone en el siguiente paso para completar el pago.",
  },
};

type Props = {
  paymentMethod: OnlinePaymentMethod;
};

export function PaymentMethodConfirmCard({ paymentMethod }: Props) {
  const option = PAYMENT_OPTIONS.find((o) => o.id === paymentMethod);
  const copy = CONFIRM_COPY[paymentMethod];
  if (!option) return null;

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-ink">Método de pago</p>
      <div className="rounded-2xl border border-sand-dark bg-sand/40 p-4 text-sm">
        <div className="flex items-start gap-3">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${option.iconBg}`}
          >
            <PaymentMethodIcon method={paymentMethod} className={option.iconColor} />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-ink">{option.label}</p>
            <p className="mt-0.5 text-muted">{option.subtitle}</p>
            <p className="mt-2 text-ink">{copy.detail}</p>
          </div>
        </div>
        <p className="mt-4 border-t border-sand-dark pt-3 text-muted">{copy.paymentNote}</p>
        <p className="mt-2 text-xs text-muted">
          No almacenamos datos de tarjeta en nuestros servidores.
        </p>
      </div>
    </div>
  );
}
