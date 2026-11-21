"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Expand, Keyboard, Link2, Monitor, Pause, Play, RotateCcw, Smartphone, Tablet, Undo2 } from "lucide-react";
import { effects, effectBySlug } from "@/registry/effects";
import { categories, fonts, type ControlValue, type FontKey } from "@/registry/types";
import { decodeState, encodeState, initialState, reactCode, type PlaygroundState } from "@/lib/codegen";
import { EffectRenderer } from "../effect-renderer";
import { copyText } from "../copy-button";
import { ColorInput, ControlInput, Range } from "./controls";
import { CodePanel } from "./code-panel";

const presets = [
  { name: "Paper", bg: "#f2eee6", fg: "#171512" },
  { name: "Ink", bg: "#171512", fg: "#f2eee6" },
  { name: "Signal", bg: "#df4a1f", fg: "#fff8f2" },
  { name: "Bone", bg: "#e7e1d5", fg: "#171512" },
  { name: "White", bg: "#ffffff", fg: "#171512" },
];

const modes = [
  { id: "fluid", label: "Fluid", icon: Monitor, width: "100%" },
  { id: "tablet", label: "Tablet · 768", icon: Tablet, width: "768px" },
  { id: "mobile", label: "Mobile · 390", icon: Smartphone, width: "390px" },
] as const;

/** Effects whose timelines are driven by rAF/timeouts rather than WAAPI and can't be frozen mid-flight. */
const NOT_PAUSABLE = new Set(["scramble-decode", "typewriter", "pixel-dissolve", "noise-reveal", "character-explosion"]);

