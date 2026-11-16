"use client";
import { useEffect, useRef } from "react";
import { Root, Split, unitStyle, useReducedMotion, type TextEffectProps } from "../core";

export interface HoverShuffleProps extends TextEffectProps {
  /** Glyph pool used while shuffling. */
  glyphs?: string;
  /** Number of glyph swaps before a letter settles. */
  cycles?: number;
  /** Milliseconds between swaps. */
  interval?: number;
  /** How many neighbours on each side are disturbed too. */
  spread?: number;
  /** Colour while shuffling. */
  activeColor?: string;
  /** Shuffle a random letter every so often even without a pointer (ms, 0 = off). */
  ambient?: number;
}

const POOL = "!<>-_\\/[]{}—=+*^?#ABCDEFGHIKLMNOPRSTUVXYZ";

/**
 * Touching a letter makes it flicker through random glyphs before settling; the
 * disturbance spreads to its neighbours with decreasing energy. Letter widths are
 * locked during the shuffle so the line never reflows.
 */
export function HoverShuffle(props: HoverShuffleProps) {
  const { text, className, style, as, glyphs = POOL, cycles = 7, interval = 45, spread = 2, activeColor, ambient = 2200 } = props;
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const timers = useRef(new Map<HTMLElement, ReturnType<typeof setInterval>>());

  useEffect(() => {
    const root = ref.current;
    if (!root || reduced) return;
    const units = Array.from(root.querySelectorAll<HTMLElement>("[data-tc-unit]"));
    const pool = Array.from(glyphs || POOL);
    const map = timers.current;
    const shuffle = (el: HTMLElement, n: number) => {
      if (map.has(el) || n <= 0) return;
      const final = el.dataset.char ?? "";
      el.style.minWidth = `${el.offsetWidth}px`;
      if (activeColor) el.style.color = activeColor;
      let k = 0;
      const id = setInterval(() => {
        k++;
        if (k >= n) {
          clearInterval(id);
          map.delete(el);
          el.textContent = final;
          el.style.minWidth = "";
          el.style.color = "";
          return;
        }
        el.textContent = pool[Math.floor(Math.random() * pool.length)];
      }, interval);
      map.set(el, id);
    };
    const onOver = (e: PointerEvent) => {
      const i = units.indexOf(e.target as HTMLElement);
      if (i < 0) return;
      for (let d = -spread; d <= spread; d++) {
        const u = units[i + d];
        if (u) setTimeout(() => shuffle(u, Math.round(cycles * (1 - Math.abs(d) / (spread + 1)))), Math.abs(d) * interval);
      }
    };
    root.addEventListener("pointerover", onOver);
    let amb: ReturnType<typeof setInterval> | undefined;
    if (ambient > 0) {
      amb = setInterval(() => {
        if (root.matches(":hover")) return;
        const i = Math.floor(Math.random() * units.length);
        for (let d = -1; d <= 1; d++) if (units[i + d]) shuffle(units[i + d], cycles - Math.abs(d) * 2);
      }, ambient);
    }
    return () => {
      root.removeEventListener("pointerover", onOver);
      clearInterval(amb);
      map.forEach((id, el) => {
        clearInterval(id);
        el.textContent = el.dataset.char ?? "";
        el.style.minWidth = "";
        el.style.color = "";
      });
      map.clear();
    };
  }, [text, glyphs, cycles, interval, spread, activeColor, ambient, reduced]);

  return (
    <Root as={as} text={text} className={className} style={style} rootRef={ref}>
      <Split
        text={text}
        char={(c) => (
          <span key={c.char} data-tc-unit="" data-char={c.char} style={{ ...unitStyle, textAlign: "center" }}>
            {c.char}
          </span>
        )}
      />
    </Root>
  );
}
