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

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
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

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-300">
            <th className="py-2 pr-4">Player</th>
            <th className="py-2 pr-4">Team</th>
            {columns.map((col) => {
              const def = col.statKey ? STAT_DEFINITIONS[col.statKey] : undefined;
              return (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="group relative cursor-pointer select-none py-2 pr-4 hover:text-blue-600"
                >
                  {col.header}
                  {sortKey === col.key && (sortDir === "asc" ? " ▲" : " ▼")}
                  {def && (
                    <div className="pointer-events-none absolute left-0 top-full z-10 mt-1 hidden w-72 rounded-md border border-gray-200 bg-white p-3 text-xs font-normal normal-case text-gray-700 shadow-lg group-hover:block dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200">
                      <p className="mb-1 font-semibold text-gray-900 dark:text-gray-50">
                        {def.label}
                      </p>
                      <p className="mb-2">
                        <span className="font-medium">What it is: </span>
                        {def.simple}
                      </p>
                      <p className={def.scale ? "mb-2" : ""}>
                        <span className="font-medium">What it tells you: </span>
                        {def.abstract}
                      </p>
                      {def.scale && (
                        <div className="border-t border-gray-200 pt-2 dark:border-gray-700">
                          <p className="mb-1 font-medium">Scale:</p>
                          <ul className="space-y-0.5">
                            {def.scale.map((tier) => (
                              <li key={tier.label}>
                                {tier.emoji} {tier.label}: {tier.range}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </th>
              );
            })}
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
    </div>
  );
}
