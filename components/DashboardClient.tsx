"use client";

import { useCallback, useEffect, useState } from "react";
import type { GuestsPayload } from "@/lib/guests";
import { useCountUp, usePrefersReducedMotion } from "@/lib/useCountUp";
import { Hero } from "./Hero";
import { GuestColumn } from "./GuestColumn";
import { EmptyState } from "./EmptyState";
import { ExportAction } from "./ExportAction";

const REFRESH_INTERVAL_MS = 45_000;
const CLOCK_TICK_MS = 15_000;

export function DashboardClient({
  secretKey,
  initialData,
}: {
  secretKey: string;
  initialData: GuestsPayload;
}) {
  const [data, setData] = useState(initialData);
  const [lastUpdated, setLastUpdated] = useState(() => new Date());
  const [now, setNow] = useState(() => new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshHiccup, setRefreshHiccup] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const displayTotal = useCountUp(data.counts.total, reducedMotion);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/guests?k=${encodeURIComponent(secretKey)}`, { cache: "no-store" });
      if (!res.ok) throw new Error("refresh failed");
      const fresh = (await res.json()) as GuestsPayload;
      setData(fresh);
      setLastUpdated(new Date());
      setRefreshHiccup(false);
    } catch {
      setRefreshHiccup(true);
    } finally {
      setIsRefreshing(false);
    }
  }, [secretKey]);

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), CLOCK_TICK_MS);
    return () => clearInterval(id);
  }, []);

  const hasGuests = data.counts.total > 0;

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 pt-16 pb-8 sm:px-10 sm:pt-24">
      <Hero
        displayTotal={displayTotal}
        coupleNames={data.coupleNames}
        lastUpdated={lastUpdated}
        now={now}
        isRefreshing={isRefreshing}
        refreshHiccup={refreshHiccup}
        onRefresh={refresh}
      />

      {hasGuests ? (
        <div className="mt-16 grid grid-cols-1 gap-x-20 gap-y-14 sm:mt-20 md:grid-cols-2">
          {data.sides.map((side) => (
            <GuestColumn
              key={side.key}
              label={side.label}
              guests={data.guests.filter((guest) => guest.side.toLowerCase() === side.key.toLowerCase())}
            />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}

      <ExportAction secretKey={secretKey} />
    </main>
  );
}
