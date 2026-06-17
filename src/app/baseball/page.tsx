type HittingStat = {
  gamesPlayed: number;
  homeRuns: number;
  rbi: number;
  hits: number;
  avg: string;
};

type PlayerStats = {
  id: number;
  name: string;
  team: string;
  stats: HittingStat | null;
};

const PLAYERS = [
  { id: 592450, name: "Aaron Judge" },
  { id: 660271, name: "Shohei Ohtani" },
  { id: 605141, name: "Mookie Betts" },
  { id: 660670, name: "Ronald Acuña Jr." },
  { id: 518692, name: "Freddie Freeman" },
];

const SEASON = "2025";

async function getPlayerStats(id: number, name: string): Promise<PlayerStats> {
  const res = await fetch(
    `https://statsapi.mlb.com/api/v1/people/${id}?hydrate=stats(group=hitting,type=season,season=${SEASON})`,
    { next: { revalidate: 3600 } },
  );
  const data = await res.json();
  const person = data.people?.[0];
  const split = person?.stats?.[0]?.splits?.[0];

  return {
    id,
    name,
    team: split?.team?.name ?? "—",
    stats: split?.stat
      ? {
          gamesPlayed: split.stat.gamesPlayed,
          homeRuns: split.stat.homeRuns,
          rbi: split.stat.rbi,
          hits: split.stat.hits,
          avg: split.stat.avg,
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
        {SEASON} regular season hitting stats, via the MLB Stats API.
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
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr key={player.id} className="border-b border-gray-100">
                <td className="py-2 pr-4 font-medium">{player.name}</td>
                <td className="py-2 pr-4">{player.team}</td>
                {player.stats ? (
                  <>
                    <td className="py-2 pr-4">{player.stats.gamesPlayed}</td>
                    <td className="py-2 pr-4">{player.stats.avg}</td>
                    <td className="py-2 pr-4">{player.stats.hits}</td>
                    <td className="py-2 pr-4">{player.stats.homeRuns}</td>
                    <td className="py-2 pr-4">{player.stats.rbi}</td>
                  </>
                ) : (
                  <td className="py-2 pr-4 text-gray-400" colSpan={5}>
                    No stats available
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
