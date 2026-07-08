import Link from "next/link";
import { WHATSAPP_URL } from "@/lib/catalog";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-foreground text-white">
      <div className="mx-auto max-w-7xl px-6 py-14 md:px-10">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="font-display text-2xl font-semibold">MS Vacations</p>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Alojamientos vacacionales en San Clemente y Portoviejo, Manabí,
              Ecuador. Reserva directa con atención personalizada.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-white/50">
              Destinos
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="#san-clemente" className="text-sm text-white/80 hover:text-white hover:underline">
                  San Clemente — Playa
                </Link>
              </li>
              <li>
                <Link href="#portoviejo" className="text-sm text-white/80 hover:text-white hover:underline">
                  Portoviejo — Ciudad
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest text-white/50">
              Contacto
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/80 hover:text-white hover:underline"
                >
                  Escríbenos por WhatsApp
                </a>
              </li>
              <li>
                <span className="text-sm text-white/60">
                  Tarifas en USD · Reserva directa
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center">
          <p className="text-sm text-white/50">
            © 2026 MS Vacations · Manabí, Ecuador
          </p>
          <p className="text-sm text-white/50">Español (EC) · USD</p>
        </div>
      </div>
    </footer>
  );
}
