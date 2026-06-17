"use client";

import { useState } from "react";
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

const TOOLTIP_WIDTH = 224; // px, matches w-56
const VIEWPORT_MARGIN = 8;

export function StatsTable({
  columns,
  rows,
  defaultSortKey,
}: {
  columns: Column[];
  rows: Row[];
  defaultSortKey: string;
}) {
  const [sortKey, setSortKey] = useState(defaultSortKey);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [hovered, setHovered] = useState<{ key: string; left: number; top: number } | null>(null);

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function handleEnter(key: string, target: HTMLElement) {
    const rect = target.getBoundingClientRect();
    const left = Math.min(
      Math.max(rect.left, VIEWPORT_MARGIN),
      window.innerWidth - TOOLTIP_WIDTH - VIEWPORT_MARGIN,
    );
    setHovered({ key, left, top: rect.bottom + 4 });
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

  const hoveredCol = hovered ? columns.find((c) => c.key === hovered.key) : undefined;
  const hoveredDef = hoveredCol?.statKey ? STAT_DEFINITIONS[hoveredCol.statKey] : undefined;

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="py-2 pr-4">Player</th>
            <th className="py-2 pr-4">Team</th>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                onMouseEnter={(e) => col.statKey && handleEnter(col.key, e.currentTarget)}
                onMouseLeave={() => setHovered(null)}
                className="cursor-pointer select-none py-2 pr-4 hover:text-blue-600"
              >
                {col.header}
                {sortKey === col.key && (sortDir === "asc" ? " ▲" : " ▼")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={row.id} className="border-b border-gray-100">
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

      {hovered && hoveredDef && (
        <div
          className="pointer-events-none fixed z-50 w-56 max-h-[70vh] overflow-y-auto rounded-md border border-gray-200 bg-white p-2 text-[11px] leading-snug font-normal normal-case text-gray-700 shadow-lg dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
          style={{ left: hovered.left, top: hovered.top }}
        >
          <p className="mb-1 font-semibold text-gray-900 dark:text-gray-50">
            {hoveredDef.label}
          </p>
          <p className="mb-1.5">
            <span className="font-medium">What it is: </span>
            {hoveredDef.simple}
          </p>
          <p className={hoveredDef.scale ? "mb-1.5" : ""}>
            <span className="font-medium">What it tells you: </span>
            {hoveredDef.abstract}
          </p>
          {hoveredDef.scale && (
            <div className="border-t border-gray-200 pt-1.5 dark:border-gray-700">
              <p className="mb-0.5 font-medium">Scale:</p>
              <ul className="space-y-0">
                {hoveredDef.scale.map((tier) => (
                  <li key={tier.label}>
                    {tier.emoji} {tier.label}: {tier.range}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
