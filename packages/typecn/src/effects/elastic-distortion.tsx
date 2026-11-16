"use client";
import { useRef } from "react";
import { Root, Split, unitStyle, useActive, useFrame, usePointer, useReducedMotion, useUnitLayout, type ContinuousEffectProps } from "../core";

export interface ElasticDistortionProps extends ContinuousEffectProps {
  /** Radius of influence in px. */
  radius?: number;
  /** Maximum stretch factor along the pull direction. */
  stretch?: number;
  /** Spring stiffness of the rubber. */
  stiffness?: number;
}

/**
 * Letters behave like rubber. Near the pointer each glyph is stretched along the
 * line toward it and squashed across it; when the pointer moves away the glyph
 * snaps back and wobbles. Press to grab harder.
 */
export function ElasticDistortion(props: ElasticDistortionProps) {
  const { text, className, style, as, radius = 180, stretch = 0.7, stiffness = 0.16, paused, speed = 1 } = props;
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const active = useActive(ref, paused || reduced);
  const pointer = usePointer(ref, active);
  const layout = useUnitLayout(ref, [text]);
  const sim = useRef<{ k: number; v: number; ang: number }[]>([]);
  const down = useRef(false);

  useFrame(() => {
    const p = pointer.current;
    const units = layout.current;
    if (sim.current.length !== units.length) sim.current = units.map(() => ({ k: 0, v: 0, ang: 0 }));
    const power = down.current ? 1.8 : 1;
    units.forEach((u, i) => {
      const s = sim.current[i];
      let target = 0;
      if (p.seen) {
        const dx = p.x - u.cx;
        const dy = p.y - u.cy;
        const d = Math.hypot(dx, dy);
        if (d < radius) {
          target = (1 - d / radius) * stretch * power;
          s.ang = Math.atan2(dy, dx);
        }
      }
      s.v = (s.v + (target - s.k) * stiffness) * 0.8;
      s.k += s.v;
      const deg = (s.ang * 180) / Math.PI;
      const sx = 1 + s.k;
      const sy = 1 / Math.sqrt(sx);
      u.el.style.transform = Math.abs(s.k) < 0.001 ? "" : `rotate(${deg.toFixed(1)}deg) scale(${sx.toFixed(3)}, ${sy.toFixed(3)}) rotate(${(-deg).toFixed(1)}deg)`;
    });
  }, active, speed);

  return (
    <Root
      as={as}
      text={text}
      className={className}
      style={{ touchAction: "pan-y", ...style }}
      rootRef={ref}
      attrs={{
        onPointerDown: () => (down.current = true),
        onPointerUp: () => (down.current = false),
        onPointerLeave: () => (down.current = false),
      }}
    >
      <Split text={text} char={(c) => <span data-tc-unit="" style={unitStyle}>{c.char}</span>} />
    </Root>
  );
}
