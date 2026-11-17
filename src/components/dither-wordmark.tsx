"use client";

import { useEffect, useRef } from "react";
import { atkinsonDither, type Color } from "@/lib/ditherkit";
import { useReducedMotion } from "typecn";

const BW: Color[] = [
  { r: 0, g: 0, b: 0 },
  { r: 255, g: 255, b: 255 },
];

function hexToRgb(hex: string) {
  const m = hex.trim().replace("#", "");
  const n = parseInt(m.length === 3 ? m.replace(/./g, "$&$&") : m.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
}

/**
 * A giant wordmark rasterised to a low-res canvas, lit by a moving spotlight
 * and run through ditherkit's Atkinson error diffusion every frame. Ink cells
 * take the accent colour; paper cells are transparent.
 */
export function DitherWordmark({ text = "typecn", cell = 5, className = "" }: { text?: string; cell?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const out = canvas.getContext("2d");
    const src = document.createElement("canvas");
    const sctx = src.getContext("2d", { willReadFrequently: true });
    if (!out || !sctx) return;

    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = false;
    let last = 0;
    const pointer = { x: 0.5, y: 0.4, active: false };
    const [ar, ag, ab] = hexToRgb(getComputedStyle(document.documentElement).getPropertyValue("--accent") || "#ff5b24");
    const family = getComputedStyle(document.body).fontFamily;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = Math.max(40, Math.round(rect.width / cell));
      h = Math.max(10, Math.round(rect.height / cell));
      canvas.width = src.width = w;
      canvas.height = src.height = h;
    };

    const draw = (t: number) => {
      sctx.globalCompositeOperation = "source-over";
      sctx.fillStyle = "#000";
      sctx.fillRect(0, 0, w, h);
      // Fit the word to the box.
      let size = h * 1.08;
      sctx.font = `700 ${size}px ${family}`;
      const m = sctx.measureText(text).width;
      size = Math.min(size, (size * w * 0.98) / m);
      sctx.font = `700 ${size}px ${family}`;
      sctx.textAlign = "center";
      sctx.textBaseline = "alphabetic";
      sctx.fillStyle = "#fff";
      sctx.letterSpacing = `${-size * 0.06}px`;
      sctx.fillText(text, w / 2, h * 0.76);
      // Spotlight: multiply a radial falloff over the white letters.
      const lx = pointer.active ? pointer.x * w : (0.5 + Math.sin(t / 2600) * 0.38) * w;
      const ly = pointer.active ? pointer.y * h : (0.45 + Math.cos(t / 3300) * 0.25) * h;
      const g = sctx.createRadialGradient(lx, ly, 0, lx, ly, w * 0.42);
      g.addColorStop(0, "#fff");
      g.addColorStop(0.45, "#8a8a8a");
      g.addColorStop(1, "#1c1c1c");
      sctx.globalCompositeOperation = "multiply";
      sctx.fillStyle = g;
      sctx.fillRect(0, 0, w, h);

      const img = sctx.getImageData(0, 0, w, h);
      atkinsonDither(img.data, w, h, BW);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const ink = d[i] > 127;
        d[i] = ar;
        d[i + 1] = ag;
        d[i + 2] = ab;
        d[i + 3] = ink ? 255 : 0;
      }
      out.putImageData(img, 0, 0);
    };

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (t - last < 1000 / 20) return; // 20 fps is plenty for a dither
      last = t;
      draw(t);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      if (reduced) draw(0);
      else raf = requestAnimationFrame(loop);
    };

    resize();
    draw(0);
    const ro = new ResizeObserver(() => {
      resize();
      draw(performance.now());
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
      else cancelAnimationFrame(raf);
    });
    io.observe(canvas);
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = (e.clientX - r.left) / r.width;
      pointer.y = (e.clientY - r.top) / r.height;
      pointer.active = pointer.x > -0.2 && pointer.x < 1.2 && pointer.y > -0.6 && pointer.y < 1.6;
      if (reduced && visible) draw(0);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.fonts?.ready.then(() => draw(performance.now()));

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [text, cell, reduced]);

  return <canvas ref={ref} aria-hidden className={`block w-full [image-rendering:pixelated] ${className}`} />;
}
