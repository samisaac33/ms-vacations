"use client";

import Link from "next/link";
import { useState } from "react";
import { siteConfig } from "@/lib/site";

type Destination = "beach" | "city";

const options: { id: Destination; label: string; href: string }[] = [
  {
    id: "beach",
    label: siteConfig.destinations.beach.area,
    href: "#playa",
  },
  {
    id: "city",
    label: siteConfig.destinations.city.area,
    href: "#ciudad",
  },
];

export function HomeHeroPanel() {
  const [destination, setDestination] = useState<Destination>("beach");
  const selected = options.find((option) => option.id === destination) ?? options[0]!;

  return (
    <div className="hero-panel mt-8 w-full max-w-xl">
      <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
        ¿Dónde quieres hospedarte?
      </p>
      <div className="mt-3 flex gap-2">
        {options.map((option) => {
          const active = option.id === destination;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setDestination(option.id)}
              className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                active
                  ? "bg-white text-ocean shadow-sm"
                  : "bg-white/15 text-white ring-1 ring-white/25 hover:bg-white/25"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Link
          href={selected.href}
          className="inline-flex h-12 flex-1 items-center justify-center rounded-xl bg-accent px-6 text-sm font-semibold text-ink shadow-lg shadow-black/15 transition-colors hover:bg-accent/90"
        >
          Ver alojamientos en {selected.label}
        </Link>
        <Link
          href={siteConfig.copy.catalogPath}
          className="inline-flex h-12 items-center justify-center rounded-xl bg-white/10 px-6 text-sm font-semibold text-white ring-1 ring-white/25 backdrop-blur transition-colors hover:bg-white/20"
        >
          Catálogo completo
        </Link>
      </div>
    </div>
  );
}
