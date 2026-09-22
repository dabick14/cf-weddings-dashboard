"use client";

import { useMemo, useState } from "react";
import type { Guest, GuestSide } from "@/lib/guests";
import { SearchField } from "./SearchField";
import { SideTabs } from "./SideTabs";
import { GuestListPane } from "./GuestListPane";

/**
 * Renders the 250-guest keepsake roll. Desktop (>=768px) keeps the
 * two-column split, always visible; mobile shows a segmented control (one
 * side at a time, defaulting to "All") instead of stacking both columns.
 * Both are driven by the same search term and the same `guests` array —
 * only the side-splitting presentation differs at the breakpoint.
 *
 * Hero/sub counts always come from `totalCount`/`bySideCounts` (the
 * backend's true counts), never from the length of a filtered list, so
 * searching or switching tabs can never look like the guest count dropped.
 */
export function GuestDirectory({
  sides,
  guests,
  totalCount,
  bySideCounts,
}: {
  sides: GuestSide[];
  guests: Guest[];
  totalCount: number;
  bySideCounts: Record<string, number>;
}) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const normalizedQuery = query.trim().toLowerCase();
  const searchActive = normalizedQuery.length > 0;

  const filteredGuests = useMemo(() => {
    if (!normalizedQuery) return guests;
    return guests.filter((guest) => guest.name.toLowerCase().includes(normalizedQuery));
  }, [guests, normalizedQuery]);

  const forSide = (list: Guest[], sideKey: string) =>
    list.filter((guest) => guest.side.toLowerCase() === sideKey.toLowerCase());

  const mobileScope = activeTab === "all" ? filteredGuests : forSide(filteredGuests, activeTab);
  const mobileTrueCount = activeTab === "all" ? totalCount : (bySideCounts[activeTab] ?? 0);
  const mobileHasAny = activeTab === "all" ? guests.length > 0 : forSide(guests, activeTab).length > 0;

  return (
    <div className="mt-16 sm:mt-20">
      {/* Mobile: search + segmented control + one list at a time */}
      <div className="md:hidden">
        <SearchField id="guest-search-mobile" value={query} onChange={setQuery} />
        <SideTabs sides={sides} activeTab={activeTab} onChange={setActiveTab} />
        <div className="mt-8">
          {searchActive && (
            <p className="pb-3 font-sans text-xs text-rosewood/60">
              Showing {mobileScope.length} of {mobileTrueCount}
            </p>
          )}
          <GuestListPane
            key={`${activeTab}|${normalizedQuery}`}
            guests={mobileScope}
            hasAnyGuests={mobileHasAny}
          />
        </div>
      </div>

      {/* Desktop: search + both sides side by side, no tabs */}
      <div className="hidden md:block">
        <SearchField id="guest-search-desktop" value={query} onChange={setQuery} className="max-w-sm" />
        <div className="mt-10 grid grid-cols-2 gap-x-20 gap-y-14">
          {sides.map((side) => {
            const scope = forSide(filteredGuests, side.key);
            const trueCount = bySideCounts[side.key] ?? 0;
            const hasAny = forSide(guests, side.key).length > 0;
            return (
              <section key={side.key}>
                <div className="flex items-baseline justify-between border-b border-accent/25 pb-3">
                  <h2 className="font-serif text-2xl italic text-ink">{side.label}&rsquo;s side</h2>
                  <span className="font-sans text-xs tracking-wide text-rosewood">
                    {trueCount} {trueCount === 1 ? "guest" : "guests"}
                  </span>
                </div>
                {searchActive && (
                  <p className="pt-3 font-sans text-xs text-rosewood/60">
                    Showing {scope.length} of {trueCount}
                  </p>
                )}
                <GuestListPane key={normalizedQuery} guests={scope} hasAnyGuests={hasAny} />
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
