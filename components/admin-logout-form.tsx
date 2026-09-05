"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { notifyAdminSessionChanged } from "@/lib/admin-session-events";

type Props = {
  className?: string;
  buttonClassName?: string;
  label?: string;
};

export function AdminLogoutForm({
  className,
  buttonClassName = "rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50",
  label = "Cerrar sesión",
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      try {
        await fetch("/api/admin/logout", { method: "POST" });
      } catch {
        // Si falla la red, igual refrescamos para reflejar el estado local.
      }
      notifyAdminSessionChanged();
      router.refresh();
    });
  }

  return (
    <div className={className}>
      <button type="button" disabled={pending} className={buttonClassName} onClick={handleLogout}>
        {label}
      </button>
    </div>
  );
}
