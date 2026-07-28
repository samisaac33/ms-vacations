type Props = {
  pendingPaymentsCount: number;
  missingBillingCount: number;
};

export function AdminConfigSummary({ pendingPaymentsCount, missingBillingCount }: Props) {
  return (
    <div className="mb-6 hidden max-w-2xl gap-3 md:grid sm:grid-cols-2">
      <SummaryCard
        label="Transferencias pendientes"
        value={String(pendingPaymentsCount)}
        highlight={pendingPaymentsCount > 0}
        href="#pagos"
      />
      <SummaryCard
        label="Sin datos de facturación"
        value={String(missingBillingCount)}
        highlight={missingBillingCount > 0}
        href="#facturacion"
      />
    </div>
  );
}

export function SummaryCard({
  label,
  value,
  highlight = false,
  truncate = false,
  href,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  truncate?: boolean;
  href: string;
}) {
  return (
    <a
      href={href}
      className={`block rounded-xl border p-4 transition-colors hover:border-zinc-300 ${
        highlight ? "border-amber-300 bg-amber-50" : "border-zinc-200 bg-white"
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`mt-1 text-sm font-semibold text-zinc-900 ${truncate ? "truncate" : ""}`}>{value}</p>
    </a>
  );
}
