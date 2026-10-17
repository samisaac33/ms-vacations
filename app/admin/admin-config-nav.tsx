"use client";

const LINKS = [
  { href: "#pagos", label: "Pagos" },
  { href: "#historial-pagos", label: "Historial" },
  { href: "#facturacion", label: "Facturación" },
  { href: "#correo", label: "Correo" },
  { href: "#iva", label: "IVA" },
  { href: "#temporadas", label: "Temporadas" },
  { href: "#ical", label: "iCal" },
] as const;

export function AdminConfigNav() {
  return (
    <nav
      aria-label="Secciones de configuración"
      className="sticky top-0 z-10 -mx-1 mb-6 hidden flex-wrap gap-2 border-b border-zinc-200 bg-zinc-50/95 py-3 backdrop-blur-sm md:flex"
    >
      {LINKS.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}
