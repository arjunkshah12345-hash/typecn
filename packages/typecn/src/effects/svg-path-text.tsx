"use client";
import { useId, useRef, useState } from "react";
import { Root, useActive, useFrame, useIsoLayoutEffect, useReducedMotion, useSize, type ContinuousEffectProps } from "../core";

export interface SvgPathTextProps extends ContinuousEffectProps {
  /** Shape of the path. */
  shape?: "wave" | "arc" | "loop" | "spiral";
  /** Height of the curve relative to the font size. */
  amplitude?: number;
  /** Number of waves (for `wave`). */
  waves?: number;
  /** Seconds for the text to travel one full repetition. */
  period?: number;
  /** Separator placed between repetitions. */
  separator?: string;
  /** Show the guide path. */
  showPath?: boolean;
}

function pathFor(shape: SvgPathTextProps["shape"], w: number, h: number, amp: number, waves: number) {
  const mid = h / 2;
  if (shape === "arc") return `M 0 ${mid + amp} Q ${w / 2} ${mid - amp * 2.2} ${w} ${mid + amp}`;
  if (shape === "loop") {
    const r = Math.min(h / 2 - 4, w / 4);
    return `M ${w / 2 - r} ${mid} a ${r} ${r} 0 1 1 ${r * 2} 0 a ${r} ${r} 0 1 1 ${-r * 2} 0`;
  }
  if (shape === "spiral") {
    let d = "";
    const turns = 2.25;
    const steps = 220;
    const R = Math.min(h / 2 - 4, w / 3);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const a = t * turns * Math.PI * 2;
      const r = R * (1 - t * 0.68);
      d += `${i ? "L" : "M"}${(w / 2 + Math.cos(a) * r * 1.4).toFixed(1)} ${(mid + Math.sin(a) * r).toFixed(1)}`;
    }
    return d;
  }
  let d = `M 0 ${mid}`;
  const seg = w / (waves * 2);
  for (let i = 0; i < waves * 2; i++) d += ` Q ${seg * i + seg / 2} ${mid + (i % 2 ? amp : -amp)} ${seg * (i + 1)} ${mid}`;
  return d;
}

/**
 * The phrase is set on an SVG path and flows along it continuously. Choose a wave,
 * arc, closed loop or spiral; text is repeated to fill the path.
 */
export function SvgPathText(props: SvgPathTextProps) {
  const { text, className, style, as = "div", shape = "wave", amplitude = 0.9, waves = 2, period = 12, separator = " — ", showPath = false, paused, speed = 1 } = props;
  const ref = useRef<HTMLElement>(null);
  const tp = useRef<SVGTextPathElement>(null);
  const id = `tc-path-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const reduced = useReducedMotion();
  const active = useActive(ref, paused || reduced);
  const { width } = useSize(ref);
  const [fs, setFs] = useState(48);
  const [reps, setReps] = useState(6);
  const unitLen = useRef(0);
  const h = shape === "loop" || shape === "spiral" ? Math.max(fs * 5, 200) : fs * (amplitude * 3 + 2);
  const w = width || 800;
  const d = pathFor(shape, w, h, fs * amplitude, waves);
  const unit = text.replace(/\n/g, " ") + separator;

  useIsoLayoutEffect(() => {
    const root = ref.current;
    if (root) {
      const size = parseFloat(getComputedStyle(root).fontSize);
      if (size && size !== fs) setFs(size);
    }
    const el = tp.current;
    const path = el?.ownerSVGElement?.querySelector("path");
    if (!el || !path) return;
    // Repeat the phrase until it covers the path plus one copy, so shifting by one copy loops seamlessly.
    const total = (el.parentNode as SVGTextElement).getComputedTextLength();
    const u = total / reps;
    unitLen.current = u;
    const need = Math.min(40, Math.ceil(path.getTotalLength() / Math.max(u, 1)) + 1);
    if (need !== reps) setReps(need);
  }, [text, separator, width, fs, reps, d]);

  useFrame(({ time }) => {
    const el = tp.current;
    if (!el) return;
    const k = (time / period) % 1;
    el.setAttribute("startOffset", (-k * unitLen.current).toFixed(2));
  }, active, speed);

  return (
    <Root as={as} text={text} className={className} style={{ width: "100%", ...style }} rootRef={ref} display="block">
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block", overflow: "visible" }} aria-hidden="true">
        <path id={id} d={d} fill="none" stroke={showPath ? "currentColor" : "none"} strokeOpacity={0.25} strokeDasharray="3 5" />
        <text fill="currentColor" style={{ font: "inherit", letterSpacing: "inherit" }} dominantBaseline="middle">
          <textPath ref={tp} href={`#${id}`} startOffset="0%">
            {Array.from({ length: reps }, () => unit).join("")}
          </textPath>
        </text>
      </svg>
    </Root>
  );
}
