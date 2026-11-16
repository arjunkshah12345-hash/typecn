"use client";

/**
 * typecn core — shared primitives every effect is built from.
 *
 * Nothing in here is effect-specific: text splitting with an accessible
 * fallback, trigger handling (mount / inView / hover / manual), reduced-motion
 * detection, visibility-gated animation frames, pointer tracking, scroll
 * progress and a small Web Animations API stagger runner.
 */

import {
  createElement,
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ElementType,
  type ReactNode,
  type RefObject,
} from "react";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export type Trigger = "mount" | "inView" | "hover" | "manual";

export interface TextEffectProps {
  /** The text to animate. Use `\n` for explicit line breaks. */
  text: string;
  className?: string;
  style?: CSSProperties;
  /** Element to render as. Defaults to `span` (inline) or `div` for block-level effects. */
  as?: ElementType;
}

export interface TimedEffectProps extends TextEffectProps {
  /** Duration of one unit's animation in milliseconds. */
  duration?: number;
  /** Delay before the sequence starts, in milliseconds. */
  delay?: number;
  /** Delay between successive units, in milliseconds. */
  stagger?: number;
  /** A preset name (see `easings`) or any CSS easing string. */
  easing?: EasingName | (string & {});
  /** Replay the animation after it completes. */
  loop?: boolean;
  /** Pause between loops, in milliseconds. */
  loopDelay?: number;
  /** What starts the animation. */
  trigger?: Trigger;
  /** When `trigger="manual"`, the animation plays whenever this flips to `true`. */
  play?: boolean;
  /** When `trigger="inView"`, only animate the first time the text is seen. */
  once?: boolean;
  /** Change this value to replay the animation imperatively. */
  replayKey?: string | number;
  /** Called after the last unit finishes. */
  onComplete?: () => void;
}

export interface ContinuousEffectProps extends TextEffectProps {
  /** Freeze the motion without unmounting. */
  paused?: boolean;
  /** Speed multiplier. 1 is the designed tempo. */
  speed?: number;
}

/* -------------------------------------------------------------------------- */
/*                                  Easings                                   */
/* -------------------------------------------------------------------------- */

export const easings = {
  linear: "linear",
  "power.out": "cubic-bezier(0.22, 1, 0.36, 1)",
  "expo.out": "cubic-bezier(0.16, 1, 0.3, 1)",
  "expo.inOut": "cubic-bezier(0.87, 0, 0.13, 1)",
  "circ.out": "cubic-bezier(0, 0.55, 0.45, 1)",
  "back.out": "cubic-bezier(0.34, 1.56, 0.64, 1)",
  "quart.inOut": "cubic-bezier(0.76, 0, 0.24, 1)",
  "sine.inOut": "cubic-bezier(0.37, 0, 0.63, 1)",
  spring: springEasing(170, 14),
  "spring.soft": springEasing(120, 10),
} as const;

export type EasingName = keyof typeof easings;

export function resolveEasing(easing: string | undefined, fallback: EasingName = "expo.out"): string {
  if (!easing) return easings[fallback];
  return (easings as Record<string, string>)[easing] ?? easing;
}

/**
 * Builds a CSS `linear()` easing that approximates a damped spring.
 * Falls back to an overshooting cubic-bezier in browsers without `linear()`.
 */
export function springEasing(stiffness = 170, damping = 14, mass = 1, samples = 48): string {
  const w0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  const wd = w0 * Math.sqrt(Math.max(1 - zeta * zeta, 0.0001));
  // settle time ~ 6 / (zeta * w0), normalised to t ∈ [0, 1]
  const T = Math.min(6 / (zeta * w0), 4);
  const points: string[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = (i / samples) * T;
    const v =
      zeta < 1
        ? 1 - Math.exp(-zeta * w0 * t) * (Math.cos(wd * t) + ((zeta * w0) / wd) * Math.sin(wd * t))
        : 1 - Math.exp(-w0 * t) * (1 + w0 * t);
    points.push(v.toFixed(4));
  }
  points[points.length - 1] = "1";
  return `linear(${points.join(", ")})`;
}

let linearSupport: boolean | null = null;
/** `linear()` easing is not supported everywhere; degrade gracefully. */
export function safeEasing(easing: string): string {
  if (!easing.startsWith("linear(")) return easing;
  if (linearSupport === null) {
    linearSupport = typeof CSS !== "undefined" && typeof CSS.supports === "function" && CSS.supports("transition-timing-function", "linear(0, 1)");
  }
  return linearSupport ? easing : "cubic-bezier(0.34, 1.56, 0.64, 1)";
}

