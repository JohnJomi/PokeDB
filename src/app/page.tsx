import { Suspense } from "react";
import { BrowseFallback } from "@/components/browse/BrowseFallback";
import { BrowseScreen } from "@/components/browse/BrowseScreen";
import { PAGE_SIZE } from "@/lib/filter";
import { getIndex } from "@/lib/data";

export default function HomePage() {
  const entries = getIndex();
  return (
    <Suspense fallback={<BrowseFallback rows={entries.slice(0, PAGE_SIZE)} total={entries.length} />}>
      <BrowseScreen entries={entries} />
    </Suspense>
  );
}
