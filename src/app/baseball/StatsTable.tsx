"use client";

import { useEffect, useRef, useState } from "react";
import { useReportStatColumnLeft, useSetHoveredStat } from "./StatInfoPanel";

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
  alignPanelToColumn,
}: {
  columns: Column[];
  rows: Row[];
  defaultSortKey: string;
  /** Key of the column whose left edge the info panel should align to. */
  alignPanelToColumn?: string;
}) {
  const [sortKey, setSortKey] = useState(defaultSortKey);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const setHoveredStat = useSetHoveredStat();
  const reportColumnLeft = useReportStatColumnLeft();
  const alignHeaderRef = useRef<HTMLTableCellElement>(null);

  useEffect(() => {
    if (!alignPanelToColumn) return;

    function measure() {
      const rect = alignHeaderRef.current?.getBoundingClientRect();
      if (rect) reportColumnLeft(rect.left);
    }

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [alignPanelToColumn, reportColumnLeft]);

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
          <tr
            className="border-b border-gray-300"
            onMouseLeave={() => setHoveredStat(null)}
          >
            <th className="py-2 pr-4">#</th>
            <th className="py-2 pr-4">Player</th>
            <th className="py-2 pr-4">Team</th>
            {columns.map((col) => (
              <th
                key={col.key}
                ref={col.key === alignPanelToColumn ? alignHeaderRef : undefined}
                onClick={() => handleSort(col.key)}
                onMouseEnter={() => setHoveredStat(col.statKey ?? null)}
                className="cursor-pointer select-none py-2 pr-4 hover:text-blue-600"
              >
                {col.header}
                {sortKey === col.key && (sortDir === "asc" ? " ▲" : " ▼")}
              </th>
            ))}
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
  );
}
