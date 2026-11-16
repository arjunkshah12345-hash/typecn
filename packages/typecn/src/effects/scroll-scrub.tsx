"use client";
import { useEffect, useRef } from "react";
import { Root, Split, seeded, unitStyle, useReducedMotion, useScrollProgress, type TextEffectProps } from "../core";

export interface ScrollScrubProps extends TextEffectProps {
  /** How far characters are scattered at progress 0, in em. */
  scatter?: number;
  /** Max rotation of scattered characters, in degrees. */
  rotation?: number;
  /** Fraction of the scroll range at which the text is fully assembled. */
  assembleAt?: number;
  /** Smoothing 0–1; higher follows scroll more loosely. */
  smoothing?: number;
  /** Drive progress manually (0–1) instead of from scroll. */
  progress?: number;
}

/**
 * Scroll is the playhead. Every character owns a paused Web Animation from a
 * scattered pose to its home; scroll position sets `currentTime`, so the type
 * assembles and disassembles exactly with your scroll, forwards and backwards.
 */
export function ScrollScrub(props: ScrollScrubProps) {
  const { text, className, style, as, scatter = 2.2, rotation = 90, assembleAt = 0.55, smoothing = 0.82, progress } = props;
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const anims = useRef<Animation[]>([]);
  const target = useRef(0);
  const current = useRef(0);
  const raf = useRef(0);

  useEffect(() => {
    const root = ref.current;
    if (!root || reduced) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-tc-unit]"));
    anims.current = els.map((el, i) => {
      const r = seeded(i * 71 + 3);
      const x = (r() * 2 - 1) * scatter;
      const y = (r() * 2 - 1) * scatter * 0.6;
      const rot = (r() * 2 - 1) * rotation;
      const a = el.animate(
        [
          { transform: `translate(${x.toFixed(2)}em, ${y.toFixed(2)}em) rotate(${rot.toFixed(1)}deg) scale(0.6)`, opacity: 0, filter: "blur(6px)" },
          { transform: "translate(0,0) rotate(0deg) scale(1)", opacity: 1, filter: "blur(0px)" },
        ],
        { duration: 1000, fill: "both", easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
      );
      a.pause();
      a.currentTime = current.current * 1000;
      return a;
    });
    return () => {
      anims.current.forEach((a) => a.cancel());
      anims.current = [];
      cancelAnimationFrame(raf.current);
      raf.current = 0;
    };
  }, [text, scatter, rotation, reduced]);

  const set = (p: number) => {
    target.current = Math.min(p / Math.max(assembleAt, 0.05), 1);
    if (raf.current) return;
    const step = () => {
      current.current += (target.current - current.current) * (1 - smoothing);
      if (Math.abs(target.current - current.current) < 0.0005) current.current = target.current;
      anims.current.forEach((a) => (a.currentTime = current.current * 1000));
      raf.current = current.current !== target.current ? requestAnimationFrame(step) : 0;
    };
    raf.current = requestAnimationFrame(step);
  };

  useScrollProgress(ref, set, { enabled: progress === undefined && !reduced });
  useEffect(() => {
    if (progress !== undefined) set(progress);
  });

  return (
    <Root as={as} text={text} className={className} style={style} rootRef={ref}>
      <Split text={text} char={(c) => <span data-tc-unit="" style={unitStyle}>{c.char}</span>} />
    </Root>
  );
}
