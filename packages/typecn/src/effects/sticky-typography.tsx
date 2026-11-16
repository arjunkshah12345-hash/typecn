"use client";
import { useEffect, useRef, useState } from "react";
import { Root, Split, clamp, getScrollRoot, useReducedMotion, useScrollProgress, useIsoLayoutEffect, type TextEffectProps } from "../core";

export interface StickyTypographyProps extends TextEffectProps {
  /** Scroll distance of the pinned section, in viewport heights. */
  distance?: number;
  /** Starting scale of the type — it shrinks to 1 as you scroll. */
  fromScale?: number;
  /** Colour the panel inverts to in the middle act. Leave empty to skip. */
  invertColor?: string;
  /** Drive progress manually (0–1). The component then renders as a single panel. */
  progress?: number;
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const seg = (p: number, a: number, b: number) => ease(clamp((p - a) / (b - a)));

/**
 * A pinned editorial sequence in three acts: an oversized word zooms out to fit,
 * the lines shear apart while the panel inverts, then everything compresses away.
 * Renders a tall scroll track with a sticky stage.
 */
export function StickyTypography(props: StickyTypographyProps) {
  const { text, className, style, as = "div", distance = 3, fromScale = 4, invertColor, progress } = props;
  const ref = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [vh, setVh] = useState<number | null>(null);
  const controlled = progress !== undefined;

  useEffect(() => {
    if (controlled) return;
    const root = getScrollRoot(ref.current);
    const measure = () => setVh(root ? root.clientHeight : window.innerHeight);
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [controlled]);

  const apply = (p: number) => {
    const s = stage.current;
    if (!s) return;
    const inner = s.querySelector<HTMLElement>("[data-tc-inner]");
    const lines = s.querySelectorAll<HTMLElement>("[data-tc-line]");
    const a1 = seg(p, 0, 0.4);
    const a2 = seg(p, 0.4, 0.7);
    const a3 = seg(p, 0.75, 1);
    const scale = fromScale + (1 - fromScale) * a1;
    if (inner) {
      inner.style.transform = `scale(${(scale * (1 - a3 * 0.6)).toFixed(4)}) scaleY(${(1 - a3 * 0.5).toFixed(3)})`;
      inner.style.opacity = String(1 - a3 * 0.9);
      inner.style.letterSpacing = `${((1 - a1) * 0.08 - a2 * 0.02).toFixed(3)}em`;
    }
    lines.forEach((l, i) => {
      const dir = i % 2 ? 1 : -1;
      l.style.transform = `translateX(${(dir * Math.sin(a2 * Math.PI) * 12).toFixed(2)}%) skewX(${(dir * Math.sin(a2 * Math.PI) * -8).toFixed(2)}deg)`;
    });
    if (invertColor) {
      const inv = Math.sin(a2 * Math.PI) > 0.5;
      s.style.background = inv ? invertColor : "";
      s.style.color = inv ? "var(--tc-invert-ink, #fff)" : "";
    }
  };

  useScrollProgress(ref, apply, { enabled: !controlled && !reduced, mode: "pinned" });
  useIsoLayoutEffect(() => {
    if (controlled) apply(progress!);
    else if (reduced) apply(0.4);
  });

  const stageH = controlled ? "100%" : vh ? `${vh}px` : "100vh";
  const trackH = controlled ? "100%" : vh ? `${vh * distance}px` : `${distance * 100}vh`;
  return (
    <Root as={as} text={text} className={className} style={{ height: trackH, width: "100%", ...style }} rootRef={ref} display="block">
      <div
        ref={stage}
        style={{
          position: controlled ? "relative" : "sticky",
          top: 0,
          height: stageH,
          display: "grid",
          placeItems: "center",
          overflow: "hidden",
          transition: "background 300ms, color 300ms",
        }}
      >
        <div data-tc-inner="" style={{ textAlign: "center", transformOrigin: "50% 50%", willChange: "transform" }}>
          <Split text={text} line={(l) => <span data-tc-line="" style={{ display: "block" }}>{l.children}</span>} />
        </div>
      </div>
    </Root>
  );
}
