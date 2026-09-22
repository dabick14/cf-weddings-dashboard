"use client";

import { useState } from "react";
import type { Guest } from "@/lib/guests";
import { GuestRow } from "./GuestRow";

const PAGE_SIZE = 40;

/**
 * One windowed list of guests. The caller mounts this with a `key` derived
 * from the current tab/search scope, so switching tabs or searching remounts
 * a fresh instance — window and expanded-row state reset for free, no effect
 * needed.
 */
export function GuestListPane({ guests, hasAnyGuests }: { guests: Guest[]; hasAnyGuests: boolean }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  if (!guests.length) {
    return (
      <p className="pt-6 font-sans text-sm italic text-rosewood/70">
        {hasAnyGuests ? "No one by that name yet." : "No one yet on this side."}
      </p>
    );
  }

  const visible = guests.slice(0, visibleCount);
  const hasMore = guests.length > visible.length;

  return (
    <>
      <ul className="mt-1">
        {visible.map((guest, index) => {
          const rowKey = `${guest.name}-${guest.createdAt ?? index}`;
          return (
            <GuestRow
              key={rowKey}
              guest={guest}
              expanded={expandedKey === rowKey}
              onToggle={() => setExpandedKey((current) => (current === rowKey ? null : rowKey))}
            />
          );
        })}
      </ul>
      {hasMore && (
        <button
          type="button"
          onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
          className="mt-5 font-sans text-xs tracking-wide text-rosewood/70 underline decoration-rosewood/30 underline-offset-4 transition hover:text-rosewood"
        >
          Show more
        </button>
      )}
    </>
  );
}
