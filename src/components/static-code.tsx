import { highlight } from "sugar-high";
import { CopyButton } from "./copy-button";

/** Server-rendered, highlighted code (only the copy button hydrates). */
export function StaticCode({ code, lang = "tsx", title }: { code: string; lang?: "tsx" | "bash" | "css"; title?: string }) {
  const html = lang === "bash" ? code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/^(#.*)$/gm, '<span style="color:var(--faint)">$1</span>') : highlight(code);
  return (
    <div className="code border border-line bg-[var(--code-bg)]">
      <div className="flex items-center justify-between border-b border-line pl-4">
        <span className="label text-faint">{title ?? lang}</span>
        <CopyButton text={code} />
      </div>
      <pre className="thin-scroll overflow-x-auto p-4 font-mono text-[12.5px] leading-[1.7]">
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  );
}
