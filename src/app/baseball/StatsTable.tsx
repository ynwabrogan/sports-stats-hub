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
  alignColumnKey,
}: {
  title: string;
  columns: Column[];
  rows: Row[];
  defaultSortKey: string;
  /** Key of the column whose left edge the expandable info panel should align to. */
  alignColumnKey: string;
}) {
  const [sortKey, setSortKey] = useState(defaultSortKey);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [leftOffset, setLeftOffset] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const alignHeaderRef = useRef<HTMLTableCellElement>(null);

  useEffect(() => {
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
  }, []);

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

  const sorted = [...rows].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    if (av == null) return 1;
    if (bv == null) return -1;
    const cmp =
      typeof av === "number" && typeof bv === "number"
        ? av - bv
        : String(av).localeCompare(String(bv));
    return sortDir === "asc" ? cmp : -cmp;
  });

  const selectedDef = selectedKey ? STAT_DEFINITIONS[selectedKey] : undefined;

  return (
    <div ref={sectionRef} className="relative">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>

      {selectedDef && (
        <div
          className="absolute bottom-full z-30 mb-1 max-h-60 overflow-y-auto rounded-md border border-gray-200 bg-white p-3 text-xs text-gray-700 shadow-lg dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          style={{ left: leftOffset, right: 0 }}
        >
          <p className="mb-1 text-sm font-semibold text-gray-900 dark:text-gray-50">
            {selectedDef.label}
          </p>
          <p className="mb-1.5">
            <span className="font-medium">What it is: </span>
            {selectedDef.simple}
          </p>
          <p className={selectedDef.scale ? "mb-1.5" : ""}>
            <span className="font-medium">What it tells you: </span>
            {selectedDef.abstract}
          </p>
          {selectedDef.scale && (
            <div className="border-t border-gray-200 pt-1.5 dark:border-gray-700">
              <p className="mb-0.5 font-medium">Scale:</p>
              <ul className="space-y-0">
                {selectedDef.scale.map((tier) => (
                  <li key={tier.label}>
                    {tier.emoji} {tier.label}: {tier.range}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="py-2 pr-4">#</th>
              <th className="py-2 pr-4">Player</th>
              <th className="py-2 pr-4">Team</th>
              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                return (
                  <th
                    key={col.key}
                    ref={col.key === alignColumnKey ? alignHeaderRef : undefined}
                    className="py-2 pr-4 select-none"
                  >
                    <span
                      onClick={() => handleSelect(col.statKey)}
                      className={
                        col.statKey
                          ? "cursor-pointer rounded px-0.5 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950"
                          : ""
                      }
                    >
                      {col.header}
                    </span>{" "}
                    <span
                      onClick={() => handleSort(col.key)}
                      className="cursor-pointer rounded px-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-700"
                    >
                      {isSorted ? (sortDir === "asc" ? "▲" : "▼") : "⇕"}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr key={row.id} className="border-b border-gray-100">
                <td className="py-2 pr-4 text-gray-400">{i + 1}</td>
                <td className="py-2 pr-4 font-medium">{row.name}</td>
                <td className="py-2 pr-4">{row.team}</td>
                {columns.map((col) => {
                  const value = row[col.key];
                  return (
                    <td key={col.key} className="py-2 pr-4">
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
  );
}
