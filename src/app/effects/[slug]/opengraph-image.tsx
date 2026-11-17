import { ImageResponse } from "next/og";
import { effects, effectBySlug } from "@/registry/effects";
import { OgFrame, ogFonts, ogSize } from "@/lib/og";

export const alt = "typecn effect";
export const size = ogSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return effects.map((e) => ({ slug: e.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = effectBySlug[slug];
  return new ImageResponse(<OgFrame kicker={`<${e.component} />`} number={String(e.number).padStart(2, "0")} title={e.name} sub={e.tagline} />, { ...size, fonts: ogFonts() });
}

export const dynamic = "force-static";
