"use client";
import { useRef } from "react";
import { Root, useActive, useFrame, usePointer, useReducedMotion, type ContinuousEffectProps } from "../core";

export interface TextTrailProps extends ContinuousEffectProps {
  /** Distance in px the pointer travels between echoes. */
  spacing?: number;
  /** Lifetime of each echo in ms. */
  life?: number;
  /** Maximum simultaneous echoes. */
  max?: number;
  /** Draw an automatic path when no pointer is present. */
  ambient?: boolean;
  /** Minimum height of the drawing area in em. */
  minHeight?: number;
}

/**
 * Moving the pointer spells the text along your path: each step drops the next
 * character as an echo that rotates with your direction, then shrinks and fades.
 * The phrase itself sits quietly underneath.
 */
export function TextTrail(props: TextTrailProps) {
  const { text, className, style, as = "div", spacing = 28, life = 1100, max = 48, ambient = true, minHeight = 3, paused, speed = 1 } = props;
  const ref = useRef<HTMLElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const active = useActive(ref, paused || reduced);
  const pointer = usePointer(ref, active);
  const st = useRef({ x: 0, y: 0, idx: 0, init: false, nodes: [] as { el: HTMLSpanElement; born: number; alive: boolean }[], cursor: 0, clock: 0 });
  const chars = Array.from(text.replace(/\s+/g, ""));

  useFrame(({ time, delta }) => {
    const root = ref.current;
    const L = layer.current;
    if (!root || !L) return;
    const s = st.current;
    s.clock += delta * 1000;
    if (s.nodes.length !== max) {
      L.textContent = "";
      s.nodes = Array.from({ length: max }, () => {
        const el = document.createElement("span");
        el.style.cssText = "position:absolute;left:0;top:0;opacity:0;white-space:pre;will-change:transform,opacity;pointer-events:none";
        L.appendChild(el);
        return { el, born: 0, alive: false };
      });
    }
    const p = pointer.current;
    let x: number;
    let y: number;
    if (p.inside) {
      x = p.x;
      y = p.y;
    } else if (ambient) {
      const w = root.offsetWidth;
      const h = root.offsetHeight;
      x = w / 2 + Math.sin(time * 0.9) * w * 0.38;
      y = h / 2 + Math.sin(time * 1.8) * h * 0.3;
    } else {
      s.init = false;
      x = s.x;
      y = s.y;
    }
    if (!s.init) {
      s.x = x;
      s.y = y;
      s.init = true;
    }
    const dx = x - s.x;
    const dy = y - s.y;
    const d = Math.hypot(dx, dy);
    if (d >= spacing && chars.length) {
      const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
      const n = s.nodes[s.cursor];
      s.cursor = (s.cursor + 1) % max;
      n.el.textContent = chars[s.idx % chars.length];
      s.idx++;
      n.born = s.clock;
      n.alive = true;
      n.el.dataset.x = String(x);
      n.el.dataset.y = String(y);
      n.el.dataset.a = String(ang);
      s.x = x;
      s.y = y;
    }
    for (const n of s.nodes) {
      if (!n.alive) continue;
      const k = (s.clock - n.born) / life;
      if (k >= 1) {
        n.alive = false;
        n.el.style.opacity = "0";
        continue;
      }
      const e = 1 - k;
      n.el.style.opacity = (e * e).toFixed(3);
      n.el.style.transform = `translate(${n.el.dataset.x}px, ${n.el.dataset.y}px) translate(-50%, -50%) rotate(${n.el.dataset.a}deg) scale(${(0.4 + e * 0.8).toFixed(3)})`;
    }
  }, active, speed);

  return (
    <Root
      as={as}
      text={text}
      className={className}
      style={{ minHeight: `${minHeight}em`, display: "grid", placeItems: "center", overflow: "hidden", touchAction: "pan-y", ...style }}
      rootRef={ref}
      display="grid"
    >
      <span style={{ opacity: 0.18, textAlign: "center", whiteSpace: "pre-line" }}>{text}</span>
      <div ref={layer} style={{ position: "absolute", inset: 0 }} />
    </Root>
  );
}
