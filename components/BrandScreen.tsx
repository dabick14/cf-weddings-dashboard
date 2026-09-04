import type { ReactNode } from "react";

/** Shared full-bleed, centred layout for the non-dashboard states: not-found, invalid key, load error. */
export function BrandScreen({
  eyebrow = "CF Weddings",
  heading,
  children,
}: {
  eyebrow?: string;
  heading: string;
  children?: ReactNode;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-sans text-[11px] uppercase tracking-[0.28em] text-accent">{eyebrow}</p>
      <h1 className="mt-5 max-w-md font-serif text-[clamp(2rem,6vw,3rem)] italic leading-[1.15] text-ink">
        {heading}
      </h1>
      {children && <div className="mt-5 max-w-sm font-sans text-[15px] leading-relaxed text-rosewood">{children}</div>}
    </main>
  );
}
