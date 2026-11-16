"use client";
import { useRef } from "react";
import { Root, Split, unitStyle, useActive, useFrame, usePointer, useReducedMotion, useUnitLayout, type ContinuousEffectProps } from "../core";

export interface ProximityWeightProps extends ContinuousEffectProps {
  /** Weight far from the pointer. */
  minWeight?: number;
  /** Weight directly under the pointer. */
  maxWeight?: number;
  /** Radius of influence in px. */
  radius?: number;
  /** Falloff curve: `linear`, `smooth` or `sharp`. */
  falloff?: "linear" | "smooth" | "sharp";
}

/**
 * A weight lens: letters thicken as the pointer approaches and thin as it leaves,
 * driven continuously through the variable font's `wght` axis. With no pointer,
 * the lens wanders on its own.
 */
export function ProximityWeight(props: ProximityWeightProps) {
  const { text, className, style, as, minWeight = 150, maxWeight = 900, radius = 200, falloff = "smooth", paused, speed = 1 } = props;
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const active = useActive(ref, paused || reduced);
  const pointer = usePointer(ref, active);
  const layout = useUnitLayout(ref, [text]);
  const lens = useRef({ x: -9999, y: 0 });
  const cur = useRef<number[]>([]);

  useFrame(({ time }) => {
    const root = ref.current;
    if (!root) return;
    const p = pointer.current;
    const tx = p.inside ? p.x : ((Math.sin(time * 0.55) + 1) / 2) * root.offsetWidth;
    const ty = p.inside ? p.y : root.offsetHeight * (0.5 + Math.sin(time * 0.9) * 0.3);
    if (lens.current.x < -9000) lens.current = { x: tx, y: ty };
    lens.current.x += (tx - lens.current.x) * 0.1;
    lens.current.y += (ty - lens.current.y) * 0.1;
    const units = layout.current;
    if (cur.current.length !== units.length) cur.current = units.map(() => minWeight);
    units.forEach((u, i) => {
      const d = Math.hypot(u.cx - lens.current.x, u.cy - lens.current.y);
      let k = Math.max(0, 1 - d / radius);
      if (falloff === "smooth") k = k * k * (3 - 2 * k);
      else if (falloff === "sharp") k = k ** 3;
      const target = minWeight + (maxWeight - minWeight) * k;
      cur.current[i] += (target - cur.current[i]) * 0.25;
      u.el.style.fontWeight = String(Math.round(cur.current[i]));
    });
  }, active, speed);

  return (
    <Root as={as} text={text} className={className} style={style} rootRef={ref}>
      <Split text={text} char={(c) => <span data-tc-unit="" style={{ ...unitStyle, fontWeight: reduced ? undefined : minWeight }}>{c.char}</span>} />
    </Root>
  );
}
