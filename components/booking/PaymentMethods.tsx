import type { PaymentMethod } from "@/lib/catalog";

interface PaymentMethodsProps {
  methods: PaymentMethod[];
  selectedId?: string;
  onSelect?: (id: string) => void;
  readOnly?: boolean;
}

export function PaymentMethods({
  methods,
  selectedId,
  onSelect,
  readOnly = false,
}: PaymentMethodsProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Formas de pago</h3>
      <div className="grid gap-3">
        {methods.map((method) => {
          const isSelected = selectedId === method.id;

          return (
            <label
              key={method.id}
              className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors ${
                isSelected
                  ? "border-primary bg-primary-light"
                  : "border-border bg-white hover:border-primary/40"
              } ${readOnly ? "cursor-default" : ""}`}
            >
              {!readOnly && (
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={isSelected}
                  onChange={() => onSelect?.(method.id)}
                  className="mt-1 accent-primary"
                />
              )}
              <span>
                <span className="block text-sm font-semibold text-foreground">
                  {method.label}
                </span>
                <span className="mt-1 block text-sm text-muted">{method.description}</span>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
