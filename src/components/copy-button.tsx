"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for insecure contexts
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

export function CopyButton({ text, label = "Copy", className = "" }: { text: string; label?: string; className?: string }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setDone(false), 1600);
    return () => clearTimeout(t);
  }, [done]);
  return (
    <button
      type="button"
      onClick={async () => setDone(await copyText(text))}
      className={`label inline-flex h-8 items-center gap-1.5 px-2.5 text-muted transition-colors hover:text-fg ${className}`}
      aria-label={done ? "Copied" : label}
      data-copied={done || undefined}
    >
      <span className="relative grid size-3.5 place-items-center">
        <Copy className={`absolute size-3.5 transition-all duration-300 ${done ? "scale-50 opacity-0" : "scale-100 opacity-100"}`} />
        <Check className={`absolute size-3.5 text-accent transition-all duration-300 ${done ? "scale-100 opacity-100" : "scale-50 opacity-0"}`} />
      </span>
      <span aria-live="polite">{done ? "Copied" : label}</span>
    </button>
  );
}
