import Link from "next/link";
import { LEGAL_POLICIES, getLegalPoliciesMeta } from "@/lib/legal/policies";

type Props = {
  currentPath: string;
};

export function LegalNav({ currentPath }: Props) {
  const hub = getLegalPoliciesMeta();

  return (
    <nav aria-label="Documentos legales" className="mt-8 rounded-2xl border border-sand-dark bg-sand/60 p-4 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{hub.title}</p>
      <ul className="mt-3 flex flex-col gap-2 text-sm">
        <li>
          <Link
            href={hub.path}
            className={`hover:text-ocean hover:underline ${currentPath === hub.path ? "font-semibold text-ocean" : "text-muted"}`}
          >
            Índice de políticas
          </Link>
        </li>
        {LEGAL_POLICIES.map((policy) => (
          <li key={policy.href}>
            <Link
              href={policy.href}
              className={`hover:text-ocean hover:underline ${currentPath === policy.href ? "font-semibold text-ocean" : "text-muted"}`}
            >
              {policy.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
