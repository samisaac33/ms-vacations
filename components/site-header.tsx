import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-sand-dark/80 bg-sand/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-ink transition-colors hover:text-ocean"
        >
          {siteConfig.name}
        </Link>
      </div>
    </header>
  );
}
