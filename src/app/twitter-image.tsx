import { ImageResponse } from "next/og";
import { OgFrame, ogFonts, ogSize } from "@/lib/og";

export const alt = "typecn — Typography that moves. 50 open-source text animations for React.";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(<OgFrame kicker="Open-source kinetic typography" title="Words should move." sub="50 open-source text animations for React. Find one. Make it yours. Ship it." />, { ...size, fonts: ogFonts() });
}
