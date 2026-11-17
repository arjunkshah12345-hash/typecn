import type { Metadata } from "next";
import { GalleryRoute } from "@/components/gallery-route";

export const metadata: Metadata = {
  title: "Explore 50 text animations",
  description: "Browse every typecn effect — reveals, kinetic type, distortion, scroll and pointer interactions, and cinematic sequences. Each card is a live React component.",
  alternates: { canonical: "/effects" },
};

export default function EffectsPage() {
  return (
    <div className="container-x pt-[120px] pb-24">
      <div className="mb-10 grid gap-6 md:grid-cols-12 md:items-end">
        <h1 className="display text-[clamp(56px,9vw,128px)] md:col-span-8">
          Fifty effects<span className="text-accent">.</span>
        </h1>
        <p className="max-w-[40ch] text-[17px] leading-relaxed text-muted md:col-span-4 md:justify-self-end">
          Fifty live effects in five families. Filter, search, hover to interact — then open one to make it yours.
        </p>
      </div>
      <GalleryRoute />
    </div>
  );
}
