"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { AdminCalendarPropertyMeta } from "@/lib/admin-calendar-query";

type Props = {
  properties: AdminCalendarPropertyMeta[];
  activeSlug?: string;
  compact?: boolean;
};

export function AdminPropertyStrip({ properties, activeSlug, compact }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return properties;
    return properties.filter(
      (p) => p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q),
    );
  }, [properties, query]);

  return (
    <aside className={`flex flex-col ${compact ? "w-full" : "w-full lg:w-64 lg:shrink-0"}`}>
      {!compact && (
        <div className="mb-3 hidden lg:block">
          <p className="text-xs font-medium text-zinc-500">{properties.length} anuncios</p>
          <input
            type="search"
            placeholder="Buscar anuncios"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="mt-2 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
          />
        </div>
      )}
      <ul className="flex flex-row gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-1 lg:overflow-y-auto lg:pb-0">
        {filtered.map((p) => {
          const active = p.slug === activeSlug;
          return (
            <li key={p.slug} className="shrink-0 lg:shrink">
              <Link
                href={`/admin/propiedades/${p.slug}/precios`}
                title={p.name}
                aria-label={`Precios de ${p.name}`}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl p-1 transition-colors lg:px-2 lg:py-2 ${
                  active ? "bg-zinc-900 text-white" : "hover:bg-zinc-100"
                }`}
              >
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-zinc-200">
                  <Image src={p.imageSrc} alt="" fill className="object-cover" sizes="40px" />
                </div>
                <span className="hidden line-clamp-2 text-xs font-medium leading-snug lg:block">
                  {p.name}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
