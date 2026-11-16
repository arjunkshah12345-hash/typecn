import { Hero } from "@/components/hero";
import { CategoryIndex } from "@/components/category-index";
import { Gallery } from "@/components/gallery";
import { DevSection } from "@/components/dev-section";
import { Closing } from "@/components/closing";
import { site } from "@/lib/site";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: "typecn",
    description: site.description,
    codeRepository: site.repo,
    programmingLanguage: ["TypeScript", "React"],
    license: "https://opensource.org/licenses/MIT",
    url: site.url,
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero />
      <CategoryIndex />
      <section id="collection" className="container-x pb-24" aria-labelledby="collection-title">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <h2 id="collection-title" className="font-serif text-[clamp(56px,9vw,150px)] leading-[0.85] tracking-[-0.045em]">
            The collection
          </h2>
          <p className="max-w-[36ch] text-muted">Every card is running the real component. Hover for interactions, replay with ↻, open any card for its playground.</p>
        </div>
        <Gallery />
      </section>
      <DevSection />
      <Closing />
    </>
  );
}
