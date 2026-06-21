"use client";

import { useEffect, useState } from "react";

type TrendPoint = { date: string; ops: number };

const WIDTH = 240;
const HEIGHT = 60;
const PADDING = 4;

export function TrendChart({ playerId }: { playerId: number }) {
  const [points, setPoints] = useState<TrendPoint[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/baseball/trend/${playerId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setPoints(data.points ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, [playerId]);

  if (points === null) {
    return <p className="text-[11px] text-muted">Loading season OPS trend…</p>;
  }
  if (points.length < 2) {
    return <p className="text-[11px] text-muted">Not enough games yet for a trend.</p>;
  }

  const values = points.map((p) => p.ops);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const coords = points.map((p, i) => {
    const x = PADDING + (i / (points.length - 1)) * (WIDTH - PADDING * 2);
    const y = HEIGHT - PADDING - ((p.ops - min) / range) * (HEIGHT - PADDING * 2);
    return [x, y];
  });

  const path = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const isUp = values[values.length - 1] >= values[0];
  const color = isUp ? "var(--up)" : "var(--down)";
  const latest = values[values.length - 1];
  const change = latest - values[0];

  return (
    <div>
      <div className="mb-1 flex items-center gap-2 text-[11px]">
        <span className="text-muted">Season OPS trend</span>
        <span className="font-mono font-medium" style={{ color }}>
          {latest.toFixed(3)} ({change >= 0 ? "+" : ""}
          {change.toFixed(3)})
        </span>
      </div>
      <svg width={WIDTH} height={HEIGHT} className="block">
        <path d={path} fill="none" stroke={color} strokeWidth={1.5} />
      </svg>
    </div>
  );
}
