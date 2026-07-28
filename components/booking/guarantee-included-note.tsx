import Link from "next/link";

type Props = {
  className?: string;
};

export function GuaranteeIncludedNote({ className }: Props) {
  return (
    <p className={className ?? "text-xs leading-relaxed text-muted"}>
      Incluye garantía reembolsable de USD 300 (
      <Link href="/garantia" className="font-medium text-ocean underline underline-offset-2">
        ver política
      </Link>
      ).
    </p>
  );
}
