"use client";
import { useEffect, useRef } from "react";
import { Root, useActive, useReducedMotion, useSize, type ContinuousEffectProps } from "../core";

export interface TextMarqueeProps extends ContinuousEffectProps {
  /** Pixels per second at speed 1. */
  velocity?: number;
  direction?: "left" | "right";
  /** Glyph placed between repetitions. */
  separator?: string;
  /** Slow to a crawl while hovered. */
  pauseOnHover?: boolean;
  /** Page scrolling temporarily accelerates the marquee. */
  scrollBoost?: boolean;
}

/**
 * An endless ribbon of type. Two identical tracks loop with a single WAAPI animation;
 * scrolling the page briefly accelerates it and hovering eases it to a stop.
 */
export function TextMarquee(props: TextMarqueeProps) {
  const { text, className, style, as = "div", velocity = 90, direction = "left", separator = "✳", pauseOnHover = true, scrollBoost = true, paused, speed = 1 } = props;
  const ref = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const active = useActive(ref, paused);
  const { width } = useSize(track);
  const anim = useRef<Animation | null>(null);

  useEffect(() => {
    const el = track.current;
    if (!el || reduced || !width) return;
    const half = width / 2;
    const a = el.animate(
      direction === "left"
        ? [{ transform: "translate3d(0,0,0)" }, { transform: `translate3d(${-half}px,0,0)` }]
        : [{ transform: `translate3d(${-half}px,0,0)` }, { transform: "translate3d(0,0,0)" }],
      { duration: (half / Math.max(velocity * speed, 1)) * 1000, iterations: Infinity },
    );
    anim.current = a;
    return () => {
      a.cancel();
      anim.current = null;
    };
  }, [width, velocity, speed, direction, reduced]);

  useEffect(() => {
    const a = anim.current;
    if (!a) return;
    if (active) a.play();
    else a.pause();
  }, [active, width, velocity, speed, direction, reduced]);

  // Rate control: hover easing + scroll boost, one rAF only while something is changing.
  useEffect(() => {
    const root = ref.current;
    if (!root || reduced) return;
    let target = 1;
    let rate = 1;
    let boost = 0;
    let lastY = window.scrollY;
    let raf = 0;
    const step = () => {
      boost *= 0.92;
      rate += (target + boost - rate) * 0.08;
      if (anim.current) anim.current.playbackRate = Math.max(rate, 0.0001);
      raf = Math.abs(target + boost - rate) > 0.002 || boost > 0.01 ? requestAnimationFrame(step) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(step);
    };
    const enter = () => {
      if (pauseOnHover) {
        target = 0.12;
        kick();
      }
    };
    const leave = () => {
      target = 1;
      kick();
    };
    const onScroll = () => {
      if (!scrollBoost) return;
      const y = window.scrollY;
      boost = Math.min(boost + Math.abs(y - lastY) * 0.04, 5);
      lastY = y;
      kick();
    };
    root.addEventListener("pointerenter", enter);
    root.addEventListener("pointerleave", leave);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener("pointerenter", enter);
      root.removeEventListener("pointerleave", leave);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pauseOnHover, scrollBoost, reduced]);

  const flat = text.replace(/\n/g, " ");
  const copies = Array.from({ length: 4 }, (_, i) => (
    <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "0.45em", paddingRight: "0.45em" }}>
      <span>{flat}</span>
      {separator ? <span style={{ fontSize: "0.6em", opacity: 0.6 }}>{separator}</span> : null}
    </span>
  ));
  return (
    <Root as={as} text={flat} className={className} style={{ overflow: "hidden", maxWidth: "100%", ...style }} rootRef={ref} display="block">
      <div ref={track} style={{ display: "inline-flex", whiteSpace: "nowrap", willChange: reduced ? undefined : "transform" }}>
        {copies}
        {copies}
      </div>
    </Root>
  );
}
