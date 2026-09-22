"use client";

import { useCallback, useEffect, useState } from "react";
import type { GuestsPayload } from "@/lib/guests";
import { useCountUp, usePrefersReducedMotion } from "@/lib/useCountUp";
import { Hero } from "./Hero";
import { GuestDirectory } from "./GuestDirectory";
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
  // Sides weddings predate RSVPs; only surface the breakdown there once
  // someone has actually answered, so an all-"unknown" list looks unchanged.
  const attendingCounts = data.counts.attending;
  const showAttending =
    data.sides.length === 0 || attendingCounts.yes + attendingCounts.no > 0;

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
        attending={showAttending ? attendingCounts : undefined}
      />

      {hasGuests ? (
        <GuestDirectory
          sides={data.sides}
          guests={data.guests}
          totalCount={data.counts.total}
          bySideCounts={data.counts.bySide}
        />
      ) : (
        <EmptyState />
      )}

      <ExportAction secretKey={secretKey} />
    </main>
  );
}
