export type StatTier = {
  emoji: string;
  label: string;
  range: string;
};

export type StatDefinition = {
  label: string;
  /** What the stat literally is / how it's calculated. */
  simple: string;
  /** What broader quality it's a proxy for. */
  abstract: string;
  /** Elite -> Terrible benchmark tiers, omitted for stats that scale with games played. */
  scale?: StatTier[];
};

export const STAT_DEFINITIONS: Record<string, StatDefinition> = {
  avg: {
    label: "Batting Average",
    simple: "Hits divided by at-bats.",
    abstract:
      "How often a hitter gets a hit — a basic measure of contact skill.",
    scale: [
      { emoji: "🔥", label: "Elite", range: ".300 and up" },
      { emoji: "✅", label: "Good", range: ".270 – .299" },
      { emoji: "😐", label: "Average", range: ".250 – .269" },
      { emoji: "👎", label: "Bad", range: ".220 – .249" },
      { emoji: "💀", label: "Terrible", range: "below .220" },
    ],
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
    scale: [
      { emoji: "🔥", label: "Elite", range: ".370 and up" },
      { emoji: "✅", label: "Good", range: ".340 – .369" },
      { emoji: "😐", label: "Average", range: ".320 – .339" },
      { emoji: "👎", label: "Bad", range: ".300 – .319" },
      { emoji: "💀", label: "Terrible", range: "below .300" },
    ],
  },
  wrcPlus: {
    label: "Weighted Runs Created Plus",
    simple:
      "Runs created, adjusted for park and league, scaled so 100 = league average.",
    abstract:
      "How much better or worse a hitter is than a league-average hitter — 130 means 30% better than average.",
    scale: [
      { emoji: "🔥", label: "Elite", range: "140 and up" },
      { emoji: "✅", label: "Good", range: "115 – 139" },
      { emoji: "😐", label: "Average", range: "90 – 114" },
      { emoji: "👎", label: "Bad", range: "70 – 89" },
      { emoji: "💀", label: "Terrible", range: "below 70" },
    ],
  },
  wraa: {
    label: "Weighted Runs Above Average",
    simple:
      "The run-value version of wOBA — how many runs a hitter has contributed above what a league-average hitter would in the same number of plate appearances.",
    abstract:
      "Same idea as wRC+, but expressed as a raw run total instead of an index, so it grows the more a player plays.",
  },
  bsr: {
    label: "Baserunning Runs",
    simple:
      "Runs added or lost on the bases beyond simple stolen bases — includes things like taking extra bases on hits and avoiding outs on the bases.",
    abstract: "How much a player's baserunning specifically helps or hurts their team.",
  },
  def: {
    label: "Defensive Runs",
    simple:
      "Runs saved or cost by a player's defense, relative to an average fielder at their position.",
    abstract: "How much a player's glove specifically helps or hurts their team.",
  },
  war: {
    label: "Wins Above Replacement",
    simple:
      "Estimates how many more wins a player is worth than a freely available replacement-level player, combining hitting, baserunning, fielding, and/or pitching into one number.",
    abstract:
      "Overall value a player adds to their team, comparable across positions.",
    scale: [
      { emoji: "🔥", label: "Elite", range: "5+ (MVP-caliber, full season)" },
      { emoji: "✅", label: "Good", range: "3 – 4.9 (All-Star caliber)" },
      { emoji: "😐", label: "Average", range: "1.5 – 2.9 (everyday starter)" },
      { emoji: "👎", label: "Bad", range: "0 – 1.4 (replacement-ish)" },
      { emoji: "💀", label: "Terrible", range: "below 0 (hurting the team)" },
    ],
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
    scale: [
      { emoji: "🔥", label: "Elite", range: "2.50 and below" },
      { emoji: "✅", label: "Good", range: "2.51 – 3.50" },
      { emoji: "😐", label: "Average", range: "3.51 – 4.20" },
      { emoji: "👎", label: "Bad", range: "4.21 – 5.00" },
      { emoji: "💀", label: "Terrible", range: "above 5.00" },
    ],
  },
  whip: {
    label: "Walks + Hits per Inning Pitched",
    simple: "Walks plus hits allowed, divided by innings pitched.",
    abstract: "How often batters reach base against a pitcher.",
    scale: [
      { emoji: "🔥", label: "Elite", range: "1.00 and below" },
      { emoji: "✅", label: "Good", range: "1.01 – 1.20" },
      { emoji: "😐", label: "Average", range: "1.21 – 1.35" },
      { emoji: "👎", label: "Bad", range: "1.36 – 1.50" },
      { emoji: "💀", label: "Terrible", range: "above 1.50" },
    ],
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
    scale: [
      { emoji: "🔥", label: "Elite", range: "11.0 and up" },
      { emoji: "✅", label: "Good", range: "9.5 – 10.9" },
      { emoji: "😐", label: "Average", range: "8.0 – 9.4" },
      { emoji: "👎", label: "Bad", range: "6.5 – 7.9" },
      { emoji: "💀", label: "Terrible", range: "below 6.5" },
    ],
  },
  fip: {
    label: "Fielding Independent Pitching",
    simple:
      "Like ERA, but calculated only from strikeouts, walks, and home runs — outcomes a pitcher controls directly — removing the effects of luck and defense.",
    abstract:
      "An estimate of a pitcher's true run-prevention skill, independent of the fielders behind them.",
    scale: [
      { emoji: "🔥", label: "Elite", range: "2.80 and below" },
      { emoji: "✅", label: "Good", range: "2.81 – 3.60" },
      { emoji: "😐", label: "Average", range: "3.61 – 4.20" },
      { emoji: "👎", label: "Bad", range: "4.21 – 5.00" },
      { emoji: "💀", label: "Terrible", range: "above 5.00" },
    ],
  },
  xfip: {
    label: "Expected Fielding Independent Pitching",
    simple:
      "Like FIP, but replaces actual home runs allowed with an estimate based on a pitcher's fly ball rate and the league-average rate of fly balls becoming home runs.",
    abstract:
      "Smooths out home-run luck/variance to estimate a pitcher's underlying skill — useful for spotting whether an unusual HR rate is real or fluky.",
    scale: [
      { emoji: "🔥", label: "Elite", range: "2.80 and below" },
      { emoji: "✅", label: "Good", range: "2.81 – 3.60" },
      { emoji: "😐", label: "Average", range: "3.61 – 4.20" },
      { emoji: "👎", label: "Bad", range: "4.21 – 5.00" },
      { emoji: "💀", label: "Terrible", range: "above 5.00" },
    ],
  },
  fipMinus: {
    label: "FIP Minus",
    simple:
      "FIP scaled relative to league and park, where 100 = league average (lower is better, opposite of wRC+).",
    abstract:
      "Shows how a pitcher's FIP compares to league average in one number — 80 means 20% better (fewer runs allowed) than average.",
    scale: [
      { emoji: "🔥", label: "Elite", range: "70 and below" },
      { emoji: "✅", label: "Good", range: "71 – 85" },
      { emoji: "😐", label: "Average", range: "86 – 110" },
      { emoji: "👎", label: "Bad", range: "111 – 130" },
      { emoji: "💀", label: "Terrible", range: "above 130" },
    ],
  },
};
