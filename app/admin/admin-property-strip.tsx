"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { AdminCalendarPropertyMeta } from "@/lib/admin-calendar-query";

type Props = {
  properties: AdminCalendarPropertyMeta[];
  activeSlug?: string;
  activeSection?: "precios" | "fotos";
  compact?: boolean;
};

function sectionLinkClass(active: boolean) {
  return `rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors ${
    active ? "bg-white/20 text-white" : "text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900"
  }`;
}

function sectionLinkClassOnActiveRow(active: boolean) {
  return `rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors ${
    active ? "bg-white text-zinc-900" : "bg-zinc-800/40 text-zinc-200 hover:bg-zinc-800/60"
  }`;
}

export function AdminPropertyStrip({
  properties,
  activeSlug,
  activeSection = "precios",
  compact,
}: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return properties;
    return properties.filter(
      (p) => p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q),
    );
  }, [properties, query]);

  return (
    <aside className={`flex flex-col ${compact ? "w-full" : "w-full lg:w-72 lg:shrink-0"}`}>
      {!compact && (
        <div className="mb-3 hidden lg:block">
          <p className="text-xs font-medium text-zinc-500">{properties.length} anuncios</p>
          <input
            type="search"
            placeholder="Buscar anuncios"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="mt-2 w-full rounded-lg border border-zinc-300 bg-surface px-3 py-2 text-sm"
          />
        </div>
      )}
      <ul className="flex flex-row gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-1 lg:overflow-y-auto lg:pb-0">
        {filtered.map((p) => {
          const rowActive = p.slug === activeSlug;
          const linkClass = rowActive ? sectionLinkClassOnActiveRow : sectionLinkClass;
          return (
            <li key={p.slug} className="shrink-0 lg:shrink">
              <div
                className={`rounded-xl p-1 transition-colors lg:px-2 lg:py-2 ${
                  rowActive ? "bg-zinc-900 text-white" : "hover:bg-zinc-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-zinc-200">
                    <Image src={p.imageSrc} alt="" fill className="object-cover" sizes="40px" />
                  </div>
                  <div className="hidden min-w-0 flex-1 lg:block">
                    <p className="line-clamp-2 text-xs font-medium leading-snug">{p.name}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      <Link
                        href={`/admin/propiedades/${p.slug}/precios`}
                        aria-current={rowActive && activeSection === "precios" ? "page" : undefined}
                        className={linkClass(rowActive && activeSection === "precios")}
                      >
                        Precios
                      </Link>
                      <Link
                        href={`/admin/propiedades/${p.slug}/fotos`}
                        aria-current={rowActive && activeSection === "fotos" ? "page" : undefined}
                        className={linkClass(rowActive && activeSection === "fotos")}
                      >
                        Fotos
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex gap-1 lg:hidden">
                  <Link
                    href={`/admin/propiedades/${p.slug}/precios`}
                    aria-current={rowActive && activeSection === "precios" ? "page" : undefined}
                    className={`${linkClass(rowActive && activeSection === "precios")} ${
                      rowActive ? "" : "border border-zinc-200 bg-white"
                    }`}
                  >
                    Precios
                  </Link>
                  <Link
                    href={`/admin/propiedades/${p.slug}/fotos`}
                    aria-current={rowActive && activeSection === "fotos" ? "page" : undefined}
                    className={`${linkClass(rowActive && activeSection === "fotos")} ${
                      rowActive ? "" : "border border-zinc-200 bg-white"
                    }`}
                  >
                    Fotos
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
