"use client";

import { Button } from "@/components/ui/Button";

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

export function VacationSearchBar() {
  return (
    <div className="search-bar-shadow mx-auto flex w-full max-w-3xl flex-col overflow-hidden rounded-full border border-border bg-white transition-shadow duration-200 sm:flex-row sm:items-center">
      <div className="flex flex-1 flex-col sm:flex-row sm:items-center">
        <label className="group flex flex-1 cursor-pointer flex-col px-6 py-4 transition-colors hover:bg-surface sm:py-3.5">
          <span className="text-xs font-semibold text-foreground">¿Cuándo?</span>
          <input
            type="text"
            placeholder="Agrega fechas"
            className="mt-0.5 w-full bg-transparent text-sm text-muted outline-none placeholder:text-muted"
            readOnly
          />
        </label>

        <div className="hidden h-8 w-px bg-border sm:block" aria-hidden="true" />

        <label className="group flex flex-1 cursor-pointer flex-col border-t border-border px-6 py-4 transition-colors hover:bg-surface sm:border-t-0 sm:py-3.5">
          <span className="text-xs font-semibold text-foreground">¿Cuántos días?</span>
          <input
            type="text"
            placeholder="Número de días"
            className="mt-0.5 w-full bg-transparent text-sm text-muted outline-none placeholder:text-muted"
            readOnly
          />
        </label>

        <div className="hidden h-8 w-px bg-border sm:block" aria-hidden="true" />

        <label className="group flex flex-1 cursor-pointer flex-col border-t border-border px-6 py-4 transition-colors hover:bg-surface sm:border-t-0 sm:py-3.5">
          <span className="text-xs font-semibold text-foreground">Motivo</span>
          <input
            type="text"
            placeholder="Opcional"
            className="mt-0.5 w-full bg-transparent text-sm text-muted outline-none placeholder:text-muted"
            readOnly
          />
        </label>
      </div>

      <div className="border-t border-border p-2 sm:border-t-0">
        <Button className="w-full sm:w-auto sm:px-4 sm:py-3.5" aria-label="Buscar vacaciones">
          <SearchIcon />
          <span className="sm:hidden">Buscar</span>
        </Button>
      </div>
    </div>
  );
}