/* -------------------------------------------------------------------------- */
/*                                Small utils                                 */
/* -------------------------------------------------------------------------- */

export const cx = (...c: Array<string | false | null | undefined>) => c.filter(Boolean).join(" ");
export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const mapRange = (v: number, a: number, b: number, c: number, d: number) => c + ((v - a) / (b - a)) * (d - c);

/** Deterministic pseudo-random generator so SSR and client agree. */
export function seeded(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

export const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** Keeps the latest value in a ref so long-lived callbacks never go stale. */
export function useLatest<T>(value: T) {
  const ref = useRef(value);
  useIsoLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}

export const srOnly: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

const injected = new Set<string>();
/** Injects a stylesheet once per document. Safe to call during render on the client. */
export function useStyles(id: string, css: string) {
  useIsoLayoutEffect(() => {
    if (injected.has(id) || typeof document === "undefined") return;
    if (document.getElementById(`typecn-${id}`)) {
      injected.add(id);
      return;
    }
    const el = document.createElement("style");
    el.id = `typecn-${id}`;
    el.textContent = css;
    document.head.appendChild(el);
    injected.add(id);
  }, [id, css]);
}

/* -------------------------------------------------------------------------- */
/*                               Reduced motion                               */
/* -------------------------------------------------------------------------- */

const RM_QUERY = "(prefers-reduced-motion: reduce)";
function subscribeRM(cb: () => void) {
  const mq = window.matchMedia(RM_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/** `true` when the user prefers reduced motion. Always `false` on the server. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeRM,
    () => window.matchMedia(RM_QUERY).matches,
    () => false,
  );
}

/* -------------------------------------------------------------------------- */
/*                                  Viewport                                  */
/* -------------------------------------------------------------------------- */

/** Tracks whether an element intersects the viewport. */
export function useInView(ref: RefObject<Element | null>, options: { once?: boolean; rootMargin?: string; threshold?: number } = {}) {
  const { once = false, rootMargin = "0px", threshold = 0 } = options;
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && once) io.disconnect();
      },
      { rootMargin, threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, once, rootMargin, threshold]);
  return inView;
}

/** `true` when the element is on screen and the tab is visible — the gate for every continuous loop. */
export function useActive(ref: RefObject<Element | null>, paused = false) {
  const inView = useInView(ref, { rootMargin: "80px" });
  const docVisible = useSyncExternalStore(
    (cb) => {
      document.addEventListener("visibilitychange", cb);
      return () => document.removeEventListener("visibilitychange", cb);
    },
    () => document.visibilityState === "visible",
    () => true,
  );
  return inView && docVisible && !paused;
}

/* -------------------------------------------------------------------------- */
/*                                  Triggers                                  */
/* -------------------------------------------------------------------------- */

/**
 * Turns the trigger props into a monotonically increasing `run` counter.
 * `run === 0` means "not started yet" — effects render their initial state.
 */
export function useTrigger(
  ref: RefObject<HTMLElement | null>,
  { trigger = "mount", play, once = true, replayKey }: Pick<TimedEffectProps, "trigger" | "play" | "once" | "replayKey">,
) {
  const [run, setRun] = useState(0);
  const bump = useCallback(() => setRun((r) => r + 1), []);
  const inView = useInView(ref, { once, threshold: 0.15 });

  useEffect(() => {
    if (trigger === "mount") bump();
  }, [trigger, bump]);

  useEffect(() => {
    if (trigger === "inView" && inView) bump();
  }, [trigger, inView, bump]);

  useEffect(() => {
    if (trigger === "manual" && play) bump();
  }, [trigger, play, bump]);

  const firstKey = useRef(true);
  useEffect(() => {
    if (firstKey.current) {
      firstKey.current = false;
      return;
    }
    bump();
  }, [replayKey, bump]);

  useEffect(() => {
    const el = ref.current;
    if (trigger !== "hover" || !el) return;
    el.addEventListener("pointerenter", bump);
    el.addEventListener("focus", bump);
    return () => {
      el.removeEventListener("pointerenter", bump);
      el.removeEventListener("focus", bump);
    };
  }, [trigger, ref, bump]);

  return { run, replay: bump };
}

/* -------------------------------------------------------------------------- */
/*                             Animation frames                               */
/* -------------------------------------------------------------------------- */

