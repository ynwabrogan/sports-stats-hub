import { StatsTable, type Column, type Row } from "./StatsTable";

const HITTERS = [
  { id: 592450, name: "Aaron Judge" },
  { id: 660271, name: "Shohei Ohtani" },
  { id: 605141, name: "Mookie Betts" },
  { id: 660670, name: "Ronald Acuña Jr." },
  { id: 518692, name: "Freddie Freeman" },
  { id: 665742, name: "Juan Soto" },
  { id: 670541, name: "Yordan Alvarez" },
  { id: 677951, name: "Bobby Witt Jr." },
  { id: 656941, name: "Kyle Schwarber" },
  { id: 608369, name: "Corey Seager" },
];

const PITCHERS = [
  { id: 694973, name: "Paul Skenes" },
  { id: 669373, name: "Tarik Skubal" },
  { id: 554430, name: "Zack Wheeler" },
  { id: 675911, name: "Spencer Strider" },
  { id: 676979, name: "Garrett Crochet" },
  { id: 657277, name: "Logan Webb" },
];

const SEASON = new Date().getFullYear().toString();

type StatSplit<T> = { stat: T; team?: { name: string } };
type StatGroup<T> = { type?: { displayName?: string }; splits?: StatSplit<T>[] };

type RawHittingStat = {
  gamesPlayed: number;
  homeRuns: number;
  rbi: number;
  hits: number;
  avg: string;
};

type RawHittingSaberStat = {
  war: number;
  wRcPlus: number;
  woba: number;
  wRaa: number;
  baseRunning: number;
  fielding: number;
};

type RawPitchingStat = {
  wins: number;
  losses: number;
  era: string;
  whip: string;
  inningsPitched: string;
  strikeoutsPer9Inn: string;
  outs: number;
};

type RawPitchingSaberStat = {
  war: number;
  fip: number;
  xfip: number;
  fipMinus: number;
};

function formatInningsPitched(outs: number): string {
  const whole = Math.floor(outs / 3);
  const remainder = outs % 3;
  return `${whole}.${remainder}`;
}

async function fetchPerson(id: number, group: "hitting" | "pitching") {
  const res = await fetch(
    `https://statsapi.mlb.com/api/v1/people/${id}?hydrate=stats(group=${group},type=[season,sabermetrics],season=${SEASON})`,
    { next: { revalidate: 86400 } },
  );
  const data = await res.json();
  return data.people?.[0];
}

function findSplit<T>(
  statGroups: Array<StatGroup<unknown>>,
  typeName: string,
): StatSplit<T> | undefined {
  return statGroups.find((g) => g.type?.displayName === typeName)
    ?.splits?.[0] as StatSplit<T> | undefined;
}

async function getHitterRow(id: number, name: string): Promise<Row> {
  const person = await fetchPerson(id, "hitting");
  const statGroups: Array<StatGroup<unknown>> = person?.stats ?? [];
  const season = findSplit<RawHittingStat>(statGroups, "season");
  const saber = findSplit<RawHittingSaberStat>(statGroups, "sabermetrics");

  return {
    id,
    name,
    team: season?.team?.name ?? "—",
    gamesPlayed: season?.stat.gamesPlayed ?? "—",
    avg: season?.stat.avg ?? "—",
    hits: season?.stat.hits ?? "—",
    homeRuns: season?.stat.homeRuns ?? "—",
    rbi: season?.stat.rbi ?? "—",
    woba: saber ? Number(saber.stat.woba.toFixed(3)) : "—",
    wraa: saber ? Number(saber.stat.wRaa.toFixed(1)) : "—",
    wrcPlus: saber ? Math.round(saber.stat.wRcPlus) : "—",
    bsr: saber ? Number(saber.stat.baseRunning.toFixed(1)) : "—",
    def: saber ? Number(saber.stat.fielding.toFixed(1)) : "—",
    war: saber ? Number(saber.stat.war.toFixed(1)) : "—",
  };
}

async function getPitcherRow(id: number, name: string): Promise<Row> {
  const person = await fetchPerson(id, "pitching");
  const statGroups: Array<StatGroup<unknown>> = person?.stats ?? [];
  const season = findSplit<RawPitchingStat>(statGroups, "season");
  const saber = findSplit<RawPitchingSaberStat>(statGroups, "sabermetrics");

  return {
    id,
    name,
    team: season?.team?.name ?? "—",
    record: season
      ? `${season.stat.wins}-${season.stat.losses}`
      : "—",
    era: season ? Number(season.stat.era) : "—",
    whip: season ? Number(season.stat.whip) : "—",
    ip: season ? Number(formatInningsPitched(season.stat.outs)) : "—",
    k9: season ? Number(season.stat.strikeoutsPer9Inn) : "—",
    fip: saber ? Number(saber.stat.fip.toFixed(2)) : "—",
    xfip: saber ? Number(saber.stat.xfip.toFixed(2)) : "—",
    fipMinus: saber ? Math.round(saber.stat.fipMinus) : "—",
    war: saber ? Number(saber.stat.war.toFixed(1)) : "—",
  };
}

const HITTER_COLUMNS: Column[] = [
  { key: "gamesPlayed", header: "G" },
  { key: "avg", header: "AVG", statKey: "avg" },
  { key: "hits", header: "H", statKey: "hits" },
  { key: "homeRuns", header: "HR", statKey: "homeRuns" },
  { key: "rbi", header: "RBI", statKey: "rbi" },
  { key: "woba", header: "wOBA", statKey: "woba" },
  { key: "wraa", header: "wRAA", statKey: "wraa" },
  { key: "wrcPlus", header: "wRC+", statKey: "wrcPlus" },
  { key: "bsr", header: "BsR", statKey: "bsr" },
  { key: "def", header: "Def", statKey: "def" },
  { key: "war", header: "WAR", statKey: "war" },
];

const PITCHER_COLUMNS: Column[] = [
  { key: "record", header: "W-L", statKey: "wins" },
  { key: "era", header: "ERA", statKey: "era" },
  { key: "whip", header: "WHIP", statKey: "whip" },
  { key: "ip", header: "IP", statKey: "ip" },
  { key: "k9", header: "K/9", statKey: "k9" },
  { key: "fip", header: "FIP", statKey: "fip" },
  { key: "xfip", header: "xFIP", statKey: "xfip" },
  { key: "fipMinus", header: "FIP-", statKey: "fipMinus" },
  { key: "war", header: "WAR", statKey: "war" },
];

export default async function BaseballPage() {
  const [hitterRows, pitcherRows] = await Promise.all([
    Promise.all(HITTERS.map((p) => getHitterRow(p.id, p.name))),
    Promise.all(PITCHERS.map((p) => getPitcherRow(p.id, p.name))),
  ]);

  return (
    <main className="min-h-screen p-8 sm:p-16">
      <h1 className="text-3xl font-bold mb-2">Baseball Stats</h1>
      <p className="text-sm text-gray-500 mb-8">
        Live {SEASON} regular season stats, via the MLB Stats API. Click a
        column to sort, hover a column header for what it means.
      </p>

      <h2 className="text-xl font-semibold mb-3">Hitters</h2>
      <StatsTable columns={HITTER_COLUMNS} rows={hitterRows} defaultSortKey="war" />

      <h2 className="text-xl font-semibold mb-3 mt-12">Pitchers</h2>
      <StatsTable columns={PITCHER_COLUMNS} rows={pitcherRows} defaultSortKey="war" />
    </main>
  );
}
