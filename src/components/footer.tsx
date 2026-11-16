"use client";

import Link from "next/link";
import { useState } from "react";
import { effectBySlug, defaultProps } from "@/registry/effects";
import { site } from "@/lib/site";
import { EffectRenderer, defaultTypography } from "./effect-renderer";

/** Effects the footer wordmark can wear. Click it to cycle — the surprise. */
const wardrobe = [
  "proximity-weight",
  "cursor-repel",
  "elastic-distortion",
  "liquid-type",
  "glitch-shift",
  "stacked-echo",
  "character-explosion",
  "depth-type",
  "magnetic-letters",
  "jitter",
  "hover-shuffle",
  "breathing-type",
  "chromatic-split",
  "pendulum-type",
];

export function Footer() {
  const [i, setI] = useState(0);
  const meta = effectBySlug[wardrobe[i % wardrobe.length]];
  const next = () => setI((v) => v + 1);
  return (
    <footer className="relative overflow-hidden border-t border-line">
      <div className="container-x grid gap-10 pt-16 pb-6 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="font-serif text-[28px] leading-[1.05] tracking-[-0.02em] text-balance">
            Fifty ways for words to move. <span className="italic text-muted">Free, open source, and yours to bend.</span>
          </p>
        </div>
        <div className="grid grid-cols-2 gap-6 text-sm md:col-span-6 md:col-start-7 md:grid-cols-3">
          <FooterCol title="Library" links={[["Explore", "/effects"], ["Playground", "/playground"], ["Getting started", "/docs"], ["Installation", "/docs/installation"]]} />
          <FooterCol title="Craft" links={[["Animation principles", "/docs/animation-principles"], ["Accessibility", "/docs/accessibility"], ["Performance", "/docs/performance"], ["Browser support", "/docs/browser-support"]]} />
          <FooterCol title="Project" links={[["GitHub", site.repo], ["Contributing", "/docs/contributing"], ["License (MIT)", `${site.repo}/blob/main/LICENSE`]]} />
        </div>
      </div>

      <div className="container-x relative">
        <button
          type="button"
          onClick={next}
          className="group relative block w-full cursor-pointer text-left"
          aria-label="typecn — click to change the effect"
        >
          <span className="label absolute top-2 right-0 z-10 flex items-center gap-2 text-muted">
            <span className="dot-live" /> Nº {String(meta.number).padStart(2, "0")} {meta.name} — click to change
          </span>
          <span className="block select-none pt-8 pb-2" style={{ minHeight: "clamp(140px, 27vw, 420px)" }}>
            <EffectRenderer
              key={meta.slug + i}
              meta={meta}
              text="typecn"
              values={{ ...defaultProps(meta), ...(meta.kind === "timed" ? { loop: true } : {}) }}
              typography={{ ...defaultTypography(meta), font: meta.font === "mono" ? "mono" : meta.slug === "breathing-type" || meta.slug === "stacked-echo" || meta.slug === "depth-type" ? "wide" : "serif", size: "clamp(96px, 24vw, 380px)", tracking: -0.05, leading: 0.9, weight: 600 }}
              style={{ display: "block" }}
            />
          </span>
        </button>
      </div>

      <div className="container-x flex flex-col gap-2 border-t border-line py-5 text-xs text-muted sm:flex-row sm:justify-between">
        <span>© {new Date().getFullYear()} typecn contributors · MIT License</span>
        <span>
          Set in Fraunces, Bricolage Grotesque, Anybody &amp; JetBrains Mono — all SIL Open Font License.
        </span>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="label mb-3 text-faint">{title}</p>
      <ul className="space-y-1.5">
        {links.map(([l, h]) => (
          <li key={l}>
            {h.startsWith("http") ? (
              <a href={h} target="_blank" rel="noreferrer" className="ulink text-muted hover:text-fg">
                {l} ↗
              </a>
            ) : (
              <Link href={h} className="ulink text-muted hover:text-fg">
                {l}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