export interface FrameInfo {
  /** Seconds since the loop started (scaled by `speed`). */
  time: number;
  /** Seconds since the previous frame (clamped). */
  delta: number;
}

/** A requestAnimationFrame loop that only runs while `active`. */
export function useFrame(callback: (frame: FrameInfo) => void, active: boolean, speed = 1) {
  const cb = useLatest(callback);
  const speedRef = useLatest(speed);
  const timeRef = useRef(0);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const delta = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      timeRef.current += delta * speedRef.current;
      cb.current({ time: timeRef.current, delta: delta * speedRef.current });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, cb, speedRef]);
}

/* -------------------------------------------------------------------------- */
/*                                  Pointer                                   */
/* -------------------------------------------------------------------------- */

export interface PointerState {
  /** Pointer position relative to the element's top-left, in px. */
  x: number;
  y: number;
  /** Normalised position, -1…1 across the element. */
  nx: number;
  ny: number;
  /** Pointer velocity in px/frame (smoothed). */
  vx: number;
  vy: number;
  inside: boolean;
  /** Has the pointer ever been seen. */
  seen: boolean;
}

/**
 * Tracks the pointer relative to an element without causing re-renders.
 * Listens on `window` so motion stays smooth when the pointer leaves the box.
 */
export function usePointer(ref: RefObject<HTMLElement | null>, enabled = true) {
  const state = useRef<PointerState>({ x: 0, y: 0, nx: 0, ny: 0, vx: 0, vy: 0, inside: false, seen: false });
  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    let lastX = 0;
    let lastY = 0;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const s = state.current;
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      s.vx = s.vx * 0.6 + (e.clientX - lastX) * 0.4;
      s.vy = s.vy * 0.6 + (e.clientY - lastY) * 0.4;
      lastX = e.clientX;
      lastY = e.clientY;
      s.x = x;
      s.y = y;
      s.nx = (x / Math.max(r.width, 1)) * 2 - 1;
      s.ny = (y / Math.max(r.height, 1)) * 2 - 1;
      s.inside = x >= 0 && y >= 0 && x <= r.width && y <= r.height;
      s.seen = true;
    };
    const onLeave = () => {
      state.current.inside = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [ref, enabled]);
  return state;
}

/* -------------------------------------------------------------------------- */
/*                                  Scroll                                    */
/* -------------------------------------------------------------------------- */

/** Finds the scroll container: the nearest `[data-typecn-scroll]` ancestor, else the window. */
export function getScrollRoot(el: Element | null): HTMLElement | null {
  return (el?.closest("[data-typecn-scroll]") as HTMLElement | null) ?? null;
}

/**
 * Reports 0→1 progress as an element travels through its scroll container.
 * 0 = element top at the container bottom, 1 = element bottom at the container top.
 * Pass `mode="pinned"` for tall pinned sections: 0 = top reaches top, 1 = bottom reaches bottom.
 */
export function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  onProgress: (p: number) => void,
  { enabled = true, mode = "through" }: { enabled?: boolean; mode?: "through" | "pinned" } = {},
) {
  const cb = useLatest(onProgress);
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    const root = getScrollRoot(el);
    const target: HTMLElement | Window = root ?? window;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const top = root ? root.getBoundingClientRect().top : 0;
      const vh = root ? root.clientHeight : window.innerHeight;
      const y = r.top - top;
      const p = mode === "pinned" ? -y / Math.max(r.height - vh, 1) : (vh - y) / (vh + r.height);
      cb.current(clamp(p));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    target.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      target.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ref, cb, enabled, mode]);
}

/* -------------------------------------------------------------------------- */
/*                               Text splitting                               */
/* -------------------------------------------------------------------------- */

export interface CharInfo {
  char: string;
  /** Index across the whole text (spaces excluded). */
  index: number;
  /** Index of the word across the whole text. */
  word: number;
  /** Index within its word. */
  inWord: number;
  line: number;
}

export interface SplitResult {
  lines: { words: { chars: CharInfo[]; index: number; text: string }[]; index: number; text: string }[];
  chars: number;
  words: number;
}

/** Splits text into lines → words → characters with stable global indices. Grapheme-aware. */
export function splitText(text: string): SplitResult {
  const seg =
    typeof Intl !== "undefined" && "Segmenter" in Intl
      ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
      : null;
  const graphemes = (s: string) => (seg ? Array.from(seg.segment(s), (x) => x.segment) : Array.from(s));
  let c = 0;
  let w = 0;
  const lines = text.split("\n").map((line, li) => ({
    index: li,
    text: line,
    words: line
      .split(" ")
      .filter((word) => word.length > 0)
      .map((word) => ({
        index: w++,
        text: word,
        chars: graphemes(word).map((ch, ci) => ({ char: ch, index: c++, word: w - 1, inWord: ci, line: li })),
      })),
  }));
  return { lines, chars: c, words: w };
}

