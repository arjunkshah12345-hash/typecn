/** The typecn wordmark: "type" set upright, "cn" in Fraunces italic, and a vermilion full stop. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-baseline font-serif leading-none tracking-[-0.03em] ${className}`}
      style={{ fontVariationSettings: '"opsz" 72, "SOFT" 50', fontWeight: 400 }}
      aria-label="typecn"
    >
      <span aria-hidden>type</span>
      <span aria-hidden className="italic" style={{ fontVariationSettings: '"opsz" 72, "SOFT" 100, "WONK" 1' }}>
        cn
      </span>
      <span aria-hidden className="text-accent">.</span>
    </span>
  );
}
