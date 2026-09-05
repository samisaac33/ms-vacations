"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { AdminEmbeddedProvider } from "@/app/admin/admin-embedded-context";
import { AdminIcalSyncToolbar } from "@/app/admin/admin-ical-sync-header";
import { AdminModal } from "@/components/admin-modal";
import { notifyAdminSessionChanged } from "@/lib/admin-session-events";
import {
  ADMIN_MENU_OPEN_MODAL_EVENT,
  ADMIN_MENU_TOGGLE_EVENT,
  type AdminMenuModalId,
} from "@/lib/admin-menu-events";
import type { AdminCalendarPropertyMeta } from "@/lib/admin-calendar-query";

type MenuItem = {
  id: AdminMenuModalId | "logout" | "ical";
  label: string;
  badge?: number;
  modalId?: AdminMenuModalId;
};

type ModalPanel = {
  id: AdminMenuModalId;
  title: string;
  content: ReactNode;
  maxWidthClass?: string;
};

type Props = {
  menuItems: MenuItem[];
  modals: ModalPanel[];
  properties: AdminCalendarPropertyMeta[];
};

function HamburgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MenuBadge({ count }: { count: number }) {
  return (
    <span className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-zinc-900 px-1.5 py-0.5 text-xs font-semibold text-white">
      {count}
    </span>
  );
}

function AdminFotosModalContent({ properties }: { properties: AdminCalendarPropertyMeta[] }) {
  const [query, setQuery] = useState("");

  const filtered = properties.filter((p) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-600">Selecciona una propiedad para gestionar sus fotos.</p>
      <input
        type="search"
        placeholder="Buscar propiedad"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-lg border border-zinc-300 bg-surface px-3 py-2 text-sm"
      />
      <ul className="divide-y divide-zinc-100 rounded-xl border border-zinc-200">
        {filtered.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/admin/propiedades/${p.slug}/fotos`}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-zinc-50"
            >
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-zinc-200">
                <Image src={p.imageSrc} alt="" fill className="object-cover" sizes="40px" />
              </div>
              <span className="min-w-0 flex-1 text-sm font-medium text-zinc-900">{p.name}</span>
              <span className="text-xs text-zinc-500">Gestionar →</span>
            </Link>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-zinc-500">Sin resultados</li>
        )}
      </ul>
    </div>
  );
}

export function AdminHamburgerMenu({ menuItems, modals, properties }: Props) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<AdminMenuModalId | null>(null);
  const [logoutPending, setLogoutPending] = useState(false);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const closeModal = useCallback(() => setActiveModal(null), []);

  const openModal = useCallback(
    (id: AdminMenuModalId) => {
      setActiveModal(id);
      closeDrawer();
    },
    [closeDrawer],
  );

  useEffect(() => {
    const onToggle = () => setDrawerOpen((open) => !open);
    const onOpenModal = (e: Event) => {
      const detail = (e as CustomEvent<AdminMenuModalId>).detail;
      if (detail) openModal(detail);
    };

    window.addEventListener(ADMIN_MENU_TOGGLE_EVENT, onToggle);
    window.addEventListener(ADMIN_MENU_OPEN_MODAL_EVENT, onOpenModal);
    return () => {
      window.removeEventListener(ADMIN_MENU_TOGGLE_EVENT, onToggle);
      window.removeEventListener(ADMIN_MENU_OPEN_MODAL_EVENT, onOpenModal);
    };
  }, [openModal]);

  useEffect(() => {
    if (!drawerOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen, closeDrawer]);

  async function handleLogout() {
    setLogoutPending(true);
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      // Si falla la red, igual refrescamos.
    }
    notifyAdminSessionChanged();
    closeDrawer();
    router.refresh();
    setLogoutPending(false);
  }

  const activeModalConfig = modals.find((m) => m.id === activeModal);

  return (
    <>
      {drawerOpen && (
        <div className="fixed inset-0 z-[75]">
          <button
            type="button"
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            aria-label="Cerrar menú"
            onClick={closeDrawer}
          />
          <nav
            className="absolute right-0 top-0 flex h-full w-[min(100%,20rem)] flex-col bg-surface shadow-xl"
            aria-label="Menú admin"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-4">
              <span className="text-sm font-semibold text-zinc-900">Menú</span>
              <button
                type="button"
                onClick={closeDrawer}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-zinc-600 hover:bg-zinc-100"
                aria-label="Cerrar menú"
              >
                <CloseIcon />
              </button>
            </div>

            <ul className="flex-1 overflow-y-auto py-2">
              {menuItems.map((item) => {
                if (item.id === "ical") {
                  return (
                    <li key={item.id} className="border-b border-zinc-100 px-4 py-3">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                        {item.label}
                      </p>
                      <AdminIcalSyncToolbar variant="admin" />
                    </li>
                  );
                }

                if (item.id === "logout") {
                  return (
                    <li key={item.id} className="mt-auto border-t border-zinc-200 p-2">
                      <button
                        type="button"
                        disabled={logoutPending}
                        onClick={handleLogout}
                        className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
                      >
                        {item.label}
                      </button>
                    </li>
                  );
                }

                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => item.modalId && openModal(item.modalId)}
                      className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-zinc-800 hover:bg-zinc-50"
                    >
                      <span className="flex-1">{item.label}</span>
                      {item.badge != null && item.badge > 0 ? <MenuBadge count={item.badge} /> : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      )}

      {activeModalConfig && (
        <AdminModal
          open
          title={activeModalConfig.title}
          onClose={closeModal}
          maxWidthClass={activeModalConfig.maxWidthClass}
        >
          <AdminEmbeddedProvider>
            {activeModalConfig.id === "fotos" ? (
              <AdminFotosModalContent properties={properties} />
            ) : (
              activeModalConfig.content
            )}
          </AdminEmbeddedProvider>
        </AdminModal>
      )}
    </>
  );
}

export { HamburgerIcon };
