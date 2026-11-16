"use client";
import { useEffect, useRef } from "react";
import { Root, Words, after, seeded, useActive, useTextRaster, useTimed, type TimedEffectProps, useLatest } from "../core";

export interface PixelDissolveProps extends Omit<TimedEffectProps, "easing" | "stagger"> {
  /** Size of each pixel block in CSS px. */
  pixel?: number;
  /** How far pixels scatter, in multiples of the text height. */
  scatter?: number;
  /** After assembling, hold this long (ms) and then dissolve away. Only used with `loop`. */
  hold?: number;
}

interface P { hx: number; hy: number; ox: number; oy: number; d: number; }

const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);

/**
 * The text is sampled into a grid of pixel blocks. Blocks fly in from a scattered
 * cloud, sweeping left to right, and lock into crisp type. With `loop`, they drift
 * apart again like dust.
 */
export function PixelDissolve(props: PixelDissolveProps) {
  const { text, className, style, as, pixel = 4, scatter = 0.9, hold = 1600 } = props;
  const ref = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const t = useTimed(ref, props, { duration: 1800, stagger: 0, easing: "linear" });
  const active = useActive(ref);
  const { raster, version } = useTextRaster(ref, canvas, [text]);
  const done = useLatest(props.onComplete);

  useEffect(() => {
    const R = raster.current;
    if (!R || t.reduced) return;
    const { ctx, source, width, height, dpr } = R;
    ctx.clearRect(0, 0, width, height);
    if (t.run === 0) return;
    if (!active) {
      ctx.drawImage(source, 0, 0, width, height);
      return;
    }
    const sctx = source.getContext("2d")!;
    const img = sctx.getImageData(0, 0, source.width, source.height).data;
    const r = seeded(17);
    const ps: P[] = [];
    const step = Math.max(2, pixel);
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const i = (Math.floor((y + step / 2) * dpr) * source.width + Math.floor((x + step / 2) * dpr)) * 4 + 3;
        if (img[i] > 100) {
          const a = r() * Math.PI * 2;
          const dist = (0.3 + r()) * height * scatter;
          ps.push({ hx: x, hy: y, ox: x + Math.cos(a) * dist * 1.6, oy: y + Math.sin(a) * dist - height * 0.2, d: (x / width) * 0.55 + r() * 0.25 });
        }
      }
    }
    let raf = 0;
    let cancel = () => {};
    const run = (dir: 1 | -1) => {
      const t0 = performance.now() + (dir === 1 ? t.delay : 0);
      const frame = (now: number) => {
        const p = Math.max(0, (now - t0) / t.duration);
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = R.color;
        let complete = true;
        for (const q of ps) {
          let k = Math.min(Math.max((p - q.d) / 0.45, 0), 1);
          if (k < 1) complete = false;
          if (dir === -1) k = 1 - k;
          const e = easeOut(k);
          ctx.globalAlpha = Math.min(1, e * 1.4);
          ctx.fillRect(q.ox + (q.hx - q.ox) * e, q.oy + (q.hy - q.oy) * e, step - (1 - e) * step * 0.4, step - (1 - e) * step * 0.4);
        }
        ctx.globalAlpha = 1;
        if (!complete) {
          raf = requestAnimationFrame(frame);
          return;
        }
        if (dir === 1) {
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(source, 0, 0, width, height);
          done.current?.();
          if (t.loop) cancel = after(hold, () => run(-1));
        } else {
          cancel = after(t.loopDelay ?? 500, () => run(1));
        }
      };
      raf = requestAnimationFrame(frame);
    };
    run(1);
    return () => {
      cancelAnimationFrame(raf);
      cancel();
    };
  }, [version, t.run, t.reduced, t.duration, t.delay, t.loop, t.loopDelay, pixel, scatter, hold, active, raster, done]);

  return (
    <Root as={as} text={text} className={className} style={style} rootRef={ref}>
      <span style={{ visibility: t.reduced ? "visible" : "hidden" }}>
        <Words text={text} />
      </span>
      <canvas ref={canvas} style={{ position: "absolute", pointerEvents: "none", display: t.reduced ? "none" : undefined }} />
    </Root>
  );
}
