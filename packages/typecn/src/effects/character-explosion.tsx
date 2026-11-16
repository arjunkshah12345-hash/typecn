"use client";
import { useEffect, useRef } from "react";
import { Root, Split, after, seeded, unitStyle, useActive, useTimed, type TimedEffectProps, useLatest } from "../core";

export interface CharacterExplosionProps extends Omit<TimedEffectProps, "easing"> {
  /** Initial blast velocity, in px per frame. */
  power?: number;
  /** Gravity applied to flying characters. */
  gravity?: number;
  /** Time (ms) characters fly before reassembling. */
  flight?: number;
}

const easeInOut = (t: number) => (t < 0.5 ? 16 * t ** 5 : 1 - Math.pow(-2 * t + 2, 5) / 2);

/**
 * The phrase detonates: characters are thrown outward with spin under real gravity,
 * hang for a moment, then fly back and lock into place in a staggered rewind.
 * Click the text to detonate it again.
 */
export function CharacterExplosion(props: CharacterExplosionProps) {
  const { text, className, style, as, power = 14, gravity = 0.45, flight = 1100 } = props;
  const ref = useRef<HTMLElement>(null);
  const t = useTimed(ref, { ...props, loop: props.loop ?? false }, { duration: 1000, stagger: 18, easing: "linear", delay: 400 });
  const active = useActive(ref);
  const { run, replay, reduced, duration, delay, stagger, loop } = t;
  const done = useLatest(props.onComplete);
  const loopDelay = t.loopDelay ?? 1600;

  useEffect(() => {
    const root = ref.current;
    if (!root || run === 0 || reduced || !active) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-tc-unit]"));
    const n = els.length;
    const rect = root.getBoundingClientRect();
    let raf = 0;
    let cancel = () => {};
    const blast = () => {
      const r = seeded(Math.floor(performance.now()));
      const ps = els.map((el, i) => {
        const b = el.getBoundingClientRect();
        const cx = b.left + b.width / 2 - rect.left - rect.width / 2;
        const cy = b.top + b.height / 2 - rect.top - rect.height / 2;
        const a = Math.atan2(cy - 10, cx) + (r() - 0.5) * 1.2;
        const v = power * (0.5 + r());
        return { x: 0, y: 0, vx: Math.cos(a) * v, vy: Math.sin(a) * v - power * 0.6, r: 0, vr: (r() - 0.5) * 30, i };
      });
      const t0 = performance.now();
      const fly = (now: number) => {
        const el = now - t0;
        if (el < flight) {
          for (const p of ps) {
            p.vy += gravity;
            p.vx *= 0.985;
            p.vy *= 0.985;
            p.x += p.vx;
            p.y += p.vy;
            p.r += p.vr;
            p.vr *= 0.97;
            els[p.i].style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px) rotate(${p.r.toFixed(1)}deg)`;
            els[p.i].style.opacity = String(Math.max(0.15, 1 - el / flight));
          }
          raf = requestAnimationFrame(fly);
          return;
        }
        const from = ps.map((p) => ({ ...p }));
        const t1 = now;
        const back = (now2: number) => {
          let all = true;
          for (const p of from) {
            const k = Math.min(Math.max((now2 - t1 - p.i * stagger) / duration, 0), 1);
            if (k < 1) all = false;
            const e = easeInOut(k);
            els[p.i].style.transform = `translate(${(p.x * (1 - e)).toFixed(1)}px, ${(p.y * (1 - e)).toFixed(1)}px) rotate(${(p.r * (1 - e)).toFixed(1)}deg)`;
            els[p.i].style.opacity = String(0.15 + 0.85 * Math.max(e, 1 - el / flight));
          }
          if (!all) raf = requestAnimationFrame(back);
          else {
            els.forEach((e) => {
              e.style.transform = "";
              e.style.opacity = "";
            });
            done.current?.();
            if (loop) cancel = after(loopDelay, blast);
          }
        };
        raf = requestAnimationFrame(back);
      };
      raf = requestAnimationFrame(fly);
    };
    cancel = after(delay, blast);
    void n;
    return () => {
      cancelAnimationFrame(raf);
      cancel();
      els.forEach((e) => {
        e.style.transform = "";
        e.style.opacity = "";
      });
    };
  }, [run, reduced, active, power, gravity, flight, duration, delay, stagger, loop, loopDelay, text, done]);

  return (
    <Root as={as} text={text} className={className} style={{ cursor: "pointer", ...style }} rootRef={ref} attrs={{ onClick: replay }}>
      <Split text={text} char={(c) => <span data-tc-unit="" style={unitStyle}>{c.char}</span>} />
    </Root>
  );
}
