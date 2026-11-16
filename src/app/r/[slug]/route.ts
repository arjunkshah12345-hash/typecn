import { effects, effectBySlug } from "@/registry/effects";
import { readCore, readEffect } from "@/lib/source";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export function generateStaticParams() {
  return effects.map((e) => ({ slug: `${e.slug}.json` }));
}

/** A shadcn-compatible registry item: `npx shadcn add <url>/r/<slug>.json`. */
export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const meta = effectBySlug[slug.replace(/\.json$/, "")];
  if (!meta) return Response.json({ error: "Unknown effect" }, { status: 404 });
  const item = {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    name: meta.slug,
    type: "registry:component",
    title: meta.name,
    description: meta.tagline,
    author: "typecn",
    homepage: `${site.url}/effects/${meta.slug}`,
    dependencies: [],
    files: [
      { path: "typecn/core.tsx", type: "registry:file", target: "components/typecn/core.tsx", content: readCore() },
      { path: `typecn/effects/${meta.file}.tsx`, type: "registry:file", target: `components/typecn/effects/${meta.file}.tsx`, content: readEffect(meta.file) },
    ],
  };
  return Response.json(item, { headers: { "Access-Control-Allow-Origin": "*" } });
}
