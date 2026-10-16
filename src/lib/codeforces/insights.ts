import { isRated, type ContestEntry } from './contests'

export interface ContestSummary {
  total: number
  rated: number
  unrated: number
  pending: number
  /** Best final place in a rated contest. */
  bestPlace: number | null
  /** Largest gain, leaving out the first rated contest (its jump from 0 would always win). */
  bestGain: number | null
  worstLoss: number | null
}

export function contestSummary(contests: ContestEntry[]): ContestSummary {
  const rated = contests.filter(isRated)
  const deltas = rated.filter((contest) => contest.before > 0).map((contest) => contest.after - contest.before)
  const places = rated.flatMap((contest) => (contest.place ? [contest.place] : []))
  const gains = deltas.filter((delta) => delta > 0)
  const losses = deltas.filter((delta) => delta < 0)

  return {
    total: contests.length,
    rated: rated.length,
    unrated: contests.filter((contest) => contest.outcome === 'unrated').length,
    pending: contests.filter((contest) => contest.outcome === 'pending').length,
    bestPlace: places.length ? Math.min(...places) : null,
    bestGain: gains.length ? Math.max(...gains) : null,
    worstLoss: losses.length ? Math.min(...losses) : null,
  }
}
