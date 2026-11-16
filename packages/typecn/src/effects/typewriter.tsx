"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Root, Split, seeded, useReducedMotion, useStyles, useTrigger, type TimedEffectProps, useLatest } from "../core";

export interface TypewriterProps extends Omit<TimedEffectProps, "easing"> {
  /** Cursor glyph. Use an empty string to hide it. */
  cursor?: string;
  cursorColor?: string;
  /** Randomness of keystroke timing, 0–1. 0 is perfectly mechanical. */
  humanize?: number;
  /** When looping, erase the text before typing it again. */
  erase?: boolean;
  /** Extra pause after punctuation, in ms. */
  punctuationPause?: number;
}

const css = `@keyframes typecn-caret{0%,45%{opacity:1}55%,100%{opacity:0}}`;

/**
 * Types the text one keystroke at a time with human cadence: uneven key timing,
 * hesitation after punctuation, optional erase-and-retype. Untyped characters keep
 * their space, so nothing reflows while typing.
 */
export function Typewriter(props: TypewriterProps) {
  const { text, className, style, as, cursor = "▍", cursorColor, humanize = 0.6, erase = true, punctuationPause = 260 } = props;
  const ref = useRef<HTMLElement>(null);
  useStyles("typewriter", css);
  const reduced = useReducedMotion();
  const { run } = useTrigger(ref, props);
  const speed = props.stagger ?? 55;
  const delay = props.delay ?? 0;
  const loop = props.loop ?? false;
  const loopDelay = props.loopDelay ?? 1600;
  const done = useLatest(props.onComplete);
  const total = Array.from(text.replace(/[ \n]/g, "")).length;
  const [count, setCount] = useState(-1);

  useEffect(() => {
    if (run === 0 || reduced) return;
    const chars = Array.from(text.replace(/[ \n]/g, ""));
    const rand = seeded(chars.length * 13 + 7);
    let timer: ReturnType<typeof setTimeout>;
    let n = 0;
    const type = () => {
      setCount(n);
      if (n >= chars.length) {
        done.current?.();
        if (loop) timer = setTimeout(erase ? backspace : restart, loopDelay);
        return;
      }
      const ch = chars[n];
      n++;
      let wait = speed * (1 - humanize * 0.5 + rand() * humanize);
      if (/[.,!?;:—]/.test(ch)) wait += punctuationPause;
      timer = setTimeout(type, wait);
    };
    const backspace = () => {
      n = Math.max(0, n - 1);
      setCount(n);
      timer = n > 0 ? setTimeout(backspace, speed * 0.45) : setTimeout(type, 400);
    };
    const restart = () => {
      n = 0;
      type();
    };
    setCount(0);
    timer = setTimeout(type, delay);
    return () => clearTimeout(timer);
  }, [run, reduced, text, speed, delay, loop, loopDelay, humanize, erase, punctuationPause, done]);

  const shown = reduced ? total : count < 0 ? (run === 0 ? 0 : 0) : count;
  const caret: CSSProperties = {
    display: "inline-block",
    width: 0,
    overflow: "visible",
    color: cursorColor,
    animation: shown < total || loop ? "typecn-caret 1s steps(1) infinite" : "typecn-caret 1s steps(1) 3 forwards",
  };
  const showCaret = cursor !== "" && !reduced;
  return (
    <Root as={as} text={text} className={className} style={style} rootRef={ref}>
      <Split
        text={text}
        char={(c) => (
          <>
            <span style={{ visibility: c.index < shown ? "visible" : "hidden" }}>{c.char}</span>
            {showCaret && c.index === shown - 1 ? <span style={caret}>{cursor}</span> : null}
          </>
        )}
      />
      {showCaret && shown === 0 ? (
        <span style={{ ...caret, position: "absolute", left: 0, top: 0 }}>{cursor}</span>
      ) : null}
    </Root>
  );
}
