import { StatsTable, type Column, type Row } from "./StatsTable";
import { StatInfoProvider } from "./StatInfoPanel";

const HITTERS = [
  { id: 672640, name: "Otto Lopez" },
  { id: 650333, name: "Luis Arraez" },
  { id: 670541, name: "Yordan Alvarez" },
  { id: 677951, name: "Bobby Witt Jr." },
  { id: 676391, name: "Ernie Clement" },
  { id: 650490, name: "Yandy Díaz" },
  { id: 808982, name: "Jung Hoo Lee" },
  { id: 691023, name: "Jordan Walker" },
  { id: 676475, name: "Alec Burleson" },
  { id: 669364, name: "Xavier Edwards" },
  { id: 669016, name: "Brandon Marsh" },
  { id: 682985, name: "Riley Greene" },
  { id: 665487, name: "Fernando Tatis Jr." },
  { id: 695578, name: "James Wood" },
  { id: 673962, name: "Josh Jung" },
  { id: 681624, name: "Andy Pages" },
  { id: 682928, name: "CJ Abrams" },
  { id: 691718, name: "Pete Crow-Armstrong" },
  { id: 669127, name: "Shea Langeliers" },
  { id: 645277, name: "Ozzie Albies" },
  { id: 668227, name: "Randy Arozarena" },
  { id: 666182, name: "Bo Bichette" },
  { id: 661388, name: "William Contreras" },
  { id: 518692, name: "Freddie Freeman" },
  { id: 701762, name: "Nick Kurtz" },
  { id: 660271, name: "Shohei Ohtani" },
  { id: 621566, name: "Matt Olson" },
  { id: 671739, name: "Michael Harris II" },
  { id: 695734, name: "Daylen Lile" },
  { id: 805808, name: "Kevin McGonigle" },
  { id: 677800, name: "Wilyer Abreu" },
  { id: 666176, name: "Jo Adell" },
  { id: 693304, name: "Nick Gonzales" },
  { id: 668804, name: "Bryan Reynolds" },
  { id: 677594, name: "Julio Rodríguez" },
  { id: 608324, name: "Alex Bregman" },
  { id: 691406, name: "Junior Caminero" },
  { id: 682998, name: "Corbin Carroll" },
  { id: 687859, name: "Troy Johnston" },
  { id: 606466, name: "Ketel Marte" },
  { id: 669477, name: "Casey Schmitt" },
  { id: 621439, name: "Byron Buxton" },
  { id: 575929, name: "Willson Contreras" },
  { id: 805367, name: "Chase Meidroth" },
  { id: 700250, name: "Ben Rice" },
  { id: 624413, name: "Pete Alonso" },
  { id: 666018, name: "Jonathan Aranda" },
  { id: 641355, name: "Cody Bellinger" },
  { id: 607043, name: "Brandon Nimmo" },
  { id: 678882, name: "Ceddanne Rafaela" },
];

const PITCHERS = [
  { id: 645261, name: "Sandy Alcantara" },
  { id: 650911, name: "Cristopher Sánchez" },
  { id: 608379, name: "Michael Wacha" },
  { id: 693645, name: "Cam Schlittler" },
  { id: 693821, name: "Bryce Elder" },
  { id: 593958, name: "Eduardo Rodriguez" },
  { id: 672282, name: "Reid Detmers" },
  { id: 543135, name: "Nathan Eovaldi" },
  { id: 592332, name: "Kevin Gausman" },
  { id: 694819, name: "Jacob Misiorowski" },
  { id: 667755, name: "José Soriano" },
  { id: 669302, name: "Logan Gilbert" },
  { id: 684007, name: "Shota Imanaga" },
  { id: 668909, name: "Gavin Williams" },
  { id: 666200, name: "Jesús Luzardo" },
  { id: 808967, name: "Yoshinobu Yamamoto" },
  { id: 650633, name: "Michael King" },
  { id: 676974, name: "Max Meyer" },
  { id: 677952, name: "Braxton Ashcraft" },
  { id: 676440, name: "Tanner Bibee" },
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
      <p className="text-sm text-gray-500 mb-4">
        Live {SEASON} regular season stats, via the MLB Stats API. Click a
        column to sort, hover a column header for what it means.
      </p>

      <StatInfoProvider>
        <h2 className="text-xl font-semibold mb-3">Hitters</h2>
        <StatsTable columns={HITTER_COLUMNS} rows={hitterRows} defaultSortKey="war" />

        <h2 className="text-xl font-semibold mb-3 mt-12">Pitchers</h2>
        <StatsTable columns={PITCHER_COLUMNS} rows={pitcherRows} defaultSortKey="war" />
      </StatInfoProvider>
    </main>
  );
}
