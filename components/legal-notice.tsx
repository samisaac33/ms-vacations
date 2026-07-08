import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export function LegalNotice({ children, className = "" }: Props) {
  return (
    <p
      className={`rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 ${className}`.trim()}
      role="note"
    >
      {children}
    </p>
  );
}
