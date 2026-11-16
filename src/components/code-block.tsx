"use client";

import { highlight } from "sugar-high";
import { useMemo } from "react";
import { CopyButton } from "./copy-button";

export function CodeBlock({
  code,
  lang = "tsx",
  title,
  className = "",
  maxHeight,
  copy = true,
}: {
  code: string;
  lang?: "tsx" | "css" | "bash" | "json";
  title?: string;
  className?: string;
  maxHeight?: number | string;
  copy?: boolean;
}) {
  const html = useMemo(() => {
    if (lang === "bash") return code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/^(\$ )/gm, '<span style="color:var(--faint)">$1</span>');
    return highlight(code);
  }, [code, lang]);
  return (
    <div className={`code relative border border-line bg-[var(--code-bg)] ${className}`}>
      {title || copy ? (
        <div className="flex items-center justify-between border-b border-line pl-4">
          <span className="label text-faint">{title ?? lang}</span>
          {copy ? <CopyButton text={code} /> : null}
        </div>
      ) : null}
      <pre className="thin-scroll overflow-auto p-4 font-mono text-[12.5px] leading-[1.7]" style={{ maxHeight }}>
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  );
}
