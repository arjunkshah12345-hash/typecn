import { ImageResponse } from "next/og";
import { OgFrame, ogFonts, ogSize } from "@/lib/og";

export const alt = "typecn — Typography that moves. 50 open-source text animations for React.";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(<OgFrame kicker="50 effects · shadcn registry · MIT" title="Type that moves." sub="50 open-source text animations for React. Tune one, then install it as code you own." />, { ...size, fonts: ogFonts() });
}

export const dynamic = "force-static";
