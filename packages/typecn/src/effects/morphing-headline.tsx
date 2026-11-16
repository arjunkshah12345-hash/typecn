"use client";
import { useEffect, useRef, useState } from "react";
import { Root, resolveEasing, safeEasing, useActive, useIsoLayoutEffect, useReducedMotion, type EasingName, type TextEffectProps } from "../core";

export interface MorphingHeadlineProps extends TextEffectProps {
  /** Phrases to morph between. Defaults to the lines of `text`. */
  phrases?: string[];
  /** Time each phrase is held, in ms. */
  hold?: number;
  /** Morph duration in ms. */
  duration?: number;
  easing?: EasingName | (string & {});
  paused?: boolean;
}

/** Keys letters by character + occurrence so shared letters keep their identity between phrases. */
function keyed(phrase: string) {
  const seen: Record<string, number> = {};
  return Array.from(phrase).map((ch) => {
    const k = ch === " " ? " " : ch.toLowerCase();
    seen[k] = (seen[k] ?? 0) + 1;
    return { ch, key: `${k}-${seen[k]}` };
  });
}

/**
 * Letters shared between phrases glide to their new positions (FLIP), while
 * letters that are not needed blur away and new ones condense in.
 */
export function MorphingHeadline(props: MorphingHeadlineProps) {
  const { text, className, style, as, hold = 1700, duration = 900, easing = "expo.inOut", paused } = props;
  const phrases = props.phrases?.length ? props.phrases : text.split("\n").filter(Boolean);
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const active = useActive(ref, paused || reduced);
  const [idx, setIdx] = useState(0);
  const prev = useRef<Map<string, { x: number; y: number; ch: string; color: string }>>(new Map());
  const phrase = phrases[idx % Math.max(phrases.length, 1)] ?? "";
  const letters = keyed(phrase);

  useEffect(() => {
    if (!active || phrases.length < 2) return;
    const t = setTimeout(() => {
      const root = ref.current;
      if (root) {
        const r = root.getBoundingClientRect();
        const m = new Map<string, { x: number; y: number; ch: string; color: string }>();
        root.querySelectorAll<HTMLElement>("[data-tc-key]").forEach((el) => {
          const b = el.getBoundingClientRect();
          m.set(el.dataset.tcKey!, { x: b.left - r.left, y: b.top - r.top, ch: el.textContent ?? "", color: getComputedStyle(el).color });
        });
        prev.current = m;
      }
      setIdx((v) => v + 1);
    }, idx === 0 ? hold : hold + duration);
    return () => clearTimeout(t);
  }, [idx, active, hold, duration, phrases.length]);

  useIsoLayoutEffect(() => {
    const root = ref.current;
    const old = prev.current;
    if (!root || old.size === 0 || reduced) return;
    const ease = safeEasing(resolveEasing(easing));
    const r = root.getBoundingClientRect();
    const anims: Animation[] = [];
    const ghosts: HTMLElement[] = [];
    const used = new Set<string>();
    root.querySelectorAll<HTMLElement>("[data-tc-key]").forEach((el, i) => {
      const k = el.dataset.tcKey!;
      const o = old.get(k);
      const b = el.getBoundingClientRect();
      if (o) {
        used.add(k);
        anims.push(el.animate([{ transform: `translate(${o.x - (b.left - r.left)}px, ${o.y - (b.top - r.top)}px)` }, { transform: "translate(0,0)" }], { duration, easing: ease, delay: i * 12 }));
      } else {
        anims.push(
          el.animate([{ opacity: 0, filter: "blur(8px)", transform: "translateY(0.3em) scale(0.8)" }, { opacity: 1, filter: "blur(0)", transform: "none" }], {
            duration: duration * 0.7,
            delay: duration * 0.35 + i * 10,
            easing: ease,
            fill: "backwards",
          }),
        );
      }
    });
    const layer = root.querySelector<HTMLElement>("[data-tc-ghosts]");
    old.forEach((o, k) => {
      if (used.has(k) || !layer || o.ch.trim() === "") return;
      const g = document.createElement("span");
      g.textContent = o.ch;
      g.style.cssText = `position:absolute;left:${o.x}px;top:${o.y}px;white-space:pre;pointer-events:none`;
      layer.appendChild(g);
      ghosts.push(g);
      anims.push(g.animate([{ opacity: 1, filter: "blur(0)" }, { opacity: 0, filter: "blur(8px)", transform: "translateY(-0.3em) scale(1.1)" }], { duration: duration * 0.5, easing: "ease-out", fill: "forwards" }));
    });
    prev.current = new Map();
    return () => {
      anims.forEach((a) => a.cancel());
      ghosts.forEach((g) => g.remove());
    };
  }, [idx]);

  return (
    <Root as={as} text={phrases.join(". ")} className={className} style={style} rootRef={ref}>
      <span data-tc-ghosts="" style={{ position: "absolute", inset: 0 }} />
      <span style={{ display: "inline-block", whiteSpace: "pre-wrap" }}>
        {letters.map((l) => (
          <span key={l.key} data-tc-key={l.key} style={{ display: "inline-block", whiteSpace: "pre" }}>
            {l.ch}
          </span>
        ))}
      </span>
    </Root>
  );
}
