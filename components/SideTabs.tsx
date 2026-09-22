"use client";

import type { GuestSide } from "@/lib/guests";

export function SideTabs({
  sides,
  activeTab,
  onChange,
}: {
  sides: GuestSide[];
  activeTab: string;
  onChange: (key: string) => void;
}) {
  const tabs = [{ key: "all", label: "All" }, ...sides];

  return (
    <div
      role="tablist"
      aria-label="Filter guests by side"
      className="mt-8 flex gap-1 rounded-full border border-accent/20 bg-blush/25 p-1"
    >
      {tabs.map((tab) => {
        const active = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.key)}
            className={`flex-1 rounded-full py-2.5 font-sans text-xs tracking-wide transition-colors ${
              active ? "bg-ink text-cream" : "text-rosewood"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
