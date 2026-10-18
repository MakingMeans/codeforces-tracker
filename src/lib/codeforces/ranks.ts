export interface Rank {
  name: string
  /** Lowest rating that earns the rank; null for Unrated. */
  min: number | null
  /** Codeforces' own hue, lifted to read on the dark background. */
  color: string
  /** -1 = Unrated, 0 = Newbie … 9 = Legendary Grandmaster; picks the emblem. */
  tier: number
}

export const RANKS: Rank[] = [
  { name: 'Newbie', min: -Infinity, color: '#a3a3a3', tier: 0 },
  { name: 'Pupil', min: 1200, color: '#4ade80', tier: 1 },
  { name: 'Specialist', min: 1400, color: '#2dd4bf', tier: 2 },
  { name: 'Expert', min: 1600, color: '#60a5fa', tier: 3 },
  { name: 'Candidate Master', min: 1900, color: '#e879f9', tier: 4 },
  { name: 'Master', min: 2100, color: '#fb923c', tier: 5 },
  { name: 'International Master', min: 2300, color: '#fb923c', tier: 6 },
  { name: 'Grandmaster', min: 2400, color: '#f87171', tier: 7 },
  { name: 'International Grandmaster', min: 2600, color: '#f87171', tier: 8 },
  { name: 'Legendary Grandmaster', min: 3000, color: '#f87171', tier: 9 },
]

/** Someone who has never taken a rated contest; not a Codeforces rank, so never "Newbie". */
export const UNRATED: Rank = { name: 'Unrated', min: null, color: '#8b97a3', tier: -1 }

/** The rank a rating earns, or Unrated when there is no rating. */
export function rankFor(rating: number | null | undefined): Rank {
  if (rating == null) return UNRATED
  return RANKS.findLast((rank) => rating >= (rank.min ?? -Infinity)) ?? RANKS[0]
}

/** The yellow a place's average takes when it falls in Newbie (see docs/DESIGN.md, "Rankings"). */
export const NEWBIE_AVERAGE = '#facc15'

/**
 * The rank an average rating falls in, as rankFor, but drawn in yellow when it is
 * Newbie, so a country's, city's or organization's average stands apart from
 * Newbie's and Unrated's greys. Every other rank keeps its colour.
 */
export function averageRankFor(average: number | null | undefined): Rank {
  const rank = rankFor(average)
  return rank.tier === 0 ? { ...rank, color: NEWBIE_AVERAGE } : rank
}

/**
 * Where each of a rank's three divisions starts, by tier; the emblem shows the
 * division as a roman numeral, I the lowest. The span is cut in thirds, rounded
 * to tens so the boundaries are easy to remember: a 200-point rank splits
 * 70 / 60 / 70. Newbie starts at 0 (anything lower is I too), and Legendary
 * Grandmaster's III has no ceiling. Kept in step with docs/design/rank-emblems.js.
 */
export const DIVISIONS = [
  { starts: [0, 400, 800] },
  { starts: [1200, 1270, 1330] },
  { starts: [1400, 1470, 1530] },
  { starts: [1600, 1700, 1800] },
  { starts: [1900, 1970, 2030] },
  { starts: [2100, 2170, 2230] },
  { starts: [2300, 2330, 2370] },
  { starts: [2400, 2470, 2530] },
  { starts: [2600, 2730, 2870] },
  { starts: [3000, 3200, 3400] },
]

/** The division a rating sits in within its rank, 1 = lowest; 0 without a rating. */
export function divisionFor(rating: number | null | undefined): number {
  if (rating == null) return 0
  const { starts } = DIVISIONS[rankFor(rating).tier]
  return Math.max(1, starts.filter((start) => rating >= start).length)
}

const ROMAN = ['I', 'II', 'III']

/** "II" for division 2; empty for none. */
export const romanFor = (division: number) => ROMAN[division - 1] ?? ''

/** The first rank above a rating, if any (the band a rating chart leaves in view). */
export const nextRank = (rating: number) => RANKS.find((rank) => (rank.min ?? -Infinity) > rating)
