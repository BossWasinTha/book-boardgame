"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

interface AdminUiContextValue {
  /** Show a bottom toast for ~2.4s. */
  flash: (msg: string) => void;
  toast: string | null;
  addOpen: boolean;
  openAdd: () => void;
  closeAdd: () => void;
}

const AdminUiContext = createContext<AdminUiContextValue | null>(null);

export function AdminUiProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flash = useCallback((msg: string) => {
    if (timer.current) clearTimeout(timer.current);
    setToast(msg);
    timer.current = setTimeout(() => setToast(null), 2400);
  }, []);

  const value = useMemo<AdminUiContextValue>(
    () => ({
      flash,
      toast,
      addOpen,
      openAdd: () => setAddOpen(true),
      closeAdd: () => setAddOpen(false),
    }),
    [flash, toast, addOpen],
  );

  return <AdminUiContext.Provider value={value}>{children}</AdminUiContext.Provider>;
}

export function useAdminUi(): AdminUiContextValue {
  const ctx = useContext(AdminUiContext);
  if (!ctx) throw new Error("useAdminUi must be used within AdminUiProvider");
  return ctx;
}
