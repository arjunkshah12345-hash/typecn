"use client";

import { useId } from "react";
import type { Control, ControlValue } from "@/registry/types";

export function Field({ label, value, children, hint }: { label: string; value?: React.ReactNode; children: React.ReactNode; hint?: string }) {
  return (
    <div className="group/field py-2.5">
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-[13px] text-muted transition-colors group-focus-within/field:text-fg group-hover/field:text-fg" title={hint}>
          {label}
        </span>
        {value !== undefined ? <span className="font-mono text-[11px] text-fg tabular-nums">{value}</span> : null}
      </div>
      {children}
    </div>
  );
}

export function Range({
  label,
  value,
  min,
  max,
  step,
  unit,
  hint,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  hint?: string;
  onChange: (v: number) => void;
}) {
  const id = useId();
  const decimals = step < 1 ? Math.min(3, String(step).split(".")[1]?.length ?? 2) : 0;
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <Field label={label} hint={hint} value={<label htmlFor={id}>{value.toFixed(decimals)}{unit ? <span className="text-faint"> {unit}</span> : null}</label>}>
      <input
        id={id}
        type="range"
        className="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        style={{ ["--fill" as string]: `${fill}%` }}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </Field>
  );
}

export function Segmented({ label, value, options, onChange, hint }: { label: string; value: string; options: readonly string[]; onChange: (v: string) => void; hint?: string }) {
  if (options.length > 4) {
    return (
      <Field label={label} hint={hint}>
        <div className="relative">
          <select
            value={value}
            aria-label={label}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 w-full cursor-pointer appearance-none border border-line bg-transparent px-2.5 font-mono text-[12px] outline-none hover:border-line-strong focus-visible:border-accent"
          >
            {options.map((o) => (
              <option key={o} value={o} className="bg-bg">
                {o}
              </option>
            ))}
          </select>
          <span aria-hidden className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[10px] text-muted">
            ▾
          </span>
        </div>
      </Field>
    );
  }
  return (
    <Field label={label} hint={hint}>
      <div className="grid border border-line" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }} role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={value === o}
            onClick={() => onChange(o)}
            className={`h-8 truncate px-1 font-mono text-[11px] transition-colors ${value === o ? "bg-fg text-bg" : "text-muted hover:text-fg"}`}
          >
            {o}
          </button>
        ))}
      </div>
    </Field>
  );
}

export function Toggle({ label, value, onChange, hint }: { label: string; value: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-[13px] text-muted" title={hint}>
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={label}
        onClick={() => onChange(!value)}
        className={`relative h-5 w-9 rounded-full border transition-colors duration-300 ${value ? "border-accent bg-accent" : "border-line-strong bg-transparent"}`}
      >
        <span
          className={`absolute top-1/2 size-3 -translate-y-1/2 rounded-full transition-all duration-500 ease-[var(--ease-out-expo)] ${value ? "left-[19px] bg-[#120a06]" : "left-[3px] bg-muted"}`}
        />
      </button>
    </div>
  );
}

export function ColorInput({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  const id = useId();
  const safe = /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#ff5a1f";
  return (
    <Field label={label} hint={hint}>
      <div className="flex h-9 items-center gap-2 border border-line px-1.5 focus-within:border-accent hover:border-line-strong">
        <label htmlFor={id} className="relative size-6 shrink-0 cursor-pointer overflow-hidden rounded-full border border-line-strong" style={{ background: safe }}>
          <input id={id} type="color" value={safe} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" aria-label={`${label} picker`} />
        </label>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          aria-label={`${label} hex`}
          className="w-full bg-transparent font-mono text-[12px] uppercase outline-none"
        />
      </div>
    </Field>
  );
}

export function TextInput({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  return (
    <Field label={label} hint={hint}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        aria-label={label}
        className="h-9 w-full border border-line bg-transparent px-2.5 font-mono text-[12px] outline-none hover:border-line-strong focus-visible:border-accent"
      />
    </Field>
  );
}

export function ControlInput({ control, value, onChange }: { control: Control; value: ControlValue; onChange: (v: ControlValue) => void }) {
  switch (control.type) {
    case "range":
      return <Range label={control.label} hint={control.hint} value={Number(value)} min={control.min} max={control.max} step={control.step} unit={control.unit} onChange={onChange} />;
    case "select":
      return <Segmented label={control.label} hint={control.hint} value={String(value)} options={control.options} onChange={onChange} />;
    case "toggle":
      return <Toggle label={control.label} hint={control.hint} value={Boolean(value)} onChange={onChange} />;
    case "color":
      return <ColorInput label={control.label} hint={control.hint} value={String(value)} onChange={onChange} />;
    case "text":
      return <TextInput label={control.label} hint={control.hint} value={String(value)} onChange={onChange} />;
  }
}
