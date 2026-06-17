type HittingStat = {
  gamesPlayed: number;
  homeRuns: number;
  rbi: number;
  hits: number;
  avg: string;
};

type SabermetricStat = {
  war: number;
  wrcPlus: number;
  woba: number;
};

type PlayerStats = {
  id: number;
  name: string;
  team: string;
  hitting: HittingStat | null;
  saber: SabermetricStat | null;
};

const PLAYERS = [
  { id: 592450, name: "Aaron Judge" },
  { id: 660271, name: "Shohei Ohtani" },
  { id: 605141, name: "Mookie Betts" },
  { id: 660670, name: "Ronald Acuña Jr." },
  { id: 518692, name: "Freddie Freeman" },
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

type RawSaberStat = {
  war: number;
  wRcPlus: number;
  woba: number;
};

async function getPlayerStats(id: number, name: string): Promise<PlayerStats> {
  const res = await fetch(
    `https://statsapi.mlb.com/api/v1/people/${id}?hydrate=stats(group=hitting,type=[season,sabermetrics],season=${SEASON})`,
    { next: { revalidate: 300 } },
  );
  const data = await res.json();
  const person = data.people?.[0];
  const statGroups: Array<StatGroup<RawHittingStat> | StatGroup<RawSaberStat>> = person?.stats ?? [];

  const seasonSplit = statGroups.find((g) => g.type?.displayName === "season")
    ?.splits?.[0] as StatSplit<RawHittingStat> | undefined;
  const saberSplit = statGroups.find((g) => g.type?.displayName === "sabermetrics")
    ?.splits?.[0] as StatSplit<RawSaberStat> | undefined;

  return {
    id,
    name,
    team: seasonSplit?.team?.name ?? "—",
    hitting: seasonSplit?.stat
      ? {
          gamesPlayed: seasonSplit.stat.gamesPlayed,
          homeRuns: seasonSplit.stat.homeRuns,
          rbi: seasonSplit.stat.rbi,
          hits: seasonSplit.stat.hits,
          avg: seasonSplit.stat.avg,
        }
      : null,
    saber: saberSplit?.stat
      ? {
          war: saberSplit.stat.war,
          wrcPlus: saberSplit.stat.wRcPlus,
          woba: saberSplit.stat.woba,
        }
      : null,
  };
}

export default async function BaseballPage() {
  const players = await Promise.all(
    PLAYERS.map((p) => getPlayerStats(p.id, p.name)),
  );

  return (
    <main className="min-h-screen p-8 sm:p-16">
      <h1 className="text-3xl font-bold mb-2">Baseball Stats</h1>
      <p className="text-sm text-gray-500 mb-8">
        Live {SEASON} regular season stats, via the MLB Stats API.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-300">
              <th className="py-2 pr-4">Player</th>
              <th className="py-2 pr-4">Team</th>
              <th className="py-2 pr-4">G</th>
              <th className="py-2 pr-4">AVG</th>
              <th className="py-2 pr-4">H</th>
              <th className="py-2 pr-4">HR</th>
              <th className="py-2 pr-4">RBI</th>
              <th className="py-2 pr-4">wOBA</th>
              <th className="py-2 pr-4">wRC+</th>
              <th className="py-2 pr-4">WAR</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr key={player.id} className="border-b border-gray-100">
                <td className="py-2 pr-4 font-medium">{player.name}</td>
                <td className="py-2 pr-4">{player.team}</td>
                {player.hitting ? (
                  <>
                    <td className="py-2 pr-4">{player.hitting.gamesPlayed}</td>
                    <td className="py-2 pr-4">{player.hitting.avg}</td>
                    <td className="py-2 pr-4">{player.hitting.hits}</td>
                    <td className="py-2 pr-4">{player.hitting.homeRuns}</td>
                    <td className="py-2 pr-4">{player.hitting.rbi}</td>
                  </>
                ) : (
                  <td className="py-2 pr-4 text-gray-400" colSpan={5}>
                    No stats available
                  </td>
                )}
                <td className="py-2 pr-4">
                  {player.saber ? player.saber.woba.toFixed(3) : "—"}
                </td>
                <td className="py-2 pr-4">
                  {player.saber ? player.saber.wrcPlus.toFixed(0) : "—"}
                </td>
                <td className="py-2 pr-4 font-semibold">
                  {player.saber ? player.saber.war.toFixed(1) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
