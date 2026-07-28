"use client";

import { useEffect, useSyncExternalStore } from "react";

const MOBILE_MAX_WIDTH = 768;
const TOP_THRESHOLD = 16;
const MIN_HIDE_OFFSET = 48;
const DIRECTION_THRESHOLD = 10;

export type ScrollChromeState = {
  headerHidden: boolean;
  navHidden: boolean;
  isMobile: boolean;
};

type ScrollChromeSnapshot = ScrollChromeState;

const defaultSnapshot: ScrollChromeSnapshot = {
  headerHidden: false,
  navHidden: false,
  isMobile: false,
};

let snapshot: ScrollChromeSnapshot = { ...defaultSnapshot };
let lastScrollY = 0;
let listenerCount = 0;
let menuOpen = false;

const subscribers = new Set<() => void>();

function emit() {
  for (const notify of subscribers) {
    notify();
  }
}

function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH - 1}px)`).matches;
}

function updateSnapshot(next: Partial<ScrollChromeSnapshot>) {
  snapshot = { ...snapshot, ...next };
  emit();
}

function resetChrome() {
  lastScrollY = typeof window !== "undefined" ? window.scrollY : 0;
  snapshot = {
    headerHidden: false,
    navHidden: false,
    isMobile: isMobileViewport(),
  };
  emit();
}

function handleScroll() {
  if (!isMobileViewport()) {
    if (snapshot.headerHidden || snapshot.navHidden || snapshot.isMobile) {
      resetChrome();
    }
    return;
  }

  const scrollY = window.scrollY;

  if (scrollY <= TOP_THRESHOLD) {
    if (snapshot.headerHidden || snapshot.navHidden || !snapshot.isMobile) {
      updateSnapshot({
        headerHidden: false,
        navHidden: false,
        isMobile: true,
      });
    }
    lastScrollY = scrollY;
    return;
  }

  if (menuOpen) {
    lastScrollY = scrollY;
    return;
  }

  const delta = scrollY - lastScrollY;

  if (delta > DIRECTION_THRESHOLD && scrollY > MIN_HIDE_OFFSET) {
    if (!snapshot.headerHidden || !snapshot.navHidden) {
      updateSnapshot({
        headerHidden: true,
        navHidden: true,
        isMobile: true,
      });
    }
  } else if (delta < -DIRECTION_THRESHOLD) {
    if (snapshot.headerHidden) {
      updateSnapshot({
        headerHidden: false,
        isMobile: true,
      });
    }
  }

  lastScrollY = scrollY;
}

function handleResize() {
  if (!isMobileViewport()) {
    resetChrome();
    return;
  }
  updateSnapshot({ isMobile: true });
}

function subscribe(notify: () => void) {
  subscribers.add(notify);
  listenerCount += 1;

  if (listenerCount === 1 && typeof window !== "undefined") {
    lastScrollY = window.scrollY;
    snapshot = {
      ...defaultSnapshot,
      isMobile: isMobileViewport(),
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });
  }

  return () => {
    subscribers.delete(notify);
    listenerCount -= 1;

    if (listenerCount === 0 && typeof window !== "undefined") {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      snapshot = { ...defaultSnapshot };
    }
  };
}

function getSnapshot(): ScrollChromeSnapshot {
  return snapshot;
}

function getServerSnapshot(): ScrollChromeSnapshot {
  return defaultSnapshot;
}

/** Evita ocultar el header mientras el menú móvil está abierto. */
export function setMobileScrollChromeMenuOpen(open: boolean) {
  menuOpen = open;
  if (open && snapshot.headerHidden) {
    updateSnapshot({ headerHidden: false });
  }
}

export function useMobileScrollChrome(enabled = true): ScrollChromeState {
  const state = useSyncExternalStore(
    enabled ? subscribe : () => () => {},
    enabled ? getSnapshot : getServerSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    if (!enabled) return;
    handleResize();
  }, [enabled]);

  if (!enabled) {
    return { headerHidden: false, navHidden: false, isMobile: false };
  }

  return {
    headerHidden: state.isMobile && state.headerHidden,
    navHidden: state.isMobile && state.navHidden,
    isMobile: state.isMobile,
  };
}

/** True cuando las pestañas deben ocultarse en móvil (scroll abajo, hasta volver arriba). */
export function useDestinationNavHidden(): boolean {
  const { navHidden, isMobile } = useMobileScrollChrome(true);
  return navHidden && isMobile;
}
