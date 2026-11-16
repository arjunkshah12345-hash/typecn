"use client";
import { useRef } from "react";
import { Root, Split, useActive, useFrame, usePointer, useReducedMotion, type ContinuousEffectProps } from "../core";

export interface DepthTypeProps extends ContinuousEffectProps {
  /** Number of stacked layers. */
  layers?: number;
  /** Distance between layers in px. */
  spacing?: number;
  /** Maximum camera rotation in degrees. */
  angle?: number;
  /** Colour of the deepest layer; layers blend from text colour toward it. */
  depthColor?: string;
}

/**
 * The phrase is extruded into a stack of layers in real 3D space. The pointer
 * steers a virtual camera around the block; without a pointer it orbits slowly.
 */
export function DepthType(props: DepthTypeProps) {
  const { text, className, style, as, layers = 12, spacing = 3, angle = 28, depthColor = "#ff5a1f", paused, speed = 1 } = props;
  const ref = useRef<HTMLElement>(null);
  const cam = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const active = useActive(ref, paused || reduced);
  const pointer = usePointer(ref, active);
  const st = useRef({ rx: 0, ry: 0 });

  useFrame(({ time }) => {
    const p = pointer.current;
    const s = st.current;
    const tx = p.inside ? -p.ny * angle : Math.sin(time * 0.5) * angle * 0.5;
    const ty = p.inside ? p.nx * angle : Math.cos(time * 0.4) * angle * 0.8;
    s.rx += (tx - s.rx) * 0.07;
    s.ry += (ty - s.ry) * 0.07;
    if (cam.current) cam.current.style.transform = `rotateX(${s.rx.toFixed(2)}deg) rotateY(${s.ry.toFixed(2)}deg)`;
  }, active, speed);

  const n = Math.max(2, layers);
  return (
    <Root as={as} text={text} className={className} style={{ perspective: 800, ...style }} rootRef={ref}>
      <span ref={cam} style={{ display: "block", position: "relative", transformStyle: "preserve-3d", transform: `rotateX(10deg) rotateY(-18deg)` }}>
        {Array.from({ length: n }, (_, i) => {
          const k = i / (n - 1);
          const front = i === 0;
          return (
            <span
              key={i}
              style={{
                display: "block",
                position: front ? "relative" : "absolute",
                inset: front ? undefined : 0,
                transform: `translateZ(${-i * spacing}px)`,
                color: front ? undefined : `color-mix(in oklab, currentColor ${Math.round((1 - k) * 70)}%, ${depthColor})`,
                opacity: front ? 1 : 1 - k * 0.55,
                zIndex: n - i,
              }}
            >
              <Split text={text} />
            </span>
          );
        })}
      </span>
    </Root>
  );
}
