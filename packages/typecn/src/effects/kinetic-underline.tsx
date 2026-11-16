"use client";
import { useRef } from "react";
import { Root, Split, useActive, useFrame, usePointer, useReducedMotion, type ContinuousEffectProps } from "../core";

export interface KineticUnderlineProps extends ContinuousEffectProps {
  /** Underline colour. Defaults to the text colour. */
  color?: string;
  /** Stroke thickness in em. */
  thickness?: number;
  /** Tension of the string — higher carries waves faster. */
  tension?: number;
  /** Pluck the line every few seconds when idle (ms, 0 = off). */
  ambient?: number;
}

const N = 40;

/**
 * Each line sits on a taut string. Running the pointer across it plucks the string;
 * waves travel to both ends and reflect. Simulated with a 1D wave equation and
 * redrawn as an SVG path.
 */
export function KineticUnderline(props: KineticUnderlineProps) {
  const { text, className, style, as, color = "currentColor", thickness = 0.06, tension = 0.32, ambient = 2800, paused, speed = 1 } = props;
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const active = useActive(ref, paused || reduced);
  const pointer = usePointer(ref, active);
  const sims = useRef<{ y: Float32Array; v: Float32Array }[]>([]);
  const lastPluck = useRef(0);

  useFrame(({ time }) => {
    const root = ref.current;
    if (!root) return;
    const lines = Array.from(root.querySelectorAll<HTMLElement>("[data-tc-line]"));
    if (sims.current.length !== lines.length) sims.current = lines.map(() => ({ y: new Float32Array(N), v: new Float32Array(N) }));
    const p = pointer.current;
    const fs = parseFloat(getComputedStyle(root).fontSize) || 16;
    const rootRect = root.getBoundingClientRect();
    let plucked = false;
    lines.forEach((line, li) => {
      const s = sims.current[li];
      const svg = line.querySelector("svg");
      const path = line.querySelector("path");
      if (!svg || !path) return;
      const w = line.offsetWidth;
      const lr = line.getBoundingClientRect();
      const baseY = lr.bottom - rootRect.top;
      if (p.inside) {
        const rx = p.x - (lr.left - rootRect.left);
        const dy = p.y - baseY;
        if (rx >= 0 && rx <= w && Math.abs(dy) < fs * 0.6) {
          const i = Math.round((rx / w) * (N - 1));
          if (i > 0 && i < N - 1) {
            s.v[i] += p.vy * 0.25 + p.vx * 0.05;
            s.y[i] += (dy * 0.5 - s.y[i]) * 0.3;
          }
        }
      } else if (ambient > 0 && time * 1000 - lastPluck.current > ambient && li === Math.floor(time) % lines.length) {
        const i = 3 + Math.floor(Math.random() * (N - 6));
        s.v[i] += fs * 0.35 * (Math.random() > 0.5 ? 1 : -1);
        plucked = true;
      }
      for (let i = 1; i < N - 1; i++) s.v[i] += (s.y[i - 1] + s.y[i + 1] - 2 * s.y[i]) * tension - s.y[i] * 0.005;
      let d = "";
      for (let i = 0; i < N; i++) {
        if (i > 0 && i < N - 1) {
          s.v[i] *= 0.985;
          s.y[i] += s.v[i];
          s.y[i] = Math.max(-fs * 0.5, Math.min(fs * 0.5, s.y[i]));
        }
        d += `${i ? "L" : "M"}${((i / (N - 1)) * w).toFixed(1)} ${(fs * 0.55 + s.y[i]).toFixed(2)}`;
      }
      svg.setAttribute("viewBox", `0 0 ${w.toFixed(0)} ${(fs * 1.1).toFixed(0)}`);
      path.setAttribute("d", d);
    });
    if (plucked) lastPluck.current = time * 1000;
  }, active, speed);

  return (
    <Root as={as} text={text} className={className} style={style} rootRef={ref}>
      <Split
        text={text}
        line={(l) => (
          <span style={{ display: "block", paddingBottom: "0.35em" }}>
            <span data-tc-line="" style={{ position: "relative", display: "inline-block" }}>
              {l.children}
              <svg
                aria-hidden="true"
                preserveAspectRatio="none"
                style={{ position: "absolute", left: 0, top: "100%", width: "100%", height: "1.1em", marginTop: "-0.55em", overflow: "visible", pointerEvents: "none" }}
              >
                <path d="M0 8L1000 8" fill="none" stroke={color} strokeWidth={`${thickness}em`} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
              </svg>
            </span>
          </span>
        )}
      />
    </Root>
  );
}
