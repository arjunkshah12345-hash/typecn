"use client";
import { useRef, type CSSProperties } from "react";
import { Root, Split, seeded, useActive, useFrame, useReducedMotion, type ContinuousEffectProps } from "../core";

export interface GlitchShiftProps extends ContinuousEffectProps {
  /** Max horizontal displacement in em. */
  intensity?: number;
  /** Average glitch bursts per second. */
  frequency?: number;
  /** Colour of the left channel ghost. */
  colorA?: string;
  /** Colour of the right channel ghost. */
  colorB?: string;
}

/**
 * Mostly still, then a burst: the type tears into offset slices while red/cyan
 * channel ghosts jump apart. Bursts are short and irregular, like a bad signal.
 */
export function GlitchShift(props: GlitchShiftProps) {
  const { text, className, style, as, intensity = 0.12, frequency = 0.7, colorA = "#ff2d55", colorB = "#00e5ff", paused, speed = 1 } = props;
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const active = useActive(ref, paused || reduced);
  const st = useRef({ until: 0, next: 0.6, frame: -1 });

  useFrame(({ time }) => {
    const root = ref.current;
    if (!root) return;
    const s = st.current;
    const [base, a, b] = Array.from(root.querySelectorAll<HTMLElement>("[data-tc-layer]"));
    if (!base) return;
    if (time > s.next) {
      s.until = time + 0.12 + Math.random() * 0.28;
      s.next = s.until + (Math.random() * 2 + 0.2) / Math.max(frequency, 0.05);
    }
    const on = time < s.until;
    const f = Math.floor(time * 24);
    if (f === s.frame) return;
    s.frame = f;
    if (!on) {
      base.style.clipPath = "";
      base.style.transform = "";
      a.style.opacity = b.style.opacity = "0";
      return;
    }
    const r = seeded(f * 7 + 3);
    const top = r() * 80;
    const h = 6 + r() * 30;
    const dx = (r() * 2 - 1) * intensity;
    base.style.transform = `translateX(${(dx * 0.3).toFixed(3)}em)`;
    a.style.opacity = b.style.opacity = "0.9";
    a.style.transform = `translateX(${(-intensity * (0.4 + r())).toFixed(3)}em)`;
    b.style.transform = `translateX(${(intensity * (0.4 + r())).toFixed(3)}em)`;
    a.style.clipPath = `inset(${top.toFixed(1)}% 0 ${Math.max(0, 100 - top - h).toFixed(1)}% 0)`;
    b.style.clipPath = `inset(${(100 - top - h).toFixed(1)}% 0 ${top.toFixed(1)}% 0)`;
    base.style.clipPath = r() > 0.5 ? `polygon(0 0, 100% 0, 100% ${top}%, ${(dx * 40).toFixed(1)}% ${top}%, ${(dx * 40).toFixed(1)}% ${top + h}%, 100% ${top + h}%, 100% 100%, 0 100%)` : "";
  }, active, speed);

  const ghost: CSSProperties = { position: "absolute", inset: 0, opacity: 0, pointerEvents: "none", mixBlendMode: "normal" };
  return (
    <Root as={as} text={text} className={className} style={style} rootRef={ref}>
      <span data-tc-layer="" style={{ display: "block", position: "relative", zIndex: 1 }}>
        <Split text={text} />
      </span>
      <span data-tc-layer="" style={{ ...ghost, color: colorA }}>
        <Split text={text} />
      </span>
      <span data-tc-layer="" style={{ ...ghost, color: colorB }}>
        <Split text={text} />
      </span>
    </Root>
  );
}
