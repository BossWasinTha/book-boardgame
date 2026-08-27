"use client";

import { useEffect, useRef } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

/**
 * Subscribes to Supabase Realtime `postgres_changes` on the given tables and calls
 * `onChange` (debounced) whenever any row in any of them changes. Callers refetch
 * their own list from the relevant API route in response — the dataset here is tiny,
 * so a full refetch on every change is simpler and safer than patching local state.
 */
export function useRealtimeRefetch(tables: string[], onChange: () => void) {
  const cbRef = useRef(onChange);
  useEffect(() => {
    cbRef.current = onChange;
  });
  const key = tables.join(",");

  useEffect(() => {
    const client = supabaseBrowser();
    const channel = client.channel(`admin-${key}-${Math.random().toString(36).slice(2)}`);
    let debounce: ReturnType<typeof setTimeout> | null = null;
    const trigger = () => {
      if (debounce) clearTimeout(debounce);
      debounce = setTimeout(() => cbRef.current(), 250);
    };

    for (const table of key.split(",")) {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, trigger);
    }
    channel.subscribe();

    return () => {
      if (debounce) clearTimeout(debounce);
      client.removeChannel(channel);
    };
  }, [key]);
}