export function Playground({ slug: initialSlug, mode = "effect" }: { slug: string; mode?: "effect" | "page" }) {
  const router = useRouter();
  const [slug, setSlug] = useState(initialSlug);
  const meta = effectBySlug[slug] ?? effects[0];
  const [state, setState] = useState<PlaygroundState>(() => initialState(meta));
  const [replay, setReplay] = useState(0);
  const [paused, setPaused] = useState(false);
  const [settled, setSettled] = useState(false);
  const [view, setView] = useState<(typeof modes)[number]["id"]>("fluid");
  const [toast, setToast] = useState<string | null>(null);
  const [showKeys, setShowKeys] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const hydrated = useRef(false);

  // Restore state from the URL before first paint (shareable links). The URL is an
  // external system, so syncing it into state here is intentional.
  /* eslint-disable react-hooks/set-state-in-effect */
  useLayoutEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const fromUrl = mode === "page" ? p.get("effect") : null;
    const m = fromUrl && effectBySlug[fromUrl] ? effectBySlug[fromUrl] : meta;
    if (m.slug !== slug) setSlug(m.slug);
    setState(decodeState(m, p));
    hydrated.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Keep the URL in sync so the address bar is always a share link.
  const shareUrl = useCallback(() => {
    const p = encodeState(meta, state);
    if (mode === "page") p.set("effect", meta.slug);
    const qs = p.toString();
    return `${window.location.origin}${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${mode === "page" ? "/playground" : `/effects/${meta.slug}`}${qs ? `?${qs}` : ""}`;
  }, [meta, state, mode]);

  useEffect(() => {
    if (!hydrated.current) return;
    const t = setTimeout(() => {
      const url = new URL(shareUrl());
      window.history.replaceState(window.history.state, "", url.pathname + url.search);
    }, 250);
    return () => clearTimeout(t);
  }, [shareUrl]);

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast((t) => (t === msg ? null : t)), 1800);
  };

  const doReplay = useCallback(() => {
    setReplay((r) => r + 1);
    setPaused(false);
    setSettled(false);
  }, []);

  const switchEffect = useCallback(
    (next: string) => {
      const m = effectBySlug[next];
      if (!m) return;
      if (mode === "effect") {
        router.push(`/effects/${next}`);
        return;
      }
      setSlug(next);
      setState(initialState(m));
      setReplay((r) => r + 1);
      setPaused(false);
      setSettled(false);
    },
    [mode, router],
  );

  const idx = effects.findIndex((e) => e.slug === meta.slug);
  const prev = effects[(idx - 1 + effects.length) % effects.length];
  const next = effects[(idx + 1) % effects.length];

  const pausable = meta.kind !== "scroll" && !NOT_PAUSABLE.has(meta.slug);

  // Pause/resume: continuous effects get the `paused` prop; WAAPI/CSS animations in the stage are frozen too.
  useEffect(() => {
    const el = stageRef.current;
    if (!el || !pausable) return;
    const anims = el.getAnimations({ subtree: true });
    anims.forEach((a) => (paused ? a.pause() : a.play()));
  }, [paused, pausable, replay, state]);

  const setValue = (k: string, v: ControlValue) => setState((s) => ({ ...s, values: { ...s.values, [k]: v } }));
  const set = <K extends keyof PlaygroundState>(k: K, v: PlaygroundState[K]) => setState((s) => ({ ...s, [k]: v }));

  const fullscreen = () => {
    const el = stageRef.current?.parentElement;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.().catch(() => flash("Fullscreen unavailable"));
  };

  const copyLink = async () => {
    if (await copyText(shareUrl())) flash("Share link copied");
  };

  const reset = () => {
    setState(initialState(meta));
    doReplay();
    flash("Reset to defaults");
  };

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing = t.isContentEditable || /^(textarea|select)$/i.test(t.tagName) || (t.tagName === "INPUT" && !/range|checkbox|radio|color/.test((t as HTMLInputElement).type));
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
      switch (e.key.toLowerCase()) {
        case "r":
          doReplay();
          break;
        case " ":
          if (t.tagName === "BUTTON") return;
          if (pausable) {
            e.preventDefault();
            setPaused((p) => !p);
          }
          break;
        case "f":
          fullscreen();
          break;
        case "s":
          copyLink();
          break;
        case "c":
          copyText(reactCode(meta, state)).then((ok) => ok && flash("React code copied"));
          break;
        case "[":
          switchEffect(prev.slug);
          break;
        case "]":
          switchEffect(next.slug);
          break;
        case "?":
          setShowKeys((v) => !v);
          break;
        case "escape":
          setShowKeys(false);
          break;
        default:
          return;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const typography = useMemo(
    () => ({ font: state.font, size: state.size, weight: state.weight, tracking: state.tracking, leading: state.leading, color: state.color }),
    [state.font, state.size, state.weight, state.tracking, state.leading, state.color],
  );

  const values = useMemo(() => {
    const v: Record<string, ControlValue> = { ...state.values };
    return v;
  }, [state.values]);

  // Preview type scales down on narrow stages (mobile, preview modes) so it never clips.
  const fit = { fontSize: `min(${state.size}px, ${(state.size / 9.6).toFixed(2)}cqi)` };
  const status = meta.kind === "scroll" ? "Scroll-driven" : paused ? "Paused" : settled && !state.values.loop ? "Settled" : "Playing";
  const timingControls = meta.controls.filter((c) => c.group === "timing");
  const effectControls = meta.controls.filter((c) => c.group !== "timing");
  const hide = new Set(meta.hide ?? []);
  const cat = categories.find((c) => c.id === meta.category)!;
  const scroll = meta.kind === "scroll";
  const sticky = meta.slug === "sticky-typography";

  return (
    <div className="container-x" data-playground>
    <div className="overflow-hidden border border-line-strong bg-bg">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* ------------------------------ Stage ------------------------------ */}
        <div className="relative flex min-w-0 flex-col bg-bg-2 lg:h-[calc(100svh-110px)] lg:min-h-[620px] [&:fullscreen]:h-screen">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3 py-2">
            <div className="flex min-w-0 items-center gap-3">
              {mode === "page" ? (
                <div className="flex items-center">
                  <IconButton label={`Previous: ${prev.name} ([)`} onClick={() => switchEffect(prev.slug)}>
                    <ChevronLeft className="size-4" />
                  </IconButton>
                  <label className="relative">
                    <span className="sr-only">Effect</span>
                    <select
                      value={meta.slug}
                      onChange={(e) => switchEffect(e.target.value)}
                      className="h-8 max-w-[220px] cursor-pointer appearance-none truncate bg-transparent pr-5 pl-1 font-serif text-[19px] italic tracking-[-0.01em] outline-none focus-visible:text-accent"
                    >
                      {categories.map((c) => (
                        <optgroup key={c.id} label={`${c.letter} · ${c.name}`} className="bg-bg">
                          {effects
                            .filter((e) => e.category === c.id)
                            .map((e) => (
                              <option key={e.slug} value={e.slug} className="bg-bg font-sans">
                                {String(e.number).padStart(2, "0")} {e.name}
                              </option>
                            ))}
                        </optgroup>
                      ))}
                    </select>
                    <span aria-hidden className="pointer-events-none absolute top-1/2 right-0.5 -translate-y-1/2 text-[10px] text-muted">
                      ▾
                    </span>
                  </label>
                  <IconButton label={`Next: ${next.name} (])`} onClick={() => switchEffect(next.slug)}>
                    <ChevronRight className="size-4" />
                  </IconButton>
                </div>
              ) : (
                <span className="label text-muted">
                  N° {String(meta.number).padStart(2, "0")} · {cat.name}
                </span>
              )}
              <span className="label flex items-center gap-1.5 text-muted" aria-live="polite">
                <span className={status === "Playing" ? "dot-live" : "size-[7px] rounded-full border border-current"} />
                {status}
              </span>
            </div>

            <div className="flex items-center gap-0.5">
              <div className="mr-1 hidden items-center gap-0.5 sm:flex" role="radiogroup" aria-label="Preview width">
                {modes.map((m) => (
                  <IconButton key={m.id} label={m.label} active={view === m.id} onClick={() => setView(m.id)} role="radio">
                    <m.icon className="size-4" />
                  </IconButton>
                ))}
              </div>
              <div className="mr-1 hidden items-center gap-1 md:flex" aria-label="Background presets">
                {presets.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    title={`${p.name} background`}
                    aria-label={`${p.name} background`}
                    aria-pressed={state.bg === p.bg}
                    onClick={() => setState((s) => ({ ...s, bg: p.bg, color: p.fg }))}
                    className={`size-4 rounded-full border transition-transform hover:scale-125 ${state.bg === p.bg ? "border-accent ring-1 ring-accent ring-offset-2 ring-offset-bg-2" : "border-line-strong"}`}
                    style={{ background: p.bg }}
                  />
                ))}
              </div>
              <IconButton label="Replay (R)" onClick={doReplay}>
                <RotateCcw className="size-4" />
              </IconButton>
              {pausable ? (
                <IconButton label={paused ? "Play (Space)" : "Pause (Space)"} onClick={() => setPaused((p) => !p)}>
                  {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
                </IconButton>
              ) : null}
              <IconButton label="Fullscreen (F)" onClick={fullscreen}>
                <Expand className="size-4" />
              </IconButton>
              <IconButton label="Copy share link (S)" onClick={copyLink}>
                <Link2 className="size-4" />
              </IconButton>
              <IconButton label="Keyboard shortcuts (?)" onClick={() => setShowKeys((v) => !v)} active={showKeys}>
                <Keyboard className="size-4" />
              </IconButton>
            </div>
          </div>

          <div className="relative flex min-h-[420px] flex-1 items-stretch justify-center overflow-hidden p-0 sm:p-3">
            <div
              ref={stageRef}
              className="relative flex w-full flex-col overflow-hidden [container-type:inline-size] transition-[max-width,background-color] duration-700 ease-[var(--ease-out-expo)]"
              style={{ maxWidth: modes.find((m) => m.id === view)!.width, background: state.bg, color: state.color, boxShadow: view === "fluid" ? undefined : "0 0 0 1px var(--line-strong)" }}
              data-stage=""
            >
              {scroll ? (
                <div data-typecn-scroll="" className="thin-scroll relative h-full max-h-[calc(100svh-180px)] min-h-[420px] overflow-y-auto overscroll-contain">
                  {!sticky ? <div className="flex h-[75%] min-h-[300px] items-end justify-center pb-6 label opacity-50">Scroll inside the stage ↓</div> : null}
                  <div className={sticky ? "" : "px-6 py-10 sm:px-12"}>
                    <EffectRenderer key={`${meta.slug}-${replay}`} meta={meta} text={state.text} values={values} typography={typography} replayKey={replay} style={fit} />
                  </div>
                  {!sticky ? <div className="h-[110%] min-h-[420px]" /> : null}
                </div>
              ) : (
                <div className={`relative flex flex-1 items-center justify-center px-5 py-12 sm:px-12 ${meta.slug === "text-trail" ? "[&>*]:self-stretch" : ""}`}>
                  <div className={`w-full text-center ${meta.slug === "text-trail" ? "grid" : ""}`}>
                    <EffectRenderer
                      key={`${meta.slug}-${replay}`}
                      meta={meta}
                      text={state.text}
                      values={values}
                      typography={typography}
                      replayKey={replay}
                      paused={paused}
                      extra={{ onComplete: () => setSettled(true) }}
                      style={meta.slug === "text-trail" ? { ...fit, minHeight: 360, width: "100%" } : fit}
                    />
                  </div>
                </div>
              )}
              {meta.hint ? (
                <span className="label pointer-events-none absolute bottom-3 left-3 opacity-50" style={{ color: state.color }}>
                  ↖ {meta.hint}
                </span>
              ) : null}
            </div>

            <AnimatePresence>
              {showKeys ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-3 bottom-3 z-20 w-64 border border-line-strong bg-bg p-4 shadow-[0_20px_60px_-30px_rgb(0_0_0/0.35)]"
                  role="dialog"
                  aria-label="Keyboard shortcuts"
                >
                  <p className="label mb-3 text-muted">Keyboard</p>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[13px]">
                    {[
                      ["R", "Replay"],
                      ["Space", "Play / pause"],
                      ["F", "Fullscreen"],
                      ["S", "Copy share link"],
                      ["C", "Copy React code"],
                      ["[  ]", "Previous / next effect"],
                      ["?", "Toggle this panel"],
                    ].map(([k, v]) => (
                      <div key={k} className="contents">
                        <dt>
                          <kbd className="rounded border border-line-strong px-1.5 font-mono text-[11px]">{k}</kbd>
                        </dt>
                        <dd className="text-muted">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <AnimatePresence>
              {toast ? (
                <motion.div
                  key={toast}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="label absolute top-4 left-1/2 z-30 -translate-x-1/2 rounded-full bg-fg px-3.5 py-2 text-bg"
                  role="status"
                >
                  {toast}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>

        {/* ----------------------------- Controls ----------------------------- */}
        <aside className="thin-scroll border-t border-line lg:h-[calc(100svh-110px)] lg:min-h-[620px] lg:overflow-y-auto lg:border-t-0 lg:border-l" aria-label="Controls">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <span className="label text-muted">Controls</span>
            <button type="button" onClick={reset} className="label flex items-center gap-1.5 text-muted transition-colors hover:text-fg">
              <Undo2 className="size-3.5" /> Reset
            </button>
          </div>

          <Group title="Content">
            <label className="block py-2.5">
              <span className="mb-1.5 block text-[13px] text-muted">Text</span>
              <textarea
                value={state.text}
                onChange={(e) => set("text", e.target.value)}
                rows={Math.min(5, Math.max(2, state.text.split("\n").length + 1))}
                maxLength={400}
                aria-label="Text"
                spellCheck={false}
                className="w-full resize-y rounded-xl border border-line bg-transparent p-2.5 text-[14px] leading-snug outline-none hover:border-line-strong focus-visible:border-accent"
              />
              <span className="mt-1 block text-[11px] text-faint">
                {meta.slug === "vertical-rolling-headline" || meta.slug === "morphing-headline" ? "One phrase per line." : "Use line breaks for multi-line layouts."}
              </span>
            </label>
          </Group>

          <Group title="Typography">
            <div className="py-2.5">
              <span className="mb-1.5 block text-[13px] text-muted">Font family</span>
              <div className="grid grid-cols-2 gap-1" role="radiogroup" aria-label="Font family">
                {(Object.keys(fonts) as FontKey[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    role="radio"
                    aria-checked={state.font === f}
                    onClick={() => set("font", f)}
                    title={fonts[f].note}
                    className={`flex h-14 flex-col items-start justify-between rounded-xl border px-2.5 py-1.5 text-left transition-colors ${
                      state.font === f ? "border-fg" : "border-line text-muted hover:border-line-strong hover:text-fg"
                    }`}
                  >
                    <span style={{ fontFamily: fonts[f].css }} className="text-[20px] leading-none">
                      Ag
                    </span>
                    <span className="w-full truncate text-[11px]">{fonts[f].label}</span>
                  </button>
                ))}
              </div>
            </div>
            <Range label="Size" value={state.size} min={12} max={320} step={1} unit="px" onChange={(v) => set("size", v)} />
            {!hide.has("fontWeight") ? <Range label="Weight" value={state.weight} min={100} max={900} step={10} onChange={(v) => set("weight", v)} /> : null}
            {!hide.has("letterSpacing") ? <Range label="Letter spacing" value={state.tracking} min={-0.15} max={0.5} step={0.005} unit="em" onChange={(v) => set("tracking", v)} /> : null}
            <Range label="Line height" value={state.leading} min={0.7} max={2} step={0.01} onChange={(v) => set("leading", v)} />
            {!hide.has("color") ? <ColorInput label="Text colour" value={state.color} onChange={(v) => set("color", v)} /> : null}
            <ColorInput label="Background" value={state.bg} onChange={(v) => set("bg", v)} />
          </Group>

          {timingControls.length ? (
            <Group title="Timing">
              {timingControls.map((c) => (
                <ControlInput key={c.key} control={c} value={state.values[c.key]} onChange={(v) => setValue(c.key, v)} />
              ))}
            </Group>
          ) : null}

          {effectControls.length ? (
            <Group title={meta.name}>
              {effectControls.map((c) => (
                <ControlInput key={c.key} control={c} value={state.values[c.key]} onChange={(v) => setValue(c.key, v)} />
              ))}
            </Group>
          ) : null}

          <div className="px-4 py-5">
            {mode === "page" ? (
              <Link href={`/effects/${meta.slug}`} className="ulink text-sm text-muted hover:text-fg">
                Read the {meta.name} docs →
              </Link>
            ) : (
              <Link href={`/playground?effect=${meta.slug}`} className="ulink text-sm text-muted hover:text-fg">
                Open in the full playground →
              </Link>
            )}
          </div>
        </aside>
      </div>

      <CodePanel meta={meta} state={state} />
    </div>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-b border-line px-4 pt-3 pb-2">
      <legend className="label float-left mb-1 w-full text-faint">{title}</legend>
      <div className="clear-left">{children}</div>
    </fieldset>
  );
}

function IconButton({
  label,
  onClick,
  children,
  active,
  role,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
  role?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      role={role}
      aria-checked={role === "radio" ? !!active : undefined}
      aria-pressed={role ? undefined : active}
      className={`grid size-8 place-items-center rounded-full transition-colors ${active ? "bg-fg text-bg" : "text-muted hover:bg-fg/10 hover:text-fg"}`}
    >
      {children}
    </button>
  );
}
