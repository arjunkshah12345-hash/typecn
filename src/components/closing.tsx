import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MeshGradient } from "@/components/gradients/mesh-gradient";
import { DitherText } from "@/components/dithercn/dither-text";

/** hmm.css-style closing panel over a gradients.sh mesh, with a dithercn headline. */
export function Closing() {
  return (
    <section aria-labelledby="closing-title" className="container-x pt-8 pb-16">
      <div className="relative isolate flex min-h-[520px] flex-col items-center justify-center overflow-hidden rounded-[32px] border border-line px-6 py-20 text-center">
        <MeshGradient
          aria-hidden
          className="!absolute inset-0 -z-10 opacity-60"
          colors={["#ff5b24", "#8f9bff", "#ffb38a", "#2a1c5a"]}
          background="var(--bg)"
          speed={0.45}
          grain={0.25}
          blur={0.8}
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-[5] bg-[radial-gradient(55%_55%_at_50%_50%,var(--bg)_0%,transparent_100%)] opacity-85" />
        <p className="chip mb-6">Free · Open source · MIT</p>
        <h2 id="closing-title" className="display text-[clamp(52px,9vw,140px)]">
          <DitherText as="span" fill="gradient" color="ink" direction="down" from={1} to={0.35} bloom="low" className="block">
            Make it move.
          </DitherText>
        </h2>
        <p className="mt-6 max-w-[40ch] text-[17px] leading-relaxed text-muted">
          Fifty effects, one playground, and the source for all of it. Pick one and ship it tonight.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Link href="/effects" className="btn btn-accent">
            Browse effects <ArrowRight className="btn-arrow size-4" />
          </Link>
          <Link href="/docs" className="btn">
            Read the docs
          </Link>
        </div>
      </div>
    </section>
  );
}
