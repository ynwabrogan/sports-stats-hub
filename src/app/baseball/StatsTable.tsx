"use client";

import { useEffect, useRef, useState } from "react";
import { STAT_DEFINITIONS } from "./stat-definitions";

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
}: {
  title: string;
  columns: Column[];
  rows: Row[];
  defaultSortKey: string;
  /** Only show this many rows after sorting, e.g. top 50 by whichever stat is active. */
  displayLimit: number;
  /** Key of the column whose left edge the info panel should stretch to. */
  alignColumnKey?: string;
}) {
  const [sortKey, setSortKey] = useState(defaultSortKey);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
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
      <h2 className="text-lg font-semibold mb-2">{title}</h2>

      <div ref={sectionRef} className="relative">
        <div
          className="absolute bottom-full right-0 z-20 mb-1 w-64 rounded-md border border-gray-200 bg-background p-2 text-[11px] leading-snug text-gray-500 shadow-sm dark:border-gray-700"
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
            <p className="text-gray-400">Click a stat name below for what it means.</p>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="py-1 pr-2">#</th>
                <th className="py-1 pr-2">Player</th>
                <th className="py-1 pr-2">Team</th>
                {columns.map((col) => {
                  const isSorted = sortKey === col.key;
                  const arrow = isSorted && sortDir === "asc" ? "▲" : "▼";
                  return (
                    <th
                      key={col.key}
                      ref={col.key === alignColumnKey ? alignHeaderRef : undefined}
                      className="py-1 pr-2 select-none whitespace-nowrap"
                    >
                      <span
                        onClick={() => handleSelect(col.statKey)}
                        className={col.statKey ? "cursor-pointer hover:text-blue-600" : ""}
                      >
                        {col.header}
                      </span>{" "}
                      <span
                        onClick={() => handleSort(col.key)}
                        className={`cursor-pointer hover:text-blue-600 ${
                          isSorted ? "text-foreground" : "text-gray-300 dark:text-gray-600"
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
                <tr key={row.id} className="border-b border-gray-100">
                  <td className="py-0.5 pr-2 text-gray-400">{i + 1}</td>
                  <td className="py-0.5 pr-2 font-medium">{row.name}</td>
                  <td className="py-0.5 pr-2">{row.team}</td>
                  {columns.map((col) => {
                    const value = row[col.key];
                    return (
                      <td key={col.key} className="py-0.5 pr-2">
                        {value == null ? "—" : value}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
