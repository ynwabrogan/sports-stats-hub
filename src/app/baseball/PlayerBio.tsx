"use client";

import { useEffect, useState } from "react";

type Bio = {
  birthCity: string | null;
  birthStateProvince: string | null;
  birthCountry: string | null;
  height: string | null;
  weight: number | null;
  college: string | null;
  draftYear: number | null;
  draftRound: string | null;
  draftPick: number | null;
  draftTeam: string | null;
  allStarSeasons: number[];
};

function formatAllStarSeasons(seasons: number[]): string {
  if (seasons.length === 0) return "None";
  // Collapse consecutive years into ranges, e.g. 2021-2023, 2025.
  const ranges: string[] = [];
  let start = seasons[0];
  let prev = seasons[0];
  for (let i = 1; i <= seasons.length; i++) {
    const current = seasons[i];
    if (current === prev + 1) {
      prev = current;
      continue;
    }
    ranges.push(start === prev ? `${start}` : `${start}–${prev}`);
    start = current;
    prev = current;
  }
  return ranges.join(", ");
}

export function PlayerBio({ playerId }: { playerId: number }) {
  const [bio, setBio] = useState<Bio | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/baseball/bio/${playerId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setBio(data);
      });
    return () => {
      cancelled = true;
    };
  }, [playerId]);

  if (!bio) {
    return <p className="text-[11px] text-muted">Loading bio…</p>;
  }

  const birthplace = [bio.birthCity, bio.birthStateProvince, bio.birthCountry]
    .filter(Boolean)
    .join(", ");

  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[11px] text-muted">
      <Row label="Born" value={birthplace || "—"} />
      <Row label="Ht/Wt" value={bio.height && bio.weight ? `${bio.height}, ${bio.weight} lb` : "—"} />
      <Row label="College" value={bio.college ?? "—"} />
      <Row
        label="Draft"
        value={
          bio.draftYear
            ? `${bio.draftYear}, Round ${bio.draftRound} (Pick ${bio.draftPick}) – ${bio.draftTeam}`
            : "Undrafted / int'l signing"
        }
      />
      <Row label="All-Star" value={formatAllStarSeasons(bio.allStarSeasons)} />
    </dl>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="font-medium text-foreground">{label}</dt>
      <dd>{value}</dd>
    </>
  );
}
