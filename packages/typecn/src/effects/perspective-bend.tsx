"use client";
import { useRef } from "react";
import { Root, Split, unitStyle, useActive, useFrame, usePointer, useReducedMotion, useUnitLayout, type ContinuousEffectProps } from "../core";

export interface PerspectiveBendProps extends ContinuousEffectProps {
  /** Maximum surface curvature in degrees at the line ends. */
  bend?: number;
  /** Maximum tilt of the whole block, in degrees. */
  tilt?: number;
  /** Perspective distance in px. */
  perspective?: number;
}

/**
 * Type printed on a flexible sheet. Each character is rotated and pushed back
 * according to its position on a curved surface; the pointer bends and tilts the sheet.
 */
export function PerspectiveBend(props: PerspectiveBendProps) {
  const { text, className, style, as, bend = 40, tilt = 18, perspective = 900, paused, speed = 1 } = props;
  const ref = useRef<HTMLElement>(null);
  const inner = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const active = useActive(ref, paused || reduced);
  const pointer = usePointer(ref, active);
  const layout = useUnitLayout(ref, [text]);
  const s = useRef({ b: 0, rx: 0, ry: 0 });

  useFrame(({ time }) => {
    const root = ref.current;
    if (!root) return;
    const p = pointer.current;
    const tb = p.inside ? p.ny * -1 : Math.sin(time * 0.6) * 0.6;
    const trx = p.inside ? p.ny * tilt : Math.sin(time * 0.45) * tilt * 0.4;
    const tryy = p.inside ? p.nx * tilt : Math.cos(time * 0.38) * tilt * 0.5;
    const st = s.current;
    st.b += (tb - st.b) * 0.08;
    st.rx += (trx - st.rx) * 0.08;
    st.ry += (tryy - st.ry) * 0.08;
    if (inner.current) inner.current.style.transform = `rotateX(${(-st.rx).toFixed(2)}deg) rotateY(${st.ry.toFixed(2)}deg)`;
    const w = root.offsetWidth || 1;
    const R = w / 2;
    layout.current.forEach((u) => {
      const x = (u.cx - w / 2) / R; // -1..1
      const ang = x * bend * st.b;
      const z = -(Math.abs(x) ** 2) * bend * st.b * 3;
      u.el.style.transform = `translateZ(${z.toFixed(1)}px) rotateY(${(-ang).toFixed(2)}deg)`;
    });
  }, active, speed);

  return (
    <Root as={as} text={text} className={className} style={{ perspective, ...style }} rootRef={ref}>
      <span ref={inner} style={{ display: "inline-block", transformStyle: "preserve-3d" }}>
        <Split text={text} wordStyle={{ transformStyle: "preserve-3d" }} char={(c) => <span data-tc-unit="" style={unitStyle}>{c.char}</span>} />
      </span>
    </Root>
  );
}
