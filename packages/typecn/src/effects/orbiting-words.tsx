"use client";
import { useRef } from "react";
import { Root, splitText, useActive, useFrame, useReducedMotion, type ContinuousEffectProps } from "../core";

export interface OrbitingWordsProps extends ContinuousEffectProps {
  /** Horizontal radius in em. */
  radiusX?: number;
  /** Vertical radius in em. */
  radiusY?: number;
  /** Seconds per revolution at speed 1. */
  period?: number;
  /** Depth fade: how much far-side words shrink and dim, 0–1. */
  depth?: number;
}

/**
 * Words ride an elliptical orbit around the centre. Far-side words shrink and fade,
 * giving the ring a sense of depth without WebGL.
 */
export function OrbitingWords(props: OrbitingWordsProps) {
  const { text, className, style, as, radiusX = 3.2, radiusY = 1.1, period = 14, depth = 0.6, paused, speed = 1 } = props;
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const active = useActive(ref, paused || reduced);
  const words = splitText(text).lines.flatMap((l) => l.words.map((w) => w.text));
  const n = Math.max(words.length, 1);

  const place = (time: number) => {
    const root = ref.current;
    if (!root) return;
    const els = root.querySelectorAll<HTMLElement>("[data-tc-unit]");
    els.forEach((el, i) => {
      const a = (i / n) * Math.PI * 2 + (time / period) * Math.PI * 2;
      const z = Math.sin(a); // 1 = front
      const s = 1 - depth * 0.5 * (1 - (z + 1) / 2);
      el.style.transform = `translate(-50%, -50%) translate(${(Math.cos(a) * radiusX).toFixed(3)}em, ${(z * radiusY).toFixed(3)}em) scale(${s.toFixed(3)})`;
      el.style.opacity = (1 - depth * 0.75 * (1 - (z + 1) / 2)).toFixed(3);
      el.style.zIndex = String(Math.round((z + 1) * 50));
    });
  };

  useFrame(({ time }) => place(time), active, speed);

  return (
    <Root
      as={as}
      text={text}
      className={className}
      style={{ width: `${radiusX * 2 + 3}em`, height: `${radiusY * 2 + 1.4}em`, maxWidth: "100%", ...style }}
      rootRef={ref}
    >
      {words.map((w, i) => {
        const a = (i / n) * Math.PI * 2;
        const z = Math.sin(a);
        return (
          <span
            key={i}
            data-tc-unit=""
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              whiteSpace: "nowrap",
              transform: `translate(-50%, -50%) translate(${(Math.cos(a) * radiusX).toFixed(3)}em, ${(z * radiusY).toFixed(3)}em)`,
              willChange: "transform, opacity",
            }}
          >
            {w}
          </span>
        );
      })}
    </Root>
  );
}
