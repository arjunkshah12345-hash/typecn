"use client";
import { useRef } from "react";
import { Root, Split, unitStyle, useActive, useFrame, usePointer, useReducedMotion, useUnitLayout, type ContinuousEffectProps } from "../core";

export interface StretchTypeProps extends ContinuousEffectProps {
  /** Narrowest font-stretch (%). */
  minWidth?: number;
  /** Widest font-stretch (%). */
  maxWidth?: number;
  /** Radius of the pointer's influence in px. */
  radius?: number;
  /** Also stretch vertically via transform. */
  vertical?: boolean;
}

/**
 * Letters under the pointer expand to their widest cut while their neighbours
 * compress to make room, using the variable font's width axis. Without a pointer,
 * a lens drifts across on its own. Needs a font with a `wdth` axis.
 */
export function StretchType(props: StretchTypeProps) {
  const { text, className, style, as, minWidth = 60, maxWidth = 150, radius = 160, vertical = true, paused, speed = 1 } = props;
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const active = useActive(ref, paused || reduced);
  const pointer = usePointer(ref, active);
  const layout = useUnitLayout(ref, [text]);
  const lens = useRef({ x: 0, y: 0 });
  const cur = useRef<number[]>([]);

  useFrame(({ time }) => {
    const root = ref.current;
    if (!root) return;
    const p = pointer.current;
    const w = root.offsetWidth;
    const tx = p.inside ? p.x : ((Math.sin(time * 0.7) + 1) / 2) * w;
    const ty = p.inside ? p.y : root.offsetHeight / 2;
    lens.current.x += (tx - lens.current.x) * 0.12;
    lens.current.y += (ty - lens.current.y) * 0.12;
    const units = layout.current;
    if (cur.current.length !== units.length) cur.current = units.map(() => 100);
    units.forEach((u, i) => {
      const d = Math.hypot(u.cx - lens.current.x, (u.cy - lens.current.y) * 1.5);
      const k = Math.max(0, 1 - d / radius);
      const target = minWidth + (maxWidth - minWidth) * (k * k * (3 - 2 * k));
      cur.current[i] += (target - cur.current[i]) * 0.2;
      const v = cur.current[i];
      u.el.style.fontStretch = `${v.toFixed(1)}%`;
      if (vertical) u.el.style.transform = `scaleY(${(1 + (v - 100) / 600).toFixed(3)})`;
    });
  }, active, speed);

  return (
    <Root as={as} text={text} className={className} style={style} rootRef={ref}>
      <Split text={text} char={(c) => <span data-tc-unit="" style={{ ...unitStyle, transformOrigin: "50% 100%" }}>{c.char}</span>} />
    </Root>
  );
}
