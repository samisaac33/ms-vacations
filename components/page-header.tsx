import Link from "next/link";
import type { ReactNode } from "react";

type Breadcrumb = { label: string; href?: string };

type Props = {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  children?: ReactNode;
  className?: string;
};

export function PageHeader({ title, subtitle, breadcrumbs, children, className = "" }: Props) {
  return (
    <header className={className}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Migas de pan" className="text-sm text-muted">
          {breadcrumbs.map((crumb, i) => (
            <span key={`${crumb.label}-${i}`}>
              {i > 0 && (
                <span className="mx-2" aria-hidden>
                  /
                </span>
              )}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-ocean hover:underline">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-ink">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <h1 className={`text-3xl font-semibold tracking-tight text-ink ${breadcrumbs ? "mt-3" : ""}`}>
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted">{subtitle}</p>
      )}
      {children}
    </header>
  );
}
