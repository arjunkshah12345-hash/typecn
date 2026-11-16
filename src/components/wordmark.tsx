"use client";

import { useState } from "react";

/**
 * The typecn wordmark. Letters sit at a light weight; on hover a weight wave
 * travels through them (variable font), and the cursor-like "n" blinks once.
 */
export function Wordmark({ className = "" }: { className?: string }) {
  const [hover, setHover] = useState(0);
  const letters = "typecn".split("");
  return (
    <span
      className={`inline-flex items-baseline font-serif leading-none tracking-[-0.03em] ${className}`}
      onPointerEnter={() => setHover((h) => h + 1)}
      onFocus={() => setHover((h) => h + 1)}
      aria-label="typecn"
    >
      {letters.map((l, i) => (
        <span
          key={`${hover}-${i}`}
          aria-hidden
          className="inline-block motion-safe-only"
          style={{
            fontVariationSettings: '"wght" 420, "SOFT" 100, "WONK" 1',
            animation: hover ? `wm-wave 900ms cubic-bezier(0.37,0,0.63,1) ${i * 55}ms both` : undefined,
          }}
        >
          {l}
        </span>
      ))}
      <span aria-hidden className="ml-[0.06em] inline-block h-[0.12em] w-[0.12em] translate-y-[-0.02em] rounded-full bg-accent" />
      <style>{`@keyframes wm-wave{0%{font-variation-settings:"wght" 420,"SOFT" 100,"WONK" 1;transform:translateY(0)}40%{font-variation-settings:"wght" 900,"SOFT" 0,"WONK" 1;transform:translateY(-0.08em)}100%{font-variation-settings:"wght" 420,"SOFT" 100,"WONK" 1;transform:translateY(0)}}`}</style>
    </span>
  );
}
