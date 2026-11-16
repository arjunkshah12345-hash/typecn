"use client";
import { useRef, type CSSProperties } from "react";
import { Root, Split, useActive, useFrame, usePointer, useReducedMotion, type ContinuousEffectProps } from "../core";

export interface ChromaticSplitProps extends ContinuousEffectProps {
  /** Maximum channel separation in em. */
  maxShift?: number;
  /** How strongly motion converts into separation. */
  sensitivity?: number;
  colorA?: string;
  colorB?: string;
  /** Blend mode for the ghost channels — `screen` on dark backgrounds, `multiply` on light. */
  blend?: "screen" | "multiply" | "normal";
}

/**
 * Motion tears colour apart. Pointer and scroll velocity push two colour channels
 * away from the type along the direction of travel; they spring back when you stop.
 */
export function ChromaticSplit(props: ChromaticSplitProps) {
  const { text, className, style, as, maxShift = 0.14, sensitivity = 1, colorA = "#ff3b30", colorB = "#00d1ff", blend = "normal", paused, speed = 1 } = props;
  const ref = useRef<HTMLElement>(null);
  const a = useRef<HTMLSpanElement>(null);
  const b = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const active = useActive(ref, paused || reduced);
  const pointer = usePointer(ref, active);
  const st = useRef({ x: 0, y: 0, vx: 0, vy: 0, lastScroll: 0 });

  useFrame(({ time }) => {
    const p = pointer.current;
    const s = st.current;
    const sy = typeof window !== "undefined" ? window.scrollY : 0;
    const scrollV = sy - s.lastScroll;
    s.lastScroll = sy;
    const idle = Math.sin(time * 1.3) * 0.12;
    const tx = (p.vx * 0.02 + idle * 0.3) * sensitivity;
    const ty = (p.vy * 0.02 + scrollV * 0.02) * sensitivity;
    s.vx = (s.vx + (tx - s.x) * 0.18) * 0.72;
    s.vy = (s.vy + (ty - s.y) * 0.18) * 0.72;
    s.x += s.vx;
    s.y += s.vy;
    p.vx *= 0.85;
    p.vy *= 0.85;
    const cl = (v: number) => Math.max(-maxShift, Math.min(maxShift, v * maxShift));
    const x = cl(s.x);
    const y = cl(s.y);
    if (a.current) a.current.style.transform = `translate(${x.toFixed(4)}em, ${y.toFixed(4)}em)`;
    if (b.current) b.current.style.transform = `translate(${(-x).toFixed(4)}em, ${(-y).toFixed(4)}em)`;
  }, active, speed);

  const ghost: CSSProperties = { position: "absolute", inset: 0, mixBlendMode: blend, pointerEvents: "none" };
  return (
    <Root as={as} text={text} className={className} style={{ isolation: "isolate", ...style }} rootRef={ref}>
      <span ref={a} style={{ ...ghost, color: colorA }}>
        <Split text={text} />
      </span>
      <span ref={b} style={{ ...ghost, color: colorB }}>
        <Split text={text} />
      </span>
      <span style={{ position: "relative", display: "block" }}>
        <Split text={text} />
      </span>
    </Root>
  );
}
