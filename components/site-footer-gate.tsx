"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";

export function SiteFooterGate() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const isBookingFlow = /^\/reservar\/[^/]+$/.test(pathname);

  if (isAdmin || isBookingFlow) {
    return null;
  }

  return <SiteFooter />;
}
