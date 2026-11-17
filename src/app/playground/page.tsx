import type { Metadata } from "next";
import { Playground } from "@/components/playground/playground";

export const metadata: Metadata = {
  title: "Playground",
  description: "Customize any of the 50 typecn text animations live — text, font, timing, easing and effect settings — then copy React or CSS, or share a link.",
  alternates: { canonical: "/playground" },
};

export default function PlaygroundPage() {
  return (
    <div className="pt-[84px]">
      <h1 className="sr-only">typecn playground</h1>
      <Playground slug="scramble-decode" mode="page" />
    </div>
  );
}
