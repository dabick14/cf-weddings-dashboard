"use client";

import { useState } from "react";
import type { Guest } from "@/lib/guests";
import { GuestRow } from "./GuestRow";

export function GuestColumn({ label, guests }: { label: string; guests: Guest[] }) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <section>
      <div className="flex items-baseline justify-between border-b border-accent/25 pb-3">
        <h2 className="font-serif text-2xl italic text-ink">{label}&rsquo;s side</h2>
        <span className="font-sans text-xs tracking-wide text-rosewood">
          {guests.length} {guests.length === 1 ? "guest" : "guests"}
        </span>
      </div>

      {guests.length ? (
        <ul className="mt-1">
          {guests.map((guest, index) => (
            <GuestRow
              key={`${guest.name}-${guest.createdAt ?? index}`}
              guest={guest}
              expanded={expandedIndex === index}
              onToggle={() => setExpandedIndex((current) => (current === index ? null : index))}
            />
          ))}
        </ul>
      ) : (
        <p className="pt-6 font-sans text-sm italic text-rosewood/70">No one yet on this side.</p>
      )}
    </section>
  );
}
