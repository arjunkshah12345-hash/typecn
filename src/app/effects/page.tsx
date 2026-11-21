import type { Metadata } from "next";
import { GalleryRoute } from "@/components/gallery-route";
import { effects } from "@/registry/effects";
import { categories } from "@/registry/types";

export const metadata: Metadata = {
  title: "Explore 50 text animations",
  description: "Browse every typecn effect — reveals, kinetic type, distortion, scroll and pointer interactions, and cinematic sequences. Each card is a live React component.",
  alternates: { canonical: "/effects" },
};

export default function EffectsPage() {
  return (
    <div className="container-x pt-[108px] pb-24 sm:pt-[124px]">
      <div className="label flex items-center justify-between gap-4 border-b border-line-strong pb-3 text-muted">
        <span>The catalogue</span>
        <span className="hidden sm:inline">N° 01 — {String(effects.length).padStart(2, "0")}</span>
      </div>

      <div className="grid gap-8 py-[clamp(32px,5vw,72px)] md:grid-cols-12 md:items-end">
        <h1 className="display text-[clamp(56px,9vw,136px)] md:col-span-7">
          Every effect, <em>live</em>
          <span className="text-accent">.</span>
        </h1>
        <div className="md:col-span-5 md:pb-3">
          <p className="max-w-[42ch] text-[17px] leading-relaxed text-pretty text-muted">
            Each entry below is the real component, running. Hover to play with it, then open it to tune and copy the source.
          </p>
          <ul className="mt-6 border-t border-line">
            {categories.map((c) => (
              <li key={c.id} className="flex items-baseline justify-between gap-2 border-b border-line py-1.5 text-[14px]">
                <span className="truncate">
                  <span className="mr-3 font-mono text-[11px] text-faint">{c.letter}</span>
                  {c.name}
                </span>
                <span className="font-mono text-[11px] tabular-nums text-faint">{effects.filter((e) => e.category === c.id).length}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <GalleryRoute />
    </div>
  );
}
