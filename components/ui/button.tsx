import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

const variants = {
  primary:
    "bg-ocean text-white hover:bg-ocean-dark focus-visible:ring-ocean/40",
  secondary:
    "border border-sand-dark bg-white text-ink hover:bg-sand-dark focus-visible:ring-ocean/30",
  ghost: "text-muted hover:bg-sand-dark hover:text-ink focus-visible:ring-ocean/30",
} as const;

type Variant = keyof typeof variants;

type BaseProps = {
  variant?: Variant;
  className?: string;
};

type ButtonAsButton = BaseProps &
  ComponentPropsWithoutRef<"button"> & { href?: undefined };

type ButtonAsLink = BaseProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, "className"> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const base =
  "inline-flex h-11 items-center justify-center rounded-lg px-6 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60";

export function Button(props: ButtonProps) {
  const { variant = "primary", className = "", ...rest } = props;
  const classes = `${base} ${variants[variant]} ${className}`.trim();

  if ("href" in props && props.href) {
    const { href, ...linkProps } = rest as ButtonAsLink;
    return <Link href={href} className={classes} {...linkProps} />;
  }

  const buttonProps = rest as ComponentPropsWithoutRef<"button">;
  return <button className={classes} {...buttonProps} />;
}
