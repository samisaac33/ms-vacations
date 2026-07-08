import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary-hover active:scale-[0.98]",
  secondary:
    "border border-border bg-white text-foreground hover:bg-surface",
  ghost: "text-foreground hover:bg-surface",
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
