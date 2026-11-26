"use client";

import { DEFAULT_QUERY, PAGE_SIZE } from "@/lib/filter";
import type { IndexEntry } from "@/lib/types";
import { BrowseView } from "./BrowseView";

const noop = () => {};

/** Prerendered first page, shown until the URL has been read. */
export function BrowseFallback({ rows, total }: { rows: IndexEntry[]; total: number }) {
  return (
    <BrowseView
      query={DEFAULT_QUERY}
      rows={rows}
      total={total}
      page={1}
      pages={Math.ceil(total / PAGE_SIZE)}
      selected={rows[0]}
      onSearch={noop}
      onChange={noop}
      onPage={noop}
      onSelect={noop}
      onClear={noop}
      onMove={noop}
      onOpen={noop}
      onBack={noop}
    />
  );
}
