import type { ComponentPropsWithoutRef } from "react";

const inputClass =
  "mt-1 w-full rounded-lg border border-sand-dark bg-white px-3 py-2 text-ink placeholder:text-muted/70 focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/20 disabled:opacity-60";

export function Label({
  className = "",
  ...props
}: ComponentPropsWithoutRef<"label">) {
  return (
    <label
      className={`block text-sm font-medium text-ink ${className}`.trim()}
      {...props}
    />
  );
}

export function Input({ className = "", ...props }: ComponentPropsWithoutRef<"input">) {
  return <input className={`${inputClass} ${className}`.trim()} {...props} />;
}

export function Textarea({
  className = "",
  ...props
}: ComponentPropsWithoutRef<"textarea">) {
  return (
    <textarea
      className={`${inputClass} min-h-[100px] resize-y ${className}`.trim()}
      {...props}
    />
  );
}
