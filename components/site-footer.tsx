import Link from "next/link";
import { SiteLogo } from "@/components/site-logo";
import { siteConfig } from "@/lib/site";
import { getLegalPoliciesMeta } from "@/lib/legal/policies";
import { formatBusinessIdentification, getBusinessInfo } from "@/lib/legal/business";

const policiesMeta = getLegalPoliciesMeta();

const legalLinks = [
  { href: policiesMeta.path, label: "Políticas y condiciones" },
  { href: "/terminos", label: "Términos" },
  { href: "/privacidad", label: "Privacidad" },
  { href: "/cancelaciones", label: "Cancelaciones" },
  { href: "/garantia", label: "Garantía" },
] as const;

const linkClass = "text-muted hover:text-ocean hover:underline";

export function SiteFooter() {
  const { email, whatsapp } = siteConfig.contact;
  const hasContact = Boolean(email || whatsapp);
  const business = getBusinessInfo();
  const businessId = formatBusinessIdentification(business);
  const whatsappHref = whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, "")}` : null;

  return (
    <footer className="mt-auto border-t border-sand-dark bg-sand-dark">
      <div className="mx-auto max-w-6xl px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-10 sm:pb-10">
        {/* Móvil: layout compacto */}
        <div className="sm:hidden">
          <SiteLogo height={32} />
          <p className="mt-2 text-xs text-muted">Manabí, Ecuador</p>

          <nav
            aria-label="Enlaces rápidos"
            className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm"
          >
            <Link href={siteConfig.copy.catalogPath} className={linkClass}>
              {siteConfig.copy.catalogNav}
            </Link>
            <span className="text-muted" aria-hidden>
              ·
            </span>
            <Link href={siteConfig.copy.guidePath} className={linkClass}>
              {siteConfig.copy.guideNav}
            </Link>
            {email ? (
              <>
                <span className="text-muted" aria-hidden>
                  ·
                </span>
                <a href={`mailto:${email}`} className={linkClass}>
                  {email}
                </a>
              </>
            ) : null}
          </nav>

          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            {legalLinks.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className={linkClass}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Desktop: layout en columnas */}
        <div className="hidden gap-8 sm:grid sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <SiteLogo height={40} className="mt-0" />
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
              {siteConfig.tagline}
            </p>
            <p className="mt-2 text-sm text-muted">
              {siteConfig.location.area}, {siteConfig.location.province},{" "}
              {siteConfig.location.country}
            </p>
            {businessId ? (
              <p className="mt-2 text-xs leading-relaxed text-muted">{businessId}</p>
            ) : null}
          </div>

          <div>
            <p className="text-sm font-semibold text-ink">Enlaces</p>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              <li>
                <Link href={siteConfig.copy.catalogPath} className={linkClass}>
                  {siteConfig.copy.catalogNav}
                </Link>
              </li>
              <li>
                <Link href={siteConfig.copy.guidePath} className={linkClass}>
                  {siteConfig.copy.guideNav}
                </Link>
              </li>
              {legalLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className={linkClass}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-ink">Contacto</p>
            {hasContact ? (
              <ul className="mt-3 flex flex-col gap-2 text-sm">
                {email && (
                  <li>
                    <a href={`mailto:${email}`} className={linkClass}>
                      {email}
                    </a>
                  </li>
                )}
                {whatsappHref && (
                  <li>
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkClass}
                    >
                      WhatsApp
                    </a>
                  </li>
                )}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted">
                Canales de contacto próximamente. Reserva en línea o consulta al confirmar tu
                estancia.
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 text-xs text-muted sm:mt-8 sm:border-t sm:border-sand-dark/60 sm:pt-6">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. Desarrollado por Vextu.
          </p>
          {businessId ? <p className="mt-1 sm:hidden">{businessId}</p> : null}
        </div>
      </div>
    </footer>
  );
}