const nowrap: CSSProperties = { display: "inline-block", whiteSpace: "nowrap" };
const unitBase: CSSProperties = { display: "inline-block", whiteSpace: "pre" };

export interface SplitProps {
  text: string;
  /** Render a single character. Return value is wrapped in nothing — attach `data-tc-unit` yourself if needed. */
  char?: (c: CharInfo) => ReactNode;
  /** Render a whole word (overrides `char`). */
  word?: (w: { text: string; index: number; chars: CharInfo[] }) => ReactNode;
  /** Wrap each line (overrides default block line). */
  line?: (l: { text: string; index: number; children: ReactNode }) => ReactNode;
  wordStyle?: CSSProperties;
}

/**
 * Renders split text that wraps at word boundaries and preserves explicit line breaks.
 * Each line is a block; each word an unbreakable inline-block; spaces are real spaces.
 */
export function Split({ text, char, word, line, wordStyle }: SplitProps) {
  const { lines } = splitText(text);
  return (
    <>
      {lines.map((l) => {
        const children = l.words.map((w, wi) => (
          <Fragment key={w.index}>
            {word ? (
              word(w)
            ) : (
              <span style={{ ...nowrap, ...wordStyle }}>
                {w.chars.map((c) =>
                  char ? <Fragment key={c.index}>{char(c)}</Fragment> : <span key={c.index} data-tc-unit="" style={unitBase}>{c.char}</span>,
                )}
              </span>
            )}
            {wi < l.words.length - 1 ? " " : null}
          </Fragment>
        ));
        return line ? (
          <Fragment key={l.index}>{line({ text: l.text, index: l.index, children })}</Fragment>
        ) : (
          <span key={l.index} style={{ display: "block" }}>
            {l.words.length ? children : " "}
          </span>
        );
      })}
    </>
  );
}

export const unitStyle = unitBase;

/* -------------------------------------------------------------------------- */
/*                                   Root                                     */
/* -------------------------------------------------------------------------- */

export interface RootProps {
  as?: ElementType;
  text: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  rootRef?: RefObject<HTMLElement | null>;
  /** Extra attributes for the root element. */
  attrs?: Record<string, unknown>;
  /** Default display for the root. */
  display?: CSSProperties["display"];
}

/**
 * Every effect renders through Root: assistive tech gets the plain text once,
 * the animated split markup is hidden from the accessibility tree.
 */
export function Root({ as = "span", text, className, style, children, rootRef, attrs, display = "inline-block" }: RootProps) {
  return createElement(
    as,
    {
      ref: rootRef,
      className: cx("typecn", className),
      style: { position: "relative", display, ...style },
      "data-typecn": "",
      ...attrs,
    },
    <span style={srOnly}>{text}</span>,
    <span aria-hidden="true" style={{ display: "contents" }}>
      {children}
    </span>,
  );
}

/* -------------------------------------------------------------------------- */
/*                         Web Animations stagger runner                      */
/* -------------------------------------------------------------------------- */

export interface StaggerOptions {
  run: number;
  duration: number;
  delay: number;
  stagger: number;
  easing: string;
  loop?: boolean;
  loopDelay?: number;
  reduced: boolean;
  /** Selector for the animated units inside the root. */
  selector?: string;
  /** Order units are played in. */
  order?: (count: number) => number[];
  onComplete?: () => void;
  /** Re-run when these change (e.g. text). */
  deps?: unknown[];
}

/**
 * Animates every `[data-tc-unit]` in `ref` with WAAPI. Units before the first run
 * should be rendered in their "from" state by the effect (see `hiddenUntil`).
 * Cancels cleanly on re-run/unmount; supports looping.
 */
