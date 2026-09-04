"use client";

import { useEffect, useRef, useState } from "react";

function getPrefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(getPrefersReducedMotion);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return reduced;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Tweens a displayed integer toward `target`. Animates 0 → target on first
 * mount, then re-tweens from whatever's currently on screen whenever
 * `target` changes (e.g. a refresh brings in new guests). With reduced
 * motion, jumps straight to the final value instead.
 */
export function useCountUp(target: number, reducedMotion: boolean, duration = 1100): number {
  const [display, setDisplay] = useState(reducedMotion ? target : 0);
  const currentRef = useRef(0);
  const hasRunRef = useRef(false);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const from = hasRunRef.current ? currentRef.current : 0;
    hasRunRef.current = true;
    // Reduced motion: skip the tween by collapsing the animation to 0ms —
    // still routed through the same rAF callback below, so this effect
    // only ever schedules work rather than setting state synchronously.
    const effectiveDuration = reducedMotion ? 0 : duration;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = effectiveDuration === 0 ? 1 : Math.min(1, elapsed / effectiveDuration);
      const value = Math.round(from + (target - from) * easeOutCubic(progress));
      setDisplay(value);
      currentRef.current = value;
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        currentRef.current = target;
      }
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, reducedMotion, duration]);

  return display;
}
