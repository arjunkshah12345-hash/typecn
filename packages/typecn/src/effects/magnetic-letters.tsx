"use client";
import { useRef } from "react";
import { Root, Split, unitStyle, useActive, useFrame, usePointer, useReducedMotion, useUnitLayout, type TextEffectProps } from "../core";

export interface MagneticLettersProps extends TextEffectProps {
  /** Radius of influence in px. */
  radius?: number;
  /** How far letters lean toward the pointer, 0–1. */
  strength?: number;
  /** Spring stiffness of the return. */
  stiffness?: number;
  /** Spring damping (0–1, higher settles faster). */
  damping?: number;
  paused?: boolean;
}

/**
 * Every letter is a tiny spring anchored to its home position. Within the radius the
 * pointer pulls it closer and scales it up; released letters wobble back.
 */
export function MagneticLetters(props: MagneticLettersProps) {
  const { text, className, style, as, radius = 140, strength = 0.45, stiffness = 0.12, damping = 0.78, paused } = props;
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const active = useActive(ref, paused || reduced);
  const pointer = usePointer(ref, active);
  const layout = useUnitLayout(ref, [text]);
  const state = useRef<{ x: number; y: number; vx: number; vy: number }[]>([]);

  useFrame(() => {
    const p = pointer.current;
    const units = layout.current;
    if (state.current.length !== units.length) state.current = units.map(() => ({ x: 0, y: 0, vx: 0, vy: 0 }));
    units.forEach((u, i) => {
      const s = state.current[i];
      let tx = 0;
      let ty = 0;
      if (p.seen) {
        const dx = p.x - u.cx;
        const dy = p.y - u.cy;
        const d = Math.hypot(dx, dy);
        if (d < radius) {
          const f = (1 - d / radius) ** 2 * strength;
          tx = dx * f;
          ty = dy * f;
        }
      }
      s.vx = (s.vx + (tx - s.x) * stiffness) * damping;
      s.vy = (s.vy + (ty - s.y) * stiffness) * damping;
      s.x += s.vx;
      s.y += s.vy;
      const pull = Math.min(Math.hypot(s.x, s.y) / 40, 1);
      u.el.style.transform = `translate3d(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px, 0) scale(${(1 + pull * 0.18).toFixed(3)}) rotate(${(s.vx * 0.8).toFixed(2)}deg)`;
    });
  }, active);

  return (
    <Root as={as} text={text} className={className} style={{ touchAction: "pan-y", ...style }} rootRef={ref}>
      <Split text={text} char={(c) => <span data-tc-unit="" style={unitStyle}>{c.char}</span>} />
    </Root>
  );
}
