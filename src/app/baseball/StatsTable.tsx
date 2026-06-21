"use client";

import Image from "next/image";
import { Fragment, useEffect, useRef, useState } from "react";
import { STAT_DEFINITIONS } from "./stat-definitions";
import { TrendChart } from "./TrendChart";

function headshotUrl(id: number) {
  return `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/q_auto:best/v1/people/${id}/headshot/67/current`;
}

// Run-value stats that can be negative or positive, styled like a price change.
const DELTA_KEYS = new Set(["war", "offWar", "defWar", "wraa", "bsr", "def"]);

function DeltaValue({ columnKey, value }: { columnKey: string; value: string | number }) {
  if (typeof value !== "number" || !DELTA_KEYS.has(columnKey)) {
    return <span className="font-mono">{value}</span>;
  }
  const color = value > 0 ? "text-up" : value < 0 ? "text-down" : "text-muted";
  const sign = value > 0 ? "+" : "";
  return (
    <span className={`font-mono ${color}`}>
      {sign}
      {value}
    </span>
  );
}

export type Row = {
  id: number;
  name: string;
  team: string;
  [key: string]: string | number;
};

export type Column = {
  key: string;
  header: string;
  statKey?: string;
};

export function StatsTable({
  title,
  columns,
  rows,
  defaultSortKey,
  displayLimit,
  alignColumnKey,
  showTrend = false,
}: {
  title: string;
  columns: Column[];
  rows: Row[];
  defaultSortKey: string;
  /** Only show this many rows after sorting, e.g. top 50 by whichever stat is active. */
  displayLimit: number;
  /** Key of the column whose left edge the info panel should stretch to. */
  alignColumnKey?: string;
  /** Whether the expanded row should show the season OPS trend chart. */
  showTrend?: boolean;
}) {
  const [sortKey, setSortKey] = useState(defaultSortKey);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [expandedPlayerId, setExpandedPlayerId] = useState<number | null>(null);
  const [leftOffset, setLeftOffset] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const alignHeaderRef = useRef<HTMLTableCellElement>(null);

  useEffect(() => {
    if (!alignColumnKey) return;

    function measure() {
      const headerRect = alignHeaderRef.current?.getBoundingClientRect();
      const sectionRect = sectionRef.current?.getBoundingClientRect();
      if (headerRect && sectionRect) {
        setLeftOffset(Math.max(headerRect.left - sectionRect.left, 0));
      }
    }

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [alignColumnKey]);

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function handleSelect(statKey: string | undefined) {
    if (!statKey) return;
    setSelectedKey((current) => (current === statKey ? null : statKey));
  }

  function handleToggleExpand(id: number) {
    setExpandedPlayerId((current) => (current === id ? null : id));
  }

  const sorted = [...rows]
    .sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    })
    .slice(0, displayLimit);

  const selectedDef = selectedKey ? STAT_DEFINITIONS[selectedKey] : undefined;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2 text-accent">{title}</h2>

      <div ref={sectionRef} className="relative">
        <div
          className="absolute bottom-full right-0 z-20 mb-1 w-64 rounded-md border border-border bg-surface p-2 text-[11px] leading-snug text-muted shadow-sm"
          style={alignColumnKey ? { left: leftOffset ?? undefined, width: "auto" } : undefined}
        >
          {selectedDef ? (
            <div className="text-justify">
              <p className="font-medium text-foreground">{selectedDef.label}</p>
              <p>{selectedDef.simple}</p>
              <p>{selectedDef.abstract}</p>
              {selectedDef.scale && (
                <p className="mt-1.5">
                  {selectedDef.scale.map((tier) => `${tier.emoji} ${tier.range}`).join("  ")}
                </p>
              )}
            </div>
          ) : (
            <p className="text-muted">Click a stat name below for what it means.</p>
          )}
        </div>

        <div className="overflow-x-auto rounded-md border border-border bg-surface">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-background text-muted">
                <th className="py-1.5 px-2">#</th>
                <th className="py-1.5 px-2">Player</th>
                <th className="py-1.5 px-2">Team</th>
                {columns.map((col) => {
                  const isSorted = sortKey === col.key;
                  const arrow = isSorted && sortDir === "asc" ? "▲" : "▼";
                  return (
                    <th
                      key={col.key}
                      ref={col.key === alignColumnKey ? alignHeaderRef : undefined}
                      className="py-1.5 px-2 select-none whitespace-nowrap"
                    >
                      <span
                        onClick={() => handleSelect(col.statKey)}
                        className={col.statKey ? "cursor-pointer hover:text-accent" : ""}
                      >
                        {col.header}
                      </span>{" "}
                      <span
                        onClick={() => handleSort(col.key)}
                        className={`cursor-pointer hover:text-accent ${
                          isSorted ? "text-accent" : "text-muted/50"
                        }`}
                      >
                        {arrow}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {sorted.map((row, i) => (
                <Fragment key={row.id}>
                  <tr
                    className="relative origin-left border-b border-border text-foreground transition-transform duration-100 hover:z-10 hover:scale-[1.015] hover:bg-background hover:shadow-md"
                  >
                    <td className="py-0.5 px-2 font-mono text-muted">{i + 1}</td>
                    <td className="py-0.5 px-2 font-medium">
                      <button
                        type="button"
                        onClick={() => handleToggleExpand(row.id)}
                        className="cursor-pointer hover:text-accent"
                      >
                        {row.name}
                      </button>
                    </td>
                    <td className="py-0.5 px-2 text-muted">{row.team}</td>
                    {columns.map((col) => {
                      const value = row[col.key];
                      return (
                        <td key={col.key} className="py-0.5 px-2">
                          {value == null ? (
                            <span className="text-muted">—</span>
                          ) : (
                            <DeltaValue columnKey={col.key} value={value} />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  {expandedPlayerId === row.id && (
                    <tr className="border-b border-border bg-background">
                      <td colSpan={columns.length + 3} className="p-3">
                        <div className="flex items-center gap-4">
                          <Image
                            src={headshotUrl(row.id)}
                            alt={row.name}
                            width={64}
                            height={64}
                            className="rounded-md bg-border"
                            unoptimized
                          />
                          <span className="font-medium text-foreground">{row.name}</span>
                          {showTrend && <TrendChart playerId={row.id} />}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
