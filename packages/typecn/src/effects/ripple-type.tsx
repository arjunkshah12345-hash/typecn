"use client";
import { useRef } from "react";
import { Root, Split, unitStyle, useActive, useFrame, usePointer, useReducedMotion, useUnitLayout, type ContinuousEffectProps } from "../core";

export interface RippleTypeProps extends ContinuousEffectProps {
  /** Peak displacement in px. */
  amplitude?: number;
  /** Ring travel speed in px/s. */
  waveSpeed?: number;
  /** Distance between crests in px. */
  wavelength?: number;
  /** Emit ambient ripples when nobody is interacting. */
  ambient?: boolean;
}

interface Ripple {
  x: number;
  y: number;
  t: number;
  strength: number;
}

/**
 * Pointer movement drops pebbles into the text. Rings radiate outward, lifting and
 * scaling the letters they cross. Clicks make a bigger splash.
 */
export function RippleType(props: RippleTypeProps) {
  const { text, className, style, as, amplitude = 14, waveSpeed = 420, wavelength = 90, ambient = true, paused, speed = 1 } = props;
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const active = useActive(ref, paused || reduced);
  const pointer = usePointer(ref, active);
  const layout = useUnitLayout(ref, [text]);
  const ripples = useRef<Ripple[]>([]);
  const last = useRef({ x: 0, y: 0, t: -10, ambient: -1.8 });
  const clock = useRef(0);

  useFrame(({ time }) => {
    clock.current = time;
    const p = pointer.current;
    const root = ref.current;
    if (!root) return;
    const L = last.current;
    if (p.inside && Math.hypot(p.x - L.x, p.y - L.y) > 36 && time - L.t > 0.08) {
      ripples.current.push({ x: p.x, y: p.y, t: time, strength: 0.6 });
      L.x = p.x;
      L.y = p.y;
      L.t = time;
    }
    if (ambient && !p.inside && time - L.ambient > 2.4) {
      L.ambient = time;
      ripples.current.push({ x: root.offsetWidth * (0.2 + Math.random() * 0.6), y: root.offsetHeight / 2, t: time, strength: 1 });
    }
    const life = 2.2;
    ripples.current = ripples.current.filter((r) => time - r.t < life).slice(-14);
    const k = (Math.PI * 2) / wavelength;
    layout.current.forEach((u) => {
      let dy = 0;
      for (const r of ripples.current) {
        const age = time - r.t;
        const front = age * waveSpeed;
        const d = Math.hypot(u.cx - r.x, u.cy - r.y);
        const behind = front - d;
        if (behind < 0 || behind > wavelength * 1.5) continue;
        const env = Math.sin((behind / (wavelength * 1.5)) * Math.PI) * (1 - age / life) * r.strength;
        dy += Math.sin(behind * k) * env;
      }
      u.el.style.transform = dy ? `translateY(${(-dy * amplitude).toFixed(2)}px) scale(${(1 + Math.abs(dy) * 0.12).toFixed(3)})` : "";
    });
  }, active, speed);

  const splash = (e: React.PointerEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    ripples.current.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: clock.current, strength: 1.6 });
  };

  return (
    <Root as={as} text={text} className={className} style={style} rootRef={ref} attrs={{ onPointerDown: splash }}>
      <Split text={text} char={(c) => <span data-tc-unit="" style={unitStyle}>{c.char}</span>} />
    </Root>
  );
}
