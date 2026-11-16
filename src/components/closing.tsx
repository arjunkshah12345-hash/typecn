"use client";

import Link from "next/link";
import { StickyTypography, TextMarquee } from "typecn";

/** The launch-recording moment: a pinned, scroll-scrubbed headline, then a marquee band. */
export function Closing() {
  return (
    <section aria-label="Closing" className="relative">
      <StickyTypography
        as="div"
        text={"NOW\nMAKE IT\nMOVE."}
        distance={3.2}
        fromScale={5}
        invertColor="#ff5a1f"
        style={{ fontFamily: "var(--font-wide)", fontWeight: 900, fontSize: "clamp(72px, 16vw, 260px)", lineHeight: 0.86, letterSpacing: "-0.02em", fontStretch: "125%" }}
      />
      <div className="border-y border-line bg-accent py-5 text-[#120a06]">
        <TextMarquee
          text="Typography that moves · 50 effects · open source · ready to ship"
          velocity={70}
          separator="✳"
          style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(40px, 6vw, 96px)", fontStyle: "italic", letterSpacing: "-0.03em", lineHeight: 1.05 }}
        />
      </div>
      <div className="container-x grid gap-8 py-24 md:grid-cols-12 md:items-end">
        <p className="font-serif text-[clamp(40px,5.4vw,84px)] leading-[0.95] tracking-[-0.035em] md:col-span-8 text-balance">
          Find one. <span className="italic text-muted">Make it yours.</span> Ship it tonight.
        </p>
        <div className="flex flex-wrap gap-2 md:col-span-4 md:justify-end">
          <Link href="/playground" className="btn btn-accent">
            Start experimenting <span className="btn-arrow">→</span>
          </Link>
          <Link href="/docs" className="btn">
            Read the docs <span className="btn-arrow">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
