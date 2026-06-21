const SEASON = new Date().getFullYear().toString();

type GameLogStat = {
  atBats: number;
  hits: number;
  baseOnBalls: number;
  hitByPitch: number;
  sacFlies: number;
  totalBases: number;
};

type GameLogSplit = { date: string; stat: GameLogStat };

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const res = await fetch(
    `https://statsapi.mlb.com/api/v1/people/${id}/stats?stats=gameLog&group=hitting&season=${SEASON}`,
    { next: { revalidate: 86400 } },
  );
  const data = await res.json();
  const splits: GameLogSplit[] = data.stats?.[0]?.splits ?? [];

  // Game logs come back oldest-first already; sample every few games to
  // keep the payload small while building a season-to-date OPS line.
  const chronological = splits;

  let atBats = 0;
  let hits = 0;
  let walks = 0;
  let hbp = 0;
  let sacFlies = 0;
  let totalBases = 0;

  const points: { date: string; ops: number }[] = [];

  chronological.forEach((split, i) => {
    atBats += split.stat.atBats ?? 0;
    hits += split.stat.hits ?? 0;
    walks += split.stat.baseOnBalls ?? 0;
    hbp += split.stat.hitByPitch ?? 0;
    sacFlies += split.stat.sacFlies ?? 0;
    totalBases += split.stat.totalBases ?? 0;

    const obpDenominator = atBats + walks + hbp + sacFlies;
    const obp = obpDenominator > 0 ? (hits + walks + hbp) / obpDenominator : 0;
    const slg = atBats > 0 ? totalBases / atBats : 0;
    const ops = obp + slg;

    const sampleEvery = Math.max(1, Math.floor(chronological.length / 30));
    if (i % sampleEvery === 0 || i === chronological.length - 1) {
      points.push({ date: split.date, ops: Number(ops.toFixed(3)) });
    }
  });

  return Response.json({ points });
}