export function useStagger(
  ref: RefObject<HTMLElement | null>,
  keyframes: (index: number, count: number, el: HTMLElement) => Keyframe[],
  opts: StaggerOptions,
) {
  const kf = useLatest(keyframes);
  const done = useLatest(opts.onComplete);
  const order = useLatest(opts.order);
  const { run, duration, delay, stagger, easing, loop, loopDelay = 900, reduced, selector = "[data-tc-unit]" } = opts;
  const deps = opts.deps ?? [];
  // Layout effect: starts animations before paint so units never flash in their final state.
  useIsoLayoutEffect(() => {
    const root = ref.current;
    if (!root || run === 0 || reduced) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>(selector));
    const n = els.length;
    if (!n) return;
    const sequence = order.current?.(n) ?? els.map((_, i) => i);
    let anims: Animation[] = [];
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;
    const ease = safeEasing(easing);
    const play = () => {
      anims.forEach((a) => a.cancel());
      anims = els.map((el, i) =>
        el.animate(kf.current(i, n, el), {
          duration,
          delay: delay + sequence[i] * stagger,
          easing: ease,
          fill: "both",
        }),
      );
      Promise.all(anims.map((a) => a.finished))
        .then(() => {
          if (cancelled) return;
          done.current?.();
          if (loop) timer = setTimeout(play, loopDelay);
        })
        .catch(() => {});
    };
    play();
    return () => {
      cancelled = true;
      clearTimeout(timer);
      anims.forEach((a) => a.cancel());
    };
  }, [ref, run, duration, delay, stagger, easing, loop, loopDelay, reduced, selector, kf, done, order, ...deps]);
}

/** Style applied to units before the first run so there is no flash of final text. */
export function hiddenUntil(run: number, reduced: boolean, style: CSSProperties): CSSProperties | undefined {
  return run === 0 && !reduced ? style : undefined;
}

/** Shorthand for timed effects: resolves defaults, trigger and reduced motion in one call. */
export function useTimed(
  ref: RefObject<HTMLElement | null>,
  props: TimedEffectProps,
  defaults: { duration: number; stagger: number; easing: EasingName | string; delay?: number },
) {
  const reduced = useReducedMotion();
  const { run, replay } = useTrigger(ref, props);
  return {
    run,
    replay,
    reduced,
    duration: props.duration ?? defaults.duration,
    delay: props.delay ?? defaults.delay ?? 0,
    stagger: props.stagger ?? defaults.stagger,
    easing: resolveEasing(props.easing ?? defaults.easing),
    loop: props.loop ?? false,
    loopDelay: props.loopDelay,
  };
}

/** A promise-free sleep that is cancelled via the returned function. */
export function after(ms: number, fn: () => void) {
  const t = setTimeout(fn, ms);
  return () => clearTimeout(t);
}

/** Measures an element's size and keeps it updated. */
export function useSize(ref: RefObject<HTMLElement | null>) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      setSize((s) => (s.width === width && s.height === height ? s : { width, height }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

/** Collects `[data-tc-unit]` elements after each render (cheap, no re-render). */
export function useUnits(ref: RefObject<HTMLElement | null>, deps: unknown[], selector = "[data-tc-unit]") {
  const units = useRef<HTMLElement[]>([]);
  useIsoLayoutEffect(() => {
    units.current = ref.current ? Array.from(ref.current.querySelectorAll<HTMLElement>(selector)) : [];
  }, deps);
  return units;
}

/** Reads computed text styles (font, color, size) for canvas-based effects. */
export function readFont(el: HTMLElement) {
  const cs = getComputedStyle(el);
  return {
    font: `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`,
    size: parseFloat(cs.fontSize),
    color: cs.color,
    lineHeight: cs.lineHeight === "normal" ? parseFloat(cs.fontSize) * 1.15 : parseFloat(cs.lineHeight),
    letterSpacing: cs.letterSpacing === "normal" ? 0 : parseFloat(cs.letterSpacing),
    family: cs.fontFamily,
    weight: cs.fontWeight,
  };
}

export interface UnitLayout {
  el: HTMLElement;
  /** Centre relative to the root, ignoring transforms. */
  cx: number;
  cy: number;
  w: number;
  h: number;
}

function offsetWithin(el: HTMLElement, root: HTMLElement) {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== root) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x, y };
}

/**
 * Collects animated units and their untransformed centres. Re-measures on resize
 * and once web fonts finish loading. Returned ref never triggers re-renders.
 */
export function useUnitLayout(ref: RefObject<HTMLElement | null>, deps: unknown[], selector = "[data-tc-unit]") {
  const layout = useRef<UnitLayout[]>([]);
  const size = useSize(ref);
  useIsoLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const measure = () => {
      layout.current = Array.from(root.querySelectorAll<HTMLElement>(selector)).map((el) => {
        const o = offsetWithin(el, root);
        return { el, cx: o.x + el.offsetWidth / 2, cy: o.y + el.offsetHeight / 2, w: el.offsetWidth, h: el.offsetHeight };
      });
    };
    measure();
    let alive = true;
    document.fonts?.ready.then(() => alive && measure());
    return () => {
      alive = false;
    };
  }, [ref, selector, size.width, size.height, ...deps]);
  return layout;
}

