"use client";

import { useEffect, useState } from "react";
import { useMobileScrollChrome } from "@/hooks/use-mobile-scroll-chrome";
import { siteConfig } from "@/lib/site";

type Tab = "beach" | "city";

const tabs: { id: Tab; sectionId: string; label: string; href: string }[] = [
  {
    id: "beach",
    sectionId: "playa",
    label: siteConfig.destinations.beach.area,
    href: "#playa",
  },
  {
    id: "city",
    sectionId: "ciudad",
    label: siteConfig.destinations.city.area,
    href: "#ciudad",
  },
];

export function HomeDestinationNav() {
  const [active, setActive] = useState<Tab>("beach");
  const { navHidden, headerHidden, isMobile } = useMobileScrollChrome(true);
  const shouldHideNav = navHidden && isMobile;

  useEffect(() => {
    const sections = tabs.map((tab) => ({
      el: document.getElementById(tab.sectionId),
      tab: tab.id,
    }));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const match = sections.find((section) => section.el === visible.target);
        if (match) setActive(match.tab);
      },
      { rootMargin: "-35% 0px -45% 0px", threshold: [0, 0.25, 0.5] },
    );

    for (const { el } of sections) {
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`sticky z-40 border-y border-sand-dark/80 bg-sand/95 py-2.5 backdrop-blur-md md:top-[var(--header-height)] ${headerHidden ? "max-md:top-0" : "max-md:top-[var(--header-height)]"} ${shouldHideNav ? "max-md:hidden" : ""}`}
      role="tablist"
      aria-label="Destinos"
      aria-hidden={shouldHideNav || undefined}
    >
      <div className="flex gap-2">
        {tabs.map((tab) => {
          const selected = active === tab.id;
          return (
            <a
              key={tab.id}
              href={tab.href}
              role="tab"
              aria-selected={selected}
              className={`flex-1 rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition-all sm:flex-none sm:px-6 ${
                selected
                  ? "bg-ocean text-white shadow-md ring-2 ring-accent/60"
                  : "bg-surface text-muted ring-1 ring-sand-dark hover:text-ink"
              }`}
            >
              {tab.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}
