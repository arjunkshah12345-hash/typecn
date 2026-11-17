"use client";

import { useState } from "react";

/** 4×4 Bayer-ish pixel mark that reshuffles on hover, plus the name in Geist. */
const frames = ["1010010110100101", "1101101001011011", "0110100110010110"];

export function LogoMark({ className = "" }: { className?: string }) {
  const [f, setF] = useState(0);
  return (
    <span
      aria-hidden
      className={`grid size-[1em] shrink-0 grid-cols-4 gap-[1px] ${className}`}
      onPointerEnter={() => setF((v) => (v + 1) % frames.length)}
    >
      {frames[f].split("").map((b, i) => (
        <span
          key={i}
          className="rounded-[1px] transition-[background-color,opacity] duration-300"
          style={{ background: b === "1" ? "var(--accent)" : "var(--fg)", opacity: b === "1" ? 1 : 0.14, transitionDelay: `${(i % 4) * 25}ms` }}
        />
      ))}
    </span>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-sans font-semibold leading-none tracking-[-0.04em] ${className}`} aria-label="typecn">
      <LogoMark className="text-[0.92em]" />
      <span aria-hidden>typecn</span>
    </span>
  );
}
