"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { categories, type CategoryId } from "@/registry/types";
import { Gallery } from "./gallery";

function FromParams() {
  const category = useSearchParams().get("category");
  const initial = categories.some((c) => c.id === category) ? (category as CategoryId) : undefined;
  return <Gallery key={initial ?? "all"} initialCategory={initial} />;
}

/** Reads ?category= on the client so /effects can be prerendered (static export). */
export function GalleryRoute() {
  return (
    <Suspense fallback={<Gallery />}>
      <FromParams />
    </Suspense>
  );
}
