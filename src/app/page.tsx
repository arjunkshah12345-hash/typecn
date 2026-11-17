import { Hero } from "@/components/hero";
import { Featured } from "@/components/home/featured";
import { Tune } from "@/components/home/tune";
import { LibraryTree } from "@/components/home/library-tree";
import { Inside } from "@/components/home/inside";
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
      <Featured />
      <Tune />
      <LibraryTree />
      <Inside />
      <Closing />
    </>
  );
}
