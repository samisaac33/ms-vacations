"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminIcalSyncToolbar } from "@/app/admin/admin-ical-sync-header";
import { adminLogout } from "@/app/admin/actions";
import { SiteLogo } from "@/components/site-logo";
import {
  setMobileScrollChromeMenuOpen,
  useMobileScrollChrome,
} from "@/hooks/use-mobile-scroll-chrome";
import { siteConfig } from "@/lib/site";

const navLinks = [
  { href: siteConfig.copy.catalogPath, label: siteConfig.copy.catalogNav },
  { href: "/#playa", label: siteConfig.destinations.beach.area },
  { href: "/#ciudad", label: siteConfig.destinations.city.area },
  { href: siteConfig.copy.guidePath, label: siteConfig.copy.guideNav },
] as const;

function whatsappHref(): string | null {
  const raw = siteConfig.contact.whatsapp;
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : null;
}

function NavLink({
  href,
  label,
  onNavigate,
}: {
  href: string;
  label: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isHashLink = href.startsWith("/#");
  const isActive =
    (!isHashLink && pathname === href) ||
    (href === siteConfig.copy.catalogPath && pathname.startsWith("/propiedades"));

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "bg-ocean-light text-ocean"
          : "text-muted hover:bg-sand-dark hover:text-ink"
      }`}
    >
      {label}
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const wa = whatsappHref();
  const isPropertyDetail = /^\/propiedades\/[^/]+$/.test(pathname);
  const isBookingFlow = /^\/reservar\/[^/]+$/.test(pathname);
  const isAdminRoute = pathname.startsWith("/admin");
  const hideOnMobile = isPropertyDetail || isBookingFlow;
  const { headerHidden } = useMobileScrollChrome(!hideOnMobile);

  useEffect(() => {
    setMobileScrollChromeMenuOpen(menuOpen);
    return () => setMobileScrollChromeMenuOpen(false);
  }, [menuOpen]);

  useEffect(() => {
    if (headerHidden && menuOpen) setMenuOpen(false);
  }, [headerHidden, menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header
      className={`sticky top-0 z-50 border-b border-sand-dark/80 bg-sand/95 shadow-sm backdrop-blur-md max-md:transition-transform max-md:duration-300 max-md:ease-out motion-reduce:max-md:transition-none ${hideOnMobile ? "hidden lg:block" : ""} ${headerHidden ? "max-md:pointer-events-none max-md:-translate-y-full" : ""}`}
      aria-hidden={headerHidden || undefined}
    >
      <div
        className="mx-auto flex max-w-6xl flex-nowrap items-center justify-between gap-4 px-4 sm:px-6"
        style={{ minHeight: "var(--header-height)" }}
      >
        <Link
          href={isAdminRoute ? "/admin" : "/"}
          className="group flex max-h-[var(--header-height)] shrink-0 items-center gap-3 overflow-hidden transition-opacity hover:opacity-90"
          aria-label={isAdminRoute ? "Calendario admin" : siteConfig.name}
        >
          <SiteLogo height={40} showTagline />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          {navLinks.map(({ href, label }) => (
            <NavLink key={href} href={href} label={label} />
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-xl bg-ocean px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-ocean-dark sm:inline-flex"
            >
              WhatsApp
            </a>
          )}

          {isAdminRoute && (
            <form action={adminLogout} className="flex items-center md:hidden">
              <button
                type="submit"
                className="inline-flex h-10 items-center whitespace-nowrap rounded-lg border border-sand-dark bg-surface px-3 text-sm font-medium text-ink hover:bg-sand-dark/50"
              >
                Cerrar sesión
              </button>
            </form>
          )}

          {isAdminRoute && (
            <div className="md:hidden">
              <AdminIcalSyncToolbar />
            </div>
          )}

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-sand-dark bg-surface text-ink md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M6 6l12 12M18 6 6 18"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobile-nav"
          className="border-t border-sand-dark/80 bg-sand px-4 py-3 md:hidden"
          aria-label="Móvil"
        >
          <ul className="flex flex-col gap-1">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <NavLink href={href} label={label} onNavigate={() => setMenuOpen(false)} />
              </li>
            ))}
            {wa && (
              <li className="pt-2">
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex rounded-lg bg-ocean px-3 py-2.5 text-sm font-medium text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  WhatsApp
                </a>
              </li>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
