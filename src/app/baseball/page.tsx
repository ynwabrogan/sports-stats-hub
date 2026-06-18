import { StatsTable, type Column, type Row } from "./StatsTable";

const SEASON = new Date().getFullYear().toString();
const HITTER_POOL_SIZE = 200;
const PITCHER_POOL_SIZE = 100;
const HITTER_DISPLAY_LIMIT = 50;
const PITCHER_DISPLAY_LIMIT = 20;

type LeaderEntry = { id: number; name: string };

async function getLeaderPool(
  leaderCategory: string,
  statGroup: "hitting" | "pitching",
  limit: number,
): Promise<LeaderEntry[]> {
  const res = await fetch(
    `https://statsapi.mlb.com/api/v1/stats/leaders?leaderCategories=${leaderCategory}&statGroup=${statGroup}&season=${SEASON}&sportId=1&limit=${limit}`,
    { next: { revalidate: 86400 } },
  );
  const data = await res.json();
  const leaders = data.leagueLeaders?.[0]?.leaders ?? [];
  return leaders.map((l: { person: { id: number; fullName: string } }) => ({
    id: l.person.id,
    name: l.person.fullName,
  }));
}

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
  gamesPitched: number;
  gamesStarted: number;
  saves: number;
  holds: number;
};

function getPitcherRole(stat: RawPitchingStat): string {
  if (stat.gamesStarted > 0 && stat.gamesStarted / stat.gamesPitched >= 0.5) {
    return "SP";
  }
  if (stat.saves >= 5) return "CL";
  if (stat.holds > 0) return "RP (Setup)";
  return "RP";
}

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
    position: person?.primaryPosition?.abbreviation ?? "—",
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
    role: season ? getPitcherRole(season.stat) : "—",
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
  { key: "position", header: "Pos" },
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
  { key: "role", header: "Pos" },
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
  const [hitterPool, pitcherPool] = await Promise.all([
    getLeaderPool("atBats", "hitting", HITTER_POOL_SIZE),
    getLeaderPool("inningsPitched", "pitching", PITCHER_POOL_SIZE),
  ]);

  const [hitterRows, pitcherRows] = await Promise.all([
    Promise.all(hitterPool.map((p) => getHitterRow(p.id, p.name))),
    Promise.all(pitcherPool.map((p) => getPitcherRow(p.id, p.name))),
  ]);

  return (
    <main className="min-h-screen p-8 sm:p-16">
      <h1 className="text-3xl font-bold mb-2">Baseball Stats</h1>
      <p className="text-sm text-gray-500 mb-10">
        Live {SEASON} regular season stats, via the MLB Stats API. Click a
        stat name for what it means, click the arrow next to it to sort.
      </p>

      <StatsTable
        title="Hitters"
        columns={HITTER_COLUMNS}
        rows={hitterRows}
        defaultSortKey="war"
        displayLimit={HITTER_DISPLAY_LIMIT}
      />

      <div className="mt-16">
        <StatsTable
          title="Pitchers"
          columns={PITCHER_COLUMNS}
          rows={pitcherRows}
          defaultSortKey="war"
          displayLimit={PITCHER_DISPLAY_LIMIT}
        />
      </div>
    </main>
  );
}
