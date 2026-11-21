import type { ReactNode } from "react";

/** Running head + display headline used by every homepage section. */
export function SectionHead({ id, n, kicker, title, children, aside }: { id: string; n: string; kicker: string; title: ReactNode; children?: ReactNode; aside?: ReactNode }) {
  return (
    <header className="mb-10 sm:mb-14">
      <div className="label flex items-center justify-between gap-4 border-b border-line-strong pb-3 text-muted">
        <span>
          <span className="mr-3 text-faint">§ {n}</span>
          {kicker}
        </span>
        {aside ? <span className="hidden sm:inline">{aside}</span> : null}
      </div>
      <div className="grid gap-6 pt-8 md:grid-cols-12 md:items-end">
        <h2 id={id} className="display text-[clamp(44px,6.4vw,96px)] md:col-span-7">
          {title}
        </h2>
        {children ? <div className="text-[17px] leading-relaxed text-pretty text-muted md:col-span-5 md:pb-2">{children}</div> : null}
      </div>
    </header>
  );
}
