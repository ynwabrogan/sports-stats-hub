type Person = {
  birthCity?: string;
  birthStateProvince?: string;
  birthCountry?: string;
  height?: string;
  weight?: number;
  draftYear?: number;
};

type Award = { id: string; season: string };

type DraftPick = {
  person: { id: number };
  pickRound: string;
  pickNumber: number;
  school?: { name: string };
  team?: { name: string };
};

async function getPerson(id: string): Promise<Person | null> {
  const res = await fetch(`https://statsapi.mlb.com/api/v1/people/${id}`, {
    next: { revalidate: 86400 },
  });
  const data = await res.json();
  return data.people?.[0] ?? null;
}

async function getAllStarSeasons(id: string): Promise<number[]> {
  const res = await fetch(`https://statsapi.mlb.com/api/v1/people/${id}/awards`, {
    next: { revalidate: 86400 },
  });
  const data = await res.json();
  const awards: Award[] = data.awards ?? [];
  return awards
    .filter((a) => a.id === "ALAS" || a.id === "NLAS")
    .map((a) => Number(a.season))
    .sort((a, b) => a - b);
}

async function getDraftInfo(id: string, draftYear: number) {
  // Draft-year payloads are large (~2MB) but rarely requested and cache for a long time,
  // since draft results never change.
  const res = await fetch(`https://statsapi.mlb.com/api/v1/draft/${draftYear}`, {
    next: { revalidate: 60 * 60 * 24 * 30 },
  });
  const data = await res.json();
  const rounds = data.drafts?.rounds ?? [];
  for (const round of rounds) {
    const pick: DraftPick | undefined = round.picks?.find(
      (p: DraftPick) => p.person.id === Number(id),
    );
    if (pick) {
      return {
        round: pick.pickRound,
        pickNumber: pick.pickNumber,
        school: pick.school?.name,
        team: pick.team?.name,
      };
    }
  }
  return null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const [person, allStarSeasons] = await Promise.all([
    getPerson(id),
    getAllStarSeasons(id),
  ]);

  const draft = person?.draftYear ? await getDraftInfo(id, person.draftYear) : null;

  return Response.json({
    birthCity: person?.birthCity ?? null,
    birthStateProvince: person?.birthStateProvince ?? null,
    birthCountry: person?.birthCountry ?? null,
    height: person?.height ?? null,
    weight: person?.weight ?? null,
    college: draft?.school ?? null,
    draftYear: person?.draftYear ?? null,
    draftRound: draft?.round ?? null,
    draftPick: draft?.pickNumber ?? null,
    draftTeam: draft?.team ?? null,
    allStarSeasons,
  });
}
