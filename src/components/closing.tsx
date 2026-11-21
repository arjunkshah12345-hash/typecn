"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { effectBySlug, defaultProps } from "@/registry/effects";
import { EffectRenderer, defaultTypography } from "./effect-renderer";

const meta = effectBySlug["blur-resolve"];

/** Colophon-style close: one last line set in a real effect, then the two ways in. */
export function Closing() {
  return (
    <section aria-labelledby="closing-title" className="container-x pt-8 pb-24 sm:pb-32">
      <div className="label flex items-center justify-between gap-4 border-b border-line-strong pb-3 text-muted">
        <span>
          <span className="mr-3 text-faint">§ 05</span>Colophon
        </span>
        <span className="hidden sm:inline">Free · Open source · MIT</span>
      </div>
      <h2 id="closing-title" className="sr-only">
        Make it move.
      </h2>
      <div className="py-[clamp(48px,8vw,120px)] text-center">
        <EffectRenderer
          meta={meta}
          text="Make it move."
          values={defaultProps(meta)}
          typography={{ ...defaultTypography(meta), font: "serif", size: "clamp(64px, 11vw, 184px)", weight: 300, tracking: -0.045, leading: 0.95 }}
          style={{ display: "block", fontVariationSettings: '"opsz" 144, "SOFT" 30' }}
          extra={{ as: "p", trigger: "inView", loop: false }}
        />
        <p className="mx-auto mt-8 max-w-[40ch] text-[17px] leading-relaxed text-pretty text-muted">
          Fifty effects, one playground, and the source for all of it. Pick one and ship it tonight.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Link href="/effects" className="btn btn-accent">
            Browse effects <ArrowRight className="btn-arrow size-4" strokeWidth={1.75} />
          </Link>
          <Link href="/docs" className="btn">
            Read the docs
          </Link>
        </div>
      </div>
    </section>
  );
}
