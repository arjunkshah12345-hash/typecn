"use client";
import { useEffect, useRef, useState } from "react";
import { Root, Split, resolveEasing, safeEasing, unitStyle, useActive, useReducedMotion, type EasingName, type TextEffectProps } from "../core";

export interface VerticalRollingHeadlineProps extends TextEffectProps {
  /** Headlines to rotate through. Defaults to the lines of `text` (split on `\n`). */
  phrases?: string[];
  /** How long each headline is shown, in ms. */
  hold?: number;
  /** Roll duration per character, in ms. */
  duration?: number;
  /** Delay between characters, in ms. */
  stagger?: number;
  easing?: EasingName | (string & {});
  paused?: boolean;
}

/**
 * Headlines are printed on the faces of a rotating drum. Each character rolls over
 * the top edge on its own beat, so the change ripples across the line.
 */
export function VerticalRollingHeadline(props: VerticalRollingHeadlineProps) {
  const { text, className, style, as, hold = 1800, duration = 800, stagger = 30, easing = "expo.inOut", paused } = props;
  const phrases = props.phrases?.length ? props.phrases : text.split("\n").filter(Boolean);
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const active = useActive(ref, paused || reduced);
  const [idx, setIdx] = useState(0);
  const cur = phrases[idx % phrases.length] ?? "";
  const next = phrases[(idx + 1) % phrases.length] ?? "";

  useEffect(() => {
    const root = ref.current;
    if (!root || !active || phrases.length < 2) return;
    const ease = safeEasing(resolveEasing(easing));
    let anims: Animation[] = [];
    const t = setTimeout(() => {
      const outs = Array.from(root.querySelectorAll<HTMLElement>("[data-tc-out]"));
      const ins = Array.from(root.querySelectorAll<HTMLElement>("[data-tc-in]"));
      const o = (i: number) => ({ duration, delay: i * stagger, easing: ease, fill: "both" as const });
      anims = [
        ...outs.map((el, i) => el.animate([{ transform: "translateY(0) rotateX(0deg)", opacity: 1 }, { transform: "translateY(-0.6em) rotateX(90deg)", opacity: 0 }], o(i))),
        ...ins.map((el, i) => el.animate([{ transform: "translateY(0.6em) rotateX(-90deg)", opacity: 0 }, { transform: "translateY(0) rotateX(0deg)", opacity: 1 }], o(i))),
      ];
      Promise.all(anims.map((a) => a.finished))
        .then(() => setIdx((v) => v + 1))
        .catch(() => {});
    }, hold);
    return () => {
      clearTimeout(t);
      anims.forEach((a) => a.cancel());
    };
  }, [idx, active, hold, duration, stagger, easing, phrases.length]);

  const layer = (s: string, attr: "data-tc-out" | "data-tc-in", hidden: boolean) => (
    <span style={{ gridArea: "1 / 1", perspective: "600px" }} key={`${attr}-${idx}`}>
      <Split
        text={s}
        char={(c) => (
          <span {...{ [attr]: "" }} style={{ ...unitStyle, transformOrigin: "50% 50% -0.4em", opacity: hidden ? 0 : 1, backfaceVisibility: "hidden" }}>
            {c.char}
          </span>
        )}
      />
    </span>
  );

  return (
    <Root as={as} text={phrases.join(". ")} className={className} style={style} rootRef={ref} display="inline-grid">
      {phrases.map((p, i) => (
        <span key={`sizer-${i}`} style={{ gridArea: "1 / 1", visibility: "hidden" }}>
          <Split text={p} />
        </span>
      ))}
      {layer(cur, "data-tc-out", false)}
      {phrases.length > 1 && !reduced ? layer(next, "data-tc-in", true) : null}
    </Root>
  );
}
