"use client";
import { useRef } from "react";
import { Root, Split, unitStyle, useActive, useFrame, usePointer, useReducedMotion, useUnitLayout, type ContinuousEffectProps } from "../core";

export interface CharacterTrackingProps extends ContinuousEffectProps {
  /** Tracking at the top of the element, in em. */
  minTracking?: number;
  /** Tracking at the bottom of the element, in em. */
  maxTracking?: number;
  /** Width of the gap that opens at the pointer, in em. */
  gap?: number;
}

/**
 * The pointer is a spacing tool. Vertical position sets overall tracking from tight
 * to airy; horizontally, a gap opens around the pointer, pushing letters aside like
 * a compositor inserting space by hand.
 */
export function CharacterTracking(props: CharacterTrackingProps) {
  const { text, className, style, as, minTracking = -0.06, maxTracking = 0.3, gap = 0.5, paused, speed = 1 } = props;
  const ref = useRef<HTMLElement>(null);
  const inner = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const active = useActive(ref, paused || reduced);
  const pointer = usePointer(ref, active);
  const layout = useUnitLayout(ref, [text]);
  const st = useRef({ track: 0, gx: 0, open: 0 });

  useFrame(({ time }) => {
    const root = ref.current;
    if (!root) return;
    const p = pointer.current;
    const s = st.current;
    const ty = p.inside ? (p.ny + 1) / 2 : (Math.sin(time * 0.5) + 1) / 2;
    const tt = minTracking + (maxTracking - minTracking) * ty;
    s.track += (tt - s.track) * 0.08;
    s.open += ((p.inside ? 1 : 0) - s.open) * 0.1;
    s.gx += ((p.inside ? p.x : s.gx) - s.gx) * 0.25;
    if (inner.current) inner.current.style.letterSpacing = `${s.track.toFixed(4)}em`;
    const fs = parseFloat(getComputedStyle(root).fontSize) || 16;
    layout.current.forEach((u) => {
      const dx = u.cx - s.gx;
      const f = Math.exp(-(dx * dx) / (2 * (fs * 1.2) ** 2));
      const push = Math.sign(dx) * f * gap * s.open;
      u.el.style.transform = push ? `translateX(${push.toFixed(3)}em)` : "";
    });
  }, active, speed);

  return (
    <Root as={as} text={text} className={className} style={style} rootRef={ref}>
      <span ref={inner} style={{ display: "inline-block" }}>
        <Split text={text} char={(c) => <span data-tc-unit="" style={unitStyle}>{c.char}</span>} />
      </span>
    </Root>
  );
}
