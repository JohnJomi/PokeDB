"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DEFAULT_QUERY, filterEntries, parseQuery, toSearch, type Query } from "@/lib/filter";
import type { IndexEntry } from "@/lib/types";
import { BrowseView } from "./BrowseView";

export function BrowseScreen({ entries }: { entries: IndexEntry[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const urlQuery = parseQuery(params);
  // The input is controlled locally so typing never lags behind the router.
  const [text, setText] = useState(urlQuery.q);
  const [slug, setSlug] = useState<string>();
  const query = { ...urlQuery, q: text };
  const result = filterEntries(entries, query);
  const selected = result.rows.find((e) => e.slug === slug) ?? result.rows[0];

  useEffect(() => {
    const sync = () => setText(parseQuery(new URLSearchParams(window.location.search)).q);
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  const replace = (next: Query) => router.replace(`/${toSearch(next)}`, { scroll: false });
  const change = (patch: Partial<Query>) => replace({ ...query, page: 1, ...patch });
  const search = (q: string) => {
    setText(q);
    replace({ ...query, q, page: 1 });
  };
  const goToPage = (page: number) => {
    if (page >= 1 && page <= result.pages) router.push(`/${toSearch({ ...query, page })}`);
  };
  const select = (next: string) => {
    setSlug(next);
    document.querySelector(`[data-slug="${next}"]`)?.scrollIntoView({ block: "nearest" });
  };
  const move = (step: 1 | -1) => {
    const at = result.rows.findIndex((e) => e.slug === selected?.slug) + step;
    if (result.rows[at]) select(result.rows[at].slug);
  };
  const open = () => {
    if (selected) router.push(`/pokemon/${selected.slug}`);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      if (target.closest("input, select, textarea")) return;
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        move(e.key === "ArrowUp" ? -1 : 1);
      } else if (e.key === "ArrowLeft") goToPage(result.page - 1);
      else if (e.key === "ArrowRight") goToPage(result.page + 1);
      else if (e.key === "Enter" && !target.closest("a, button")) open();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <BrowseView
      {...result}
      query={query}
      selected={selected}
      onSearch={search}
      onChange={change}
      onPage={goToPage}
      onSelect={select}
      onClear={() => {
        setText("");
        replace(DEFAULT_QUERY);
      }}
      onMove={move}
      onOpen={open}
      onBack={() => router.back()}
    />
  );
}
