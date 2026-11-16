"use client";
import { useRef } from "react";
import { Root, Split, unitStyle, useActive, useFrame, usePointer, useReducedMotion, useUnitLayout, type TextEffectProps } from "../core";

export interface CursorRepelProps extends TextEffectProps {
  /** Radius of the force field in px. */
  radius?: number;
  /** Strength of the push. */
  force?: number;
  /** Return spring stiffness. */
  stiffness?: number;
  /** Friction (0–1); lower values glide longer. */
  friction?: number;
  paused?: boolean;
}

/**
 * Letters are particles anchored by springs. The pointer emits a repulsive field
 * that shoves them aside — they spin with the impact and drift home.
 */
export function CursorRepel(props: CursorRepelProps) {
  const { text, className, style, as, radius = 120, force = 1.4, stiffness = 0.05, friction = 0.86, paused } = props;
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const active = useActive(ref, paused || reduced);
  const pointer = usePointer(ref, active);
  const layout = useUnitLayout(ref, [text]);
  const sim = useRef<{ x: number; y: number; vx: number; vy: number; r: number }[]>([]);

  useFrame(() => {
    const p = pointer.current;
    const units = layout.current;
    if (sim.current.length !== units.length) sim.current = units.map(() => ({ x: 0, y: 0, vx: 0, vy: 0, r: 0 }));
    units.forEach((u, i) => {
      const s = sim.current[i];
      if (p.seen && p.inside) {
        const dx = u.cx + s.x - p.x;
        const dy = u.cy + s.y - p.y;
        const d = Math.hypot(dx, dy) || 1;
        if (d < radius) {
          const f = ((radius - d) / radius) ** 2 * force * 6;
          s.vx += (dx / d) * f;
          s.vy += (dy / d) * f;
        }
      }
      s.vx += -s.x * stiffness;
      s.vy += -s.y * stiffness;
      s.vx *= friction;
      s.vy *= friction;
      s.x += s.vx;
      s.y += s.vy;
      s.r = s.x * 0.6;
      u.el.style.transform =
        Math.abs(s.x) + Math.abs(s.y) < 0.05 ? "" : `translate3d(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px, 0) rotate(${s.r.toFixed(1)}deg)`;
    });
  }, active);

  return (
    <Root as={as} text={text} className={className} style={{ touchAction: "pan-y", ...style }} rootRef={ref}>
      <Split text={text} char={(c) => <span data-tc-unit="" style={unitStyle}>{c.char}</span>} />
    </Root>
  );
}
