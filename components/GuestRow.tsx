"use client";

import type { Guest } from "@/lib/guests";

export function GuestRow({ guest, expanded, onToggle }: { guest: Guest; expanded: boolean; onToggle: () => void }) {
  const detail = [guest.phone, guest.email].filter(Boolean).join(" · ");

  return (
    <li className="border-b border-accent/15 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        disabled={!detail}
        className="group flex w-full items-baseline justify-between gap-4 py-3.5 text-left disabled:cursor-default"
      >
        <span className="font-sans text-[15px] tracking-wide text-ink">{guest.name}</span>
        {detail && (
          <span className="shrink-0 font-sans text-xs text-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {expanded ? "–" : "+"}
          </span>
        )}
      </button>

      {detail && (
        <div
          className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
          style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <p className="pb-3.5 font-sans text-[13px] text-rosewood">{detail}</p>
          </div>
        </div>
      )}
    </li>
  );
}
