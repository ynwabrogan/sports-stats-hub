import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const SEASON = new Date().getFullYear().toString();

type StatSplit<T> = { stat: T; team?: { name: string } };
type StatGroup<T> = {
  type?: { displayName?: string };
  group?: { displayName?: string };
  splits?: StatSplit<T>[];
};

type RawHittingStat = {
  gamesPlayed: number;
  avg: string;
  hits: number;
  homeRuns: number;
  rbi: number;
  stolenBases: number;
};

type RawHittingSaberStat = {
  war: number;
  woba: number;
  wRcPlus: number;
};

type RawPitchingStat = {
  wins: number;
  losses: number;
  era: string;
  whip: string;
  inningsPitched: string;
  strikeOuts: number;
  saves: number;
};

type RawPitchingSaberStat = {
  war: number;
  fip: number;
};

function findSplit<T>(
  statGroups: Array<StatGroup<unknown>>,
  groupName: string,
  typeName: string,
): StatSplit<T> | undefined {
  return statGroups.find(
    (g) => g.group?.displayName === groupName && g.type?.displayName === typeName,
  )?.splits?.[0] as StatSplit<T> | undefined;
}

async function getPlayer(id: string) {
  const res = await fetch(
    `https://statsapi.mlb.com/api/v1/people/${id}?hydrate=stats(group=[hitting,pitching],type=[season,sabermetrics],season=${SEASON})`,
    { next: { revalidate: 86400 } },
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.people?.[0] ?? null;
}

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const person = await getPlayer(id);
  if (!person) notFound();

  const statGroups: Array<StatGroup<unknown>> = person.stats ?? [];
  const hitting = findSplit<RawHittingStat>(statGroups, "hitting", "season");
  const hittingSaber = findSplit<RawHittingSaberStat>(statGroups, "hitting", "sabermetrics");
  const pitching = findSplit<RawPitchingStat>(statGroups, "pitching", "season");
  const pitchingSaber = findSplit<RawPitchingSaberStat>(statGroups, "pitching", "sabermetrics");

  const team = hitting?.team?.name ?? pitching?.team?.name ?? "—";
  const headshotUrl = `https://img.mlbstatic.com/mlb-photos/image/upload/d_people:generic:headshot:67:current.png/q_auto:best/v1/people/${id}/headshot/67/current`;

  return (
    <main className="min-h-screen p-6 sm:p-10">
      <Link href="/baseball" className="text-xs text-gray-500 hover:text-blue-600">
        ← Back to all stats
      </Link>

      <div className="mt-4 flex items-start gap-6">
        <Image
          src={headshotUrl}
          alt={person.fullName}
          width={120}
          height={120}
          className="rounded-md bg-gray-100 dark:bg-gray-800"
          unoptimized
        />
        <div>
          <h1 className="text-2xl font-bold">{person.fullName}</h1>
          <p className="text-sm text-gray-500">
            #{person.primaryNumber ?? "—"} · {person.primaryPosition?.abbreviation ?? "—"} ·{" "}
            {team}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Bats {person.batSide?.code ?? "—"} / Throws {person.pitchHand?.code ?? "—"} ·{" "}
            {person.height} · {person.weight} lbs
          </p>
        </div>
      </div>

      {hitting && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold mb-2">{SEASON} Hitting</h2>
          <div className="flex gap-6 text-sm">
            <Stat label="G" value={hitting.stat.gamesPlayed} />
            <Stat label="AVG" value={hitting.stat.avg} />
            <Stat label="H" value={hitting.stat.hits} />
            <Stat label="HR" value={hitting.stat.homeRuns} />
            <Stat label="RBI" value={hitting.stat.rbi} />
            <Stat label="SB" value={hitting.stat.stolenBases} />
            {hittingSaber && (
              <>
                <Stat label="wOBA" value={hittingSaber.stat.woba.toFixed(3)} />
                <Stat label="wRC+" value={Math.round(hittingSaber.stat.wRcPlus)} />
                <Stat label="WAR" value={hittingSaber.stat.war.toFixed(1)} />
              </>
            )}
          </div>
        </section>
      )}

      {pitching && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold mb-2">{SEASON} Pitching</h2>
          <div className="flex gap-6 text-sm">
            <Stat label="W-L" value={`${pitching.stat.wins}-${pitching.stat.losses}`} />
            <Stat label="ERA" value={pitching.stat.era} />
            <Stat label="WHIP" value={pitching.stat.whip} />
            <Stat label="IP" value={pitching.stat.inningsPitched} />
            <Stat label="K" value={pitching.stat.strikeOuts} />
            <Stat label="SV" value={pitching.stat.saves} />
            {pitchingSaber && (
              <>
                <Stat label="FIP" value={pitchingSaber.stat.fip.toFixed(2)} />
                <Stat label="WAR" value={pitchingSaber.stat.war.toFixed(1)} />
              </>
            )}
          </div>
        </section>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-[10px] uppercase text-gray-400">{label}</p>
      <p className="font-medium text-foreground">{value}</p>
    </div>
  );
}
