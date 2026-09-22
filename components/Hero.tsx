"use client";

import type { AttendingCounts } from "@/lib/guests";

function formatRelativeTime(date: Date, now: Date): string {
  const seconds = Math.max(0, Math.round((now.getTime() - date.getTime()) / 1000));
  if (seconds < 15) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  return `${hours}h ago`;
}

export function Hero({
  displayTotal,
  coupleNames,
  lastUpdated,
  now,
  isRefreshing,
  refreshHiccup,
  onRefresh,
  attending,
}: {
  displayTotal: number;
  coupleNames: string;
  lastUpdated: Date;
  now: Date;
  isRefreshing: boolean;
  refreshHiccup: boolean;
  onRefresh: () => void;
  /** Omitted to hide the RSVP breakdown (e.g. a sides wedding where nobody has answered). */
  attending?: AttendingCounts;
}) {
  return (
    <div className="text-center">
      <p className="font-sans text-[11px] uppercase tracking-[0.28em] text-accent">{coupleNames}</p>

      <p className="mt-6 font-serif italic text-[clamp(4.5rem,18vw,8.5rem)] leading-none text-ink tabular-nums">
        {displayTotal}
      </p>

      <p className="mt-4 font-sans text-sm tracking-[0.08em] text-rosewood">
        {displayTotal === 1 ? "guest and counting" : "guests and counting"}
      </p>

      {attending && (
        <p className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-sans text-xs tracking-wide text-rosewood/80 tabular-nums">
          <span>{attending.yes} attending</span>
          <span aria-hidden="true" className="text-blush">
            &middot;
          </span>
          <span>{attending.no} not attending</span>
          <span aria-hidden="true" className="text-blush">
            &middot;
          </span>
          <span>{attending.unknown} unknown</span>
        </p>
      )}

      <div className="mt-8 flex items-center justify-center gap-3 font-sans text-xs text-rosewood/70">
        {isRefreshing ? (
          <span className="italic">gathering your guests&hellip;</span>
        ) : refreshHiccup ? (
          <span>Couldn&rsquo;t refresh &mdash; we&rsquo;ll try again shortly</span>
        ) : (
          <span>Updated {formatRelativeTime(lastUpdated, now)}</span>
        )}
        <span aria-hidden="true" className="text-blush">
          &middot;
        </span>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="underline decoration-rosewood/30 underline-offset-2 transition hover:text-ink disabled:opacity-50"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
