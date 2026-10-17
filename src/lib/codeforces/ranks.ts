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

/**
 * How each rank splits into divisions, by tier; the emblem shows the division as
 * a roman numeral, I being the lowest. A span that divides by three gets three
 * divisions, the others four. The exceptions: International Master is only 100
 * points wide (two of 50), and Legendary Grandmaster has no ceiling (four of
 * 200, the last one open from 3600). Kept in step with docs/design/rank-emblems.js.
 */
export const DIVISIONS = [
  { from: 0, step: 400, count: 3 },
  { from: 1200, step: 50, count: 4 },
  { from: 1400, step: 50, count: 4 },
  { from: 1600, step: 100, count: 3 },
  { from: 1900, step: 50, count: 4 },
  { from: 2100, step: 50, count: 4 },
  { from: 2300, step: 50, count: 2 },
  { from: 2400, step: 50, count: 4 },
  { from: 2600, step: 100, count: 4 },
  { from: 3000, step: 200, count: 4 },
]

/** The division a rating sits in within its rank, 1 = lowest; 0 without a rating. */
export function divisionFor(rating: number | null | undefined): number {
  if (rating == null) return 0
  const { from, step, count } = DIVISIONS[rankFor(rating).tier]
  return Math.min(count, Math.max(1, Math.floor((rating - from) / step) + 1))
}

const ROMAN = ['I', 'II', 'III', 'IV']

/** "II" for division 2; empty for none. */
export const romanFor = (division: number) => ROMAN[division - 1] ?? ''

/** The first rank above a rating, if any (the band a rating chart leaves in view). */
export const nextRank = (rating: number) => RANKS.find((rank) => (rank.min ?? -Infinity) > rating)