/* -------------------------------------------------------------------------- */
/*                               Canvas helpers                               */
/* -------------------------------------------------------------------------- */

export interface TextRaster {
  /** Visible canvas context (already scaled for DPR). */
  ctx: CanvasRenderingContext2D;
  /** Offscreen canvas holding the text drawn in its final position (device pixels). */
  source: HTMLCanvasElement;
  /** CSS-pixel size of the drawing area (root size + padding on every side). */
  width: number;
  height: number;
  dpr: number;
  /** Padding in CSS px around the root box. */
  pad: number;
  color: string;
  font: string;
}

/**
 * Prepares a canvas overlay that exactly matches the DOM text layout. Words are
 * measured from the (invisible) DOM and drawn into an offscreen source canvas, so
 * wrapping, alignment and fonts always match the HTML.
 * The root must contain `[data-tc-word]` elements.
 */
export function useTextRaster(
  ref: RefObject<HTMLElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  deps: unknown[],
  { padEm = 0.3, color }: { padEm?: number; color?: string } = {},
) {
  const raster = useRef<TextRaster | null>(null);
  const [version, setVersion] = useState(0);
  const size = useSize(ref);
  useIsoLayoutEffect(() => {
    const root = ref.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    let alive = true;
    const build = () => {
      if (!alive) return;
      const f = readFont(root);
      const pad = Math.round(f.size * padEm);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = root.offsetWidth + pad * 2;
      const height = root.offsetHeight + pad * 2;
      if (!width || !height) return;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.style.left = `${-pad}px`;
      canvas.style.top = `${-pad}px`;
      const ctx = canvas.getContext("2d")!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const source = document.createElement("canvas");
      source.width = canvas.width;
      source.height = canvas.height;
      const sctx = source.getContext("2d")!;
      sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const fill = color ?? f.color;
      sctx.fillStyle = fill;
      sctx.font = f.font;
      sctx.textBaseline = "middle";
      if ("letterSpacing" in sctx) (sctx as unknown as { letterSpacing: string }).letterSpacing = `${f.letterSpacing}px`;
      root.querySelectorAll<HTMLElement>("[data-tc-word]").forEach((w) => {
        const o = offsetWithin(w, root);
        sctx.fillText(w.textContent ?? "", o.x + pad, o.y + pad + w.offsetHeight / 2 + f.size * 0.04);
      });
      raster.current = { ctx, source, width, height, dpr, pad, color: fill, font: f.font };
      setVersion((v) => v + 1);
    };
    build();
    document.fonts?.ready.then(build);
    return () => {
      alive = false;
    };
  }, [ref, canvasRef, size.width, size.height, padEm, color, ...deps]);
  return { raster, version };
}

/** Word-level split where each word carries `data-tc-word` — used by canvas effects. */
export function Words({ text, style }: { text: string; style?: CSSProperties }) {
  return <Split text={text} word={(w) => <span data-tc-word="" style={{ ...nowrap, ...style }}>{w.text}</span>} />;
}

/** Smooth value noise in 3D (x, y, t) — cheap, deterministic, good enough for masks. */
export function makeNoise(seed = 1) {
  const r = seeded(seed);
  const perm = new Uint8Array(512);
  const p = Array.from({ length: 256 }, (_, i) => i).sort(() => r() - 0.5);
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const vals = Float32Array.from({ length: 256 }, () => r());
  const fade = (t: number) => t * t * (3 - 2 * t);
  const h = (x: number, y: number, z: number) => vals[perm[(perm[(perm[x & 255] + y) & 255] + z) & 255]];
  return (x: number, y: number, z: number) => {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    const xf = fade(x - xi), yf = fade(y - yi), zf = fade(z - zi);
    const l = (a: number, b: number, t: number) => a + (b - a) * t;
    return l(
      l(l(h(xi, yi, zi), h(xi + 1, yi, zi), xf), l(h(xi, yi + 1, zi), h(xi + 1, yi + 1, zi), xf), yf),
      l(l(h(xi, yi, zi + 1), h(xi + 1, yi, zi + 1), xf), l(h(xi, yi + 1, zi + 1), h(xi + 1, yi + 1, zi + 1), xf), yf),
      zf,
    );
  };
}
