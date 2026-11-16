"use client";
import { useRef } from "react";
import { Root, Split, after, unitStyle, useIsoLayoutEffect, useTimed, type TimedEffectProps, useLatest } from "../core";

export interface ScrambleTextProps extends TimedEffectProps {
  /** Glyph pool used while scrambling. */
  characters?: string;
  /** How often (ms) the random glyphs change. */
  tick?: number;
  /** Colour applied to characters that are still scrambling. */
  scrambleColor?: string;
}

const POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=<>/\\[]{}";

/**
 * Random glyphs cycle in every slot, then lock to the real letter one by one —
 * a decoder resolving the message. Text updates are written straight to the DOM.
 */
export function ScrambleText(props: ScrambleTextProps) {
  const { text, className, style, as, characters = POOL, tick = 45, scrambleColor } = props;
  const ref = useRef<HTMLElement>(null);
  const t = useTimed(ref, props, { duration: 1200, stagger: 40, easing: "linear" });
  const { run, reduced, duration, delay, stagger, loop, loopDelay = 1400 } = t;
  const done = useLatest(props.onComplete);

  useIsoLayoutEffect(() => {
    const root = ref.current;
    if (!root || run === 0 || reduced) return;
    const units = Array.from(root.querySelectorAll<HTMLElement>("[data-tc-unit]"));
    const finals = units.map((u) => u.dataset.char ?? "");
    const pool = Array.from(characters.length ? characters : POOL);
    let raf = 0;
    let cancelLoop = () => {};
    const start = () => {
      const t0 = performance.now();
      let lastTick = -Infinity;
      units.forEach((u) => (u.style.opacity = "1"));
      const frame = (now: number) => {
        const el = now - t0 - delay;
        const doTick = now - lastTick >= tick;
        if (doTick) lastTick = now;
        let settled = 0;
        units.forEach((u, i) => {
          const lockAt = i * stagger + duration;
          if (el >= lockAt) {
            if (u.textContent !== finals[i]) {
              u.textContent = finals[i];
              u.style.color = "";
            }
            settled++;
          } else if (el >= i * stagger * 0.35 && doTick) {
            u.textContent = pool[Math.floor(Math.random() * pool.length)];
            if (scrambleColor) u.style.color = scrambleColor;
          } else if (el < i * stagger * 0.35) {
            u.textContent = " ";
          }
        });
        if (settled < units.length) raf = requestAnimationFrame(frame);
        else {
          done.current?.();
          if (loop) cancelLoop = after(loopDelay, start);
        }
      };
      raf = requestAnimationFrame(frame);
    };
    start();
    return () => {
      cancelAnimationFrame(raf);
      cancelLoop();
      units.forEach((u, i) => {
        u.textContent = finals[i];
        u.style.color = "";
      });
    };
  }, [run, reduced, duration, delay, stagger, loop, loopDelay, characters, tick, scrambleColor, text, done]);

  const pre = run === 0 && !reduced;
  return (
    <Root as={as} text={text} className={className} style={style} rootRef={ref}>
      <Split
        text={text}
        char={(c) => (
          <span key={c.char} data-tc-unit="" data-char={c.char} style={{ ...unitStyle, opacity: pre ? 0 : undefined }}>
            {c.char}
          </span>
        )}
      />
    </Root>
  );
}
