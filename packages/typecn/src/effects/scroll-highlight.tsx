"use client";
import { useRef } from "react";
import { Root, Split, clamp, useReducedMotion, useScrollProgress, useIsoLayoutEffect, type TextEffectProps } from "../core";

export interface ScrollHighlightProps extends TextEffectProps {
  /** Opacity of words that have not been reached yet. */
  dimOpacity?: number;
  /** Colour of the word currently being read. */
  highlightColor?: string;
  /** Portion of the scroll range (0–1) over which the words light up. */
  start?: number;
  end?: number;
  /** Drive progress manually (0–1) instead of from scroll. */
  progress?: number;
}

/**
 * As the paragraph scrolls through the viewport, words light up in reading
 * order. The leading word glows in the highlight colour; read words settle to full ink.
 */
export function ScrollHighlight(props: ScrollHighlightProps) {
  const { text, className, style, as, dimOpacity = 0.16, highlightColor, start = 0.15, end = 0.6, progress } = props;
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  const apply = (p: number) => {
    const root = ref.current;
    if (!root) return;
    const words = root.querySelectorAll<HTMLElement>("[data-tc-unit]");
    const n = words.length;
    const k = clamp((p - start) / Math.max(end - start, 0.001)) * (n + 1);
    words.forEach((w, i) => {
      const v = clamp(k - i);
      w.style.opacity = String(dimOpacity + (1 - dimOpacity) * v);
      const lead = v > 0 && v < 1;
      w.style.color = lead && highlightColor ? highlightColor : "";
      w.style.transform = `translateY(${((1 - v) * 0.08).toFixed(3)}em)`;
    });
  };

  useScrollProgress(ref, apply, { enabled: progress === undefined && !reduced });
  useIsoLayoutEffect(() => {
    if (progress !== undefined) apply(progress);
    if (reduced) apply(1);
  });

  return (
    <Root as={as} text={text} className={className} style={style} rootRef={ref}>
      <Split
        text={text}
        word={(w) => (
          <span data-tc-unit="" style={{ display: "inline-block", whiteSpace: "nowrap", opacity: dimOpacity, transition: "color 200ms" }}>
            {w.text}
          </span>
        )}
      />
    </Root>
  );
}
