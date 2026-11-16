import type { Control, EffectMeta } from "@/registry/types";

interface Row {
  name: string;
  type: string;
  def: string;
  desc: string;
}

function typeOf(c: Control) {
  switch (c.type) {
    case "range":
      return "number";
    case "toggle":
      return "boolean";
    case "select":
      return c.options.map((o) => `"${o}"`).join(" | ");
    default:
      return "string";
  }
}

function defOf(c: Control) {
  const v = c.libDefault ?? c.default;
  if (v === "") return "—";
  if (typeof v === "string") return `"${v}"`;
  return String(v);
}

const descriptions: Record<string, string> = {
  duration: "Duration of each unit's animation (ms).",
  delay: "Delay before the sequence starts (ms).",
  stagger: "Delay between successive units (ms).",
  easing: "Preset name or any CSS easing string.",
  loop: "Replay after completing.",
  trigger: "What starts the animation.",
  speed: "Tempo multiplier for continuous motion.",
};

export function apiRows(meta: EffectMeta): Row[] {
  const rows: Row[] = [
    { name: "text", type: "string", def: "required", desc: "Text to animate. Use \\n for line breaks." },
    { name: "as", type: "ElementType", def: `"${meta.fixed?.as ?? "span"}"`, desc: "Element to render (e.g. h1, p)." },
    { name: "className", type: "string", def: "—", desc: "Class for the root element." },
    { name: "style", type: "CSSProperties", def: "—", desc: "Inline styles for the root (typography lives here)." },
  ];
  for (const c of meta.controls) rows.push({ name: c.key, type: typeOf(c), def: defOf(c), desc: c.hint ?? descriptions[c.key] ?? c.label });
  if (meta.kind === "timed") {
    if (!meta.controls.some((c) => c.key === "trigger")) rows.push({ name: "trigger", type: '"mount" | "inView" | "hover" | "manual"', def: '"mount"', desc: "What starts the animation." });
    rows.push(
      { name: "play", type: "boolean", def: "—", desc: 'With trigger="manual", plays whenever it becomes true.' },
      { name: "once", type: "boolean", def: "true", desc: 'With trigger="inView", only animate the first time.' },
      { name: "replayKey", type: "string | number", def: "—", desc: "Change it to replay imperatively." },
      { name: "loopDelay", type: "number", def: "≈900", desc: "Pause between loops (ms)." },
      { name: "onComplete", type: "() => void", def: "—", desc: "Called when the sequence finishes." },
    );
  } else if (meta.kind === "scroll") {
    rows.push({ name: "progress", type: "number", def: "—", desc: "Drive the effect manually (0–1) instead of from scroll." });
  } else {
    rows.push({ name: "paused", type: "boolean", def: "false", desc: "Freeze motion without unmounting." });
  }
  return rows;
}

export function ApiTable({ meta }: { meta: EffectMeta }) {
  const rows = apiRows(meta);
  return (
    <div className="thin-scroll overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left text-[14px]">
        <thead>
          <tr className="border-b border-line-strong">
            {["Prop", "Type", "Default", "Description"].map((h) => (
              <th key={h} scope="col" className="label py-3 pr-4 font-normal text-faint">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-b border-line align-top">
              <td className="py-3 pr-4 font-mono text-[13px] text-fg">{r.name}</td>
              <td className="max-w-[240px] py-3 pr-4 font-mono text-[12px] break-words text-accent">{r.type}</td>
              <td className="py-3 pr-4 font-mono text-[12px] text-muted">{r.def}</td>
              <td className="py-3 text-muted">{r.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
