"use client";

import * as typecn from "typecn";
import type { ComponentType, CSSProperties } from "react";
import { fonts, type ControlValue, type EffectMeta, type FontKey } from "@/registry/types";

export interface Typography {
  font: FontKey;
  size: number | string;
  weight: number;
  tracking: number;
  leading: number;
  color?: string;
}

const registry = typecn as unknown as Record<string, ComponentType<Record<string, unknown>>>;

export function typographyStyle(meta: EffectMeta, t: Typography): CSSProperties {
  const hide = new Set(meta.hide ?? []);
  return {
    fontFamily: fonts[t.font].css,
    fontSize: typeof t.size === "number" ? `${t.size}px` : t.size,
    fontWeight: hide.has("fontWeight") ? undefined : t.weight,
    letterSpacing: hide.has("letterSpacing") ? undefined : `${t.tracking}em`,
    lineHeight: t.leading,
    color: hide.has("color") ? undefined : t.color,
  };
}

export function defaultTypography(meta: EffectMeta): Typography {
  return { font: meta.font, size: meta.size, weight: meta.weight, tracking: meta.tracking ?? 0, leading: meta.leading ?? 1.05 };
}

/** Renders any registry effect from its metadata and a bag of prop values. */
export function EffectRenderer({
  meta,
  text,
  values,
  typography,
  replayKey,
  paused,
  className,
  style,
  extra,
}: {
  meta: EffectMeta;
  text?: string;
  values: Record<string, ControlValue>;
  typography: Typography;
  replayKey?: number;
  paused?: boolean;
  className?: string;
  style?: CSSProperties;
  extra?: Record<string, unknown>;
}) {
  const Comp = registry[meta.component];
  if (!Comp) return <p className="label text-accent">Missing export: {meta.component}</p>;
  const props: Record<string, unknown> = {
    ...values,
    ...meta.fixed,
    ...extra,
    text: text ?? meta.text,
    replayKey,
    className,
    style: { ...typographyStyle(meta, typography), ...style },
  };
  if (meta.kind !== "timed") props.paused = paused;
  return <Comp {...props} />;
}
