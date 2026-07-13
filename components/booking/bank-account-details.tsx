"use client";

import { useState } from "react";
import { copyToClipboard } from "@/lib/copy-text";
import type { BankAccountDetails } from "@/lib/payments/bank-transfer";

type Props = {
  bank: BankAccountDetails;
  reference?: string;
  hideTitle?: boolean;
};

type CopyField = "account" | "id" | "email" | "reference";

function CopyButton({ value, field, copiedField, onCopy }: {
  value: string;
  field: CopyField;
  copiedField: CopyField | null;
  onCopy: (value: string, field: CopyField) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onCopy(value, field)}
      className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-ocean hover:bg-ocean/10"
    >
      {copiedField === field ? "Copiado" : "Copiar"}
    </button>
  );
}

function DetailRow({
  label,
  value,
  copyField,
  copiedField,
  onCopy,
}: {
  label: string;
  value: string;
  copyField?: CopyField;
  copiedField: CopyField | null;
  onCopy: (value: string, field: CopyField) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <dt className="text-muted">{label}</dt>
        <dd className="font-medium text-ink break-all">{value}</dd>
      </div>
      {copyField && (
        <CopyButton value={value} field={copyField} copiedField={copiedField} onCopy={onCopy} />
      )}
    </div>
  );
}

export function BankAccountDetailsCard({ bank, reference, hideTitle }: Props) {
  const [copiedField, setCopiedField] = useState<CopyField | null>(null);

  async function handleCopy(value: string, field: CopyField) {
    const ok = await copyToClipboard(value);
    if (ok) {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  }

  return (
    <div className="space-y-3">
      {!hideTitle && (
      <p className="text-sm font-medium text-ink">Datos para transferir</p>
    )}
      <dl className="grid gap-3 rounded-2xl border border-sand-dark bg-sand/40 p-4 text-sm">
        <DetailRow label="Titular" value={bank.holder} copiedField={copiedField} onCopy={handleCopy} />
        <DetailRow label="Banco" value={bank.bankName} copiedField={copiedField} onCopy={handleCopy} />
        <DetailRow
          label={`Cuenta (${bank.accountType})`}
          value={bank.accountNumber}
          copyField="account"
          copiedField={copiedField}
          onCopy={handleCopy}
        />
        <DetailRow
          label={bank.idType}
          value={bank.idNumber}
          copyField="id"
          copiedField={copiedField}
          onCopy={handleCopy}
        />
        {bank.email && (
          <DetailRow
            label="Correo"
            value={bank.email}
            copyField="email"
            copiedField={copiedField}
            onCopy={handleCopy}
          />
        )}
        {reference && (
          <DetailRow
            label="Referencia / concepto"
            value={reference}
            copyField="reference"
            copiedField={copiedField}
            onCopy={handleCopy}
          />
        )}
      </dl>
    </div>
  );
}

