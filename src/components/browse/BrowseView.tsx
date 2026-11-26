import Link from "next/link";
import { ControlDeck } from "@/components/device/ControlDeck";
import { DeviceShell } from "@/components/device/DeviceShell";
import { LcdScreen } from "@/components/device/LcdScreen";
import { TitleBar } from "@/components/device/TitleBar";
import { PixelButton, PixelLink } from "@/components/ui/PixelButton";
import { Sprite } from "@/components/ui/Sprite";
import { SpriteStage } from "@/components/ui/SpriteStage";
import { TypeBadge } from "@/components/ui/TypeBadge";
import { formatNumber, type Query, type Sort } from "@/lib/filter";
import type { IndexEntry } from "@/lib/types";
import { FilterPanel } from "./FilterPanel";
import styles from "./Browse.module.css";

const SORT_LABEL: Record<Sort, string> = { number: "No.", name: "Name", total: "Total" };

export interface BrowseViewProps {
  query: Query;
  rows: IndexEntry[];
  total: number;
  page: number;
  pages: number;
  selected?: IndexEntry;
  onSearch: (q: string) => void;
  onChange: (patch: Partial<Query>) => void;
  onPage: (page: number) => void;
  onSelect: (slug: string) => void;
  onClear: () => void;
  onMove: (step: 1 | -1) => void;
  onOpen: () => void;
  onBack: () => void;
}

export function BrowseView(props: BrowseViewProps) {
  const { query, rows, total, page, pages, selected } = props;
  const nextSort: Record<Sort, Sort> = { number: "name", name: "total", total: "number" };

  return (
    <DeviceShell title="★ POCKET INDEX">
      <div className={styles.columns}>
        <LcdScreen aria-label="Index list">
          <TitleBar title="INDEX LIST" value={total} />
          <input
            className={styles.search}
            type="search"
            value={query.q}
            maxLength={40}
            onChange={(e) => props.onSearch(e.target.value)}
            placeholder="SEARCH NAME / No._"
            aria-label="Search by name or number"
          />
          <p className="visually-hidden" role="status">{total} Pokémon found</p>

          {rows.length === 0 ? (
            <div className={styles.empty}>
              <p>NO MATCH FOUND</p>
              <PixelButton tone="yellow" onClick={props.onClear}>Clear filters</PixelButton>
            </div>
          ) : (
            <ul className={styles.list}>
              {rows.map((entry) => (
                <li key={entry.slug}>
                  <Link
                    href={`/pokemon/${entry.slug}`}
                    prefetch={false}
                    className={styles.row}
                    aria-current={entry.slug === selected?.slug ? "true" : undefined}
                    data-slug={entry.slug}
                    onClick={(e) => {
                      // Wide screens: first click selects, second opens.
                      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
                      if (entry.slug === selected?.slug) return;
                      if (window.matchMedia("(min-width: 960px)").matches) {
                        e.preventDefault();
                        props.onSelect(entry.slug);
                      }
                    }}
                  >
                    <span className={styles.cursor} aria-hidden="true">▶</span>
                    <Sprite src={`/sprites/${entry.id}.png`} alt="" size={48} lazy />
                    <span className={styles.info}>
                      <span>{entry.name}</span>
                      <span className={styles.badges}>
                        {entry.types.map((t) => <TypeBadge key={t} type={t} />)}
                      </span>
                    </span>
                    <span className={styles.number}>{formatNumber(entry.id)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <nav className={styles.pager} aria-label="Pages">
            <PixelButton disabled={page <= 1} onClick={() => props.onPage(page - 1)} aria-label="Previous page">◀</PixelButton>
            <span>PAGE {page}/{pages}</span>
            <PixelButton disabled={page >= pages} onClick={() => props.onPage(page + 1)} aria-label="Next page">▶</PixelButton>
          </nav>
        </LcdScreen>

        <div className={styles.side}>
          <LcdScreen aria-label="Preview" className={styles.preview}>
            <TitleBar title="PREVIEW" value={selected ? formatNumber(selected.id) : "---"} />
            {selected ? (
              <>
                <SpriteStage src={`/sprites/${selected.id}.png`} alt={selected.name} height={300} />
                <h2 className={styles.name}>{selected.name}</h2>
                <div className={styles.badges}>
                  {selected.types.map((t) => <TypeBadge key={t} type={t} />)}
                </div>
                <dl className={styles.facts}>
                  <div><dt>Height</dt><dd>{selected.heightM}m</dd></div>
                  <div><dt>Weight</dt><dd>{selected.weightKg}kg</dd></div>
                  <div><dt>Total</dt><dd>{selected.total}</dd></div>
                </dl>
                <PixelLink tone="yellow" href={`/pokemon/${selected.slug}`} prefetch={false}>Open entry</PixelLink>
              </>
            ) : (
              <p className={styles.empty}>NO ENTRY</p>
            )}
          </LcdScreen>
          <FilterPanel type={query.type} onChange={(type) => props.onChange({ type })} />
        </div>
      </div>

      <ControlDeck
        up={{ label: "Move up", onPress: () => props.onMove(-1) }}
        down={{ label: "Move down", onPress: () => props.onMove(1) }}
        left={{ label: "Previous page", onPress: () => props.onPage(page - 1), disabled: page <= 1 }}
        right={{ label: "Next page", onPress: () => props.onPage(page + 1), disabled: page >= pages }}
        a={{ label: "Open selected entry", onPress: props.onOpen, disabled: !selected }}
        b={{ label: "Back", onPress: props.onBack }}
      >
        <label className={styles.gen}>
          GEN:
          <select
            value={query.gen ?? ""}
            onChange={(e) => props.onChange({ gen: Number(e.target.value) || null })}
          >
            <option value="">ALL</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </label>
        <PixelButton tone="blue" onClick={() => props.onChange({ sort: nextSort[query.sort] })}>
          Sort: {SORT_LABEL[query.sort]}
        </PixelButton>
      </ControlDeck>
    </DeviceShell>
  );
}
