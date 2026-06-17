export type StatDefinition = {
  label: string;
  /** What the stat literally is / how it's calculated. */
  simple: string;
  /** What broader quality it's a proxy for. */
  abstract: string;
};

export const STAT_DEFINITIONS: Record<string, StatDefinition> = {
  avg: {
    label: "Batting Average",
    simple: "Hits divided by at-bats.",
    abstract:
      "How often a hitter gets a hit — a basic measure of contact skill.",
  },
  hits: {
    label: "Hits",
    simple: "Total hits this season.",
    abstract: "Raw volume of times a player has reached base via a hit.",
  },
  homeRuns: {
    label: "Home Runs",
    simple: "Total home runs this season.",
    abstract: "Raw power — how often a player hits the ball out of the park.",
  },
  rbi: {
    label: "Runs Batted In",
    simple: "Runs that scored as a direct result of the player's at-bat.",
    abstract:
      "Run production, though it depends heavily on teammates getting on base first.",
  },
  woba: {
    label: "Weighted On-Base Average",
    simple:
      "Like on-base percentage, but it weights walks, singles, doubles, home runs, etc. by how much each actually contributes to scoring runs.",
    abstract:
      "A single rate stat estimating a hitter's overall offensive contribution per plate appearance.",
  },
  wrcPlus: {
    label: "Weighted Runs Created Plus",
    simple:
      "Runs created, adjusted for park and league, scaled so 100 = league average.",
    abstract:
      "How much better or worse a hitter is than a league-average hitter — 130 means 30% better than average.",
  },
  war: {
    label: "Wins Above Replacement",
    simple:
      "Estimates how many more wins a player is worth than a freely available replacement-level player, combining hitting, baserunning, fielding, and/or pitching into one number.",
    abstract:
      "Overall value a player adds to their team, comparable across positions.",
  },
  wins: {
    label: "Wins",
    simple: "Games credited as a win to this pitcher.",
    abstract: "A traditional, team-dependent measure of pitching outcomes.",
  },
  losses: {
    label: "Losses",
    simple: "Games credited as a loss to this pitcher.",
    abstract: "A traditional, team-dependent measure of pitching outcomes.",
  },
  era: {
    label: "Earned Run Average",
    simple: "Earned runs allowed per 9 innings pitched.",
    abstract: "How many runs a pitcher allows on average — lower is better.",
  },
  whip: {
    label: "Walks + Hits per Inning Pitched",
    simple: "Walks plus hits allowed, divided by innings pitched.",
    abstract: "How often batters reach base against a pitcher.",
  },
  ip: {
    label: "Innings Pitched",
    simple: "Total innings pitched this season.",
    abstract: "Workload and durability.",
  },
  k9: {
    label: "Strikeouts per 9 Innings",
    simple: "Strikeouts per 9 innings pitched.",
    abstract: "How often a pitcher overpowers hitters directly via strikeouts.",
  },
  fip: {
    label: "Fielding Independent Pitching",
    simple:
      "Like ERA, but calculated only from strikeouts, walks, and home runs — outcomes a pitcher controls directly — removing the effects of luck and defense.",
    abstract:
      "An estimate of a pitcher's true run-prevention skill, independent of the fielders behind them.",
  },
};
