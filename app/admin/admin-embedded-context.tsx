"use client";

import { createContext, useContext, type ReactNode } from "react";

const AdminEmbeddedContext = createContext(false);

export function AdminEmbeddedProvider({ children }: { children: ReactNode }) {
  return <AdminEmbeddedContext.Provider value={true}>{children}</AdminEmbeddedContext.Provider>;
}

export function useAdminEmbedded() {
  return useContext(AdminEmbeddedContext);
}
