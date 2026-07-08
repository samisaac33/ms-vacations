"use client";

import { filterOptions } from "@/lib/mock-data";

interface FilterPillsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function FilterPills({ activeFilter, onFilterChange }: FilterPillsProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
      {filterOptions.map((option) => {
        const isActive = activeFilter === option.id;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onFilterChange(option.id)}
            className={`shrink-0 rounded-full border px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
              isActive
                ? "border-foreground bg-foreground text-white"
                : "border-border bg-white text-foreground hover:border-foreground"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
