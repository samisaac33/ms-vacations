"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { AdminCalendarPropertyMeta } from "@/lib/admin-calendar-query";

type Props = {
  properties: AdminCalendarPropertyMeta[];
  activeSlug?: string;
  activeSection?: "precios" | "fotos";
  compact?: boolean;
};

function propertyHref(slug: string, section: "precios" | "fotos") {
  return `/admin/propiedades/${slug}/${section}`;
}

export function AdminPropertyStrip({
  properties,
  activeSlug,
  activeSection = "precios",
  compact,
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return properties;
    return properties.filter(
      (p) => p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q),
    );
  }, [properties, query]);

  const activeProperty = properties.find((p) => p.slug === activeSlug);

  function handleMobileSelect(slug: string) {
    if (slug !== activeSlug) {
      router.push(propertyHref(slug, activeSection));
    }
  }

  return (
    <aside className={`flex flex-col ${compact ? "w-full" : "w-full lg:w-72 lg:shrink-0"}`}>
      {/* Móvil: selector compacto */}
      <div className="mb-4 space-y-3 lg:hidden">
        <div>
          <p className="text-xs font-medium text-zinc-500">
            {properties.length} {properties.length === 1 ? "propiedad" : "propiedades"}
          </p>
          {properties.length > 6 ? (
            <input
              type="search"
              placeholder="Buscar propiedad"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="mt-2 w-full rounded-lg border border-zinc-300 bg-surface px-3 py-2 text-sm"
            />
          ) : null}
        </div>

        {activeProperty ? (
          <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 shadow-sm">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-zinc-200">
              <Image
                src={activeProperty.imageSrc}
                alt=""
                fill
                className="object-cover"
                sizes="44px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-zinc-900">{activeProperty.name}</p>
              <p className="text-xs text-zinc-500">Propiedad actual</p>
            </div>
          </div>
        ) : null}

        <label className="block">
          <span className="sr-only">Cambiar propiedad</span>
          <select
            value={activeSlug ?? ""}
            onChange={(e) => handleMobileSelect(e.target.value)}
            className="w-full appearance-none rounded-lg border border-zinc-300 bg-surface bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat px-3 py-2.5 pr-10 text-sm font-medium text-zinc-900"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M6 9l6 6 6-6' stroke='%2371717a' stroke-width='1.75' stroke-linecap='round'/%3E%3C/svg%3E")`,
            }}
          >
            {filtered.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Escritorio: lista lateral */}
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

      <ul className="hidden flex-col gap-1 lg:flex">
        {filtered.map((p) => {
          const rowActive = p.slug === activeSlug;
          return (
            <li key={p.slug}>
              <div
                className={`rounded-xl px-2 py-2 transition-colors ${
                  rowActive ? "bg-zinc-900 text-white" : "hover:bg-zinc-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-zinc-200">
                    <Image src={p.imageSrc} alt="" fill className="object-cover" sizes="40px" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-xs font-medium leading-snug">{p.name}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      <Link
                        href={propertyHref(p.slug, "precios")}
                        aria-current={rowActive && activeSection === "precios" ? "page" : undefined}
                        className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors ${
                          rowActive && activeSection === "precios"
                            ? "bg-white text-zinc-900"
                            : rowActive
                              ? "bg-zinc-800/40 text-zinc-200 hover:bg-zinc-800/60"
                              : "text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900"
                        }`}
                      >
                        Precios
                      </Link>
                      <Link
                        href={propertyHref(p.slug, "fotos")}
                        aria-current={rowActive && activeSection === "fotos" ? "page" : undefined}
                        className={`rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors ${
                          rowActive && activeSection === "fotos"
                            ? "bg-white text-zinc-900"
                            : rowActive
                              ? "bg-zinc-800/40 text-zinc-200 hover:bg-zinc-800/60"
                              : "text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900"
                        }`}
                      >
                        Fotos
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
