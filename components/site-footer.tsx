import Link from "next/link";
import { siteConfig } from "@/lib/site";

const legalLinks = [
  { href: "/terminos", label: "Términos" },
  { href: "/privacidad", label: "Privacidad" },
  { href: "/cancelaciones", label: "Cancelaciones" },
] as const;

export function SiteFooter() {
  const { email, whatsapp } = siteConfig.contact;
  const hasContact = Boolean(email || whatsapp);

  return (
    <footer className="mt-auto border-t border-sand-dark bg-sand-dark">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="font-semibold text-ink">{siteConfig.name}</p>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted">
              {siteConfig.tagline}
            </p>
            <p className="mt-2 text-sm text-muted">
              {siteConfig.location.area}, {siteConfig.location.province},{" "}
              {siteConfig.location.country}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-ink">Enlaces</p>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              <li>
                <Link href={siteConfig.copy.catalogPath} className="text-muted hover:text-ocean hover:underline">
                  {siteConfig.copy.catalogNav}
                </Link>
              </li>
              <li>
                <Link href={siteConfig.copy.guidePath} className="text-muted hover:text-ocean hover:underline">
                  {siteConfig.copy.guideNav}
                </Link>
              </li>
              {legalLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-muted hover:text-ocean hover:underline">
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
                    <a href={`mailto:${email}`} className="text-muted hover:text-ocean hover:underline">
                      {email}
                    </a>
                  </li>
                )}
                {whatsapp && (
                  <li>
                    <a
                      href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted hover:text-ocean hover:underline"
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

        <p className="mt-8 border-t border-sand-dark/60 pt-6 text-xs text-muted">
          © {new Date().getFullYear()} {siteConfig.name}. Desarrollado por Vextu.
        </p>
      </div>
    </footer>
  );
}
