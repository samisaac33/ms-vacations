"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { HamburgerIcon } from "@/app/admin/admin-hamburger-menu";
import { SiteLogo } from "@/components/site-logo";
import {
  setMobileScrollChromeMenuOpen,
  useMobileScrollChrome,
} from "@/hooks/use-mobile-scroll-chrome";
import { ADMIN_SESSION_CHANGED_EVENT } from "@/lib/admin-session-events";
import { toggleAdminMenu } from "@/lib/admin-menu-events";
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
  const [adminAuthed, setAdminAuthed] = useState<boolean | null>(null);
  const wa = whatsappHref();
  const isPropertyDetail = /^\/propiedades\/[^/]+$/.test(pathname);
  const isBookingFlow = /^\/reservar\/[^/]+$/.test(pathname);
  const isAdminRoute = pathname.startsWith("/admin");
  const showAdminChrome = isAdminRoute && adminAuthed === true;
  const hideOnMobile = isPropertyDetail || isBookingFlow;
  const { headerHidden } = useMobileScrollChrome(!hideOnMobile);

  useEffect(() => {
    if (!isAdminRoute) {
      setAdminAuthed(null);
      return;
    }

    let cancelled = false;

    const loadSession = () => {
      fetch("/api/admin/session", { cache: "no-store" })
        .then((res) => (res.ok ? res.json() : { authenticated: false }))
        .then((data: { authenticated?: boolean }) => {
          if (!cancelled) setAdminAuthed(Boolean(data.authenticated));
        })
        .catch(() => {
          if (!cancelled) setAdminAuthed(false);
        });
    };

    loadSession();
    window.addEventListener(ADMIN_SESSION_CHANGED_EVENT, loadSession);

    return () => {
      cancelled = true;
      window.removeEventListener(ADMIN_SESSION_CHANGED_EVENT, loadSession);
    };
  }, [isAdminRoute, pathname]);

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
          <SiteLogo height={40} showTagline={!isAdminRoute} showName={!isAdminRoute} />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          {!isAdminRoute &&
            navLinks.map(({ href, label }) => (
              <NavLink key={href} href={href} label={label} />
            ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {wa && !isAdminRoute && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden rounded-xl bg-ocean px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-ocean-dark sm:inline-flex"
            >
              WhatsApp
            </a>
          )}

          {showAdminChrome && (
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-sand-dark bg-surface text-ink"
              aria-label="Abrir menú admin"
              onClick={() => toggleAdminMenu()}
            >
              <HamburgerIcon />
            </button>
          )}

          {!isAdminRoute && (
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
          )}
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
