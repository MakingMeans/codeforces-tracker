/**
 * Two profiles side by side: matching stats and the contests both entered.
 */
import { submissionsLastYear } from './activity'
import { isRated, type ContestEntry } from './contests'
import { contestSummary } from './insights'
import type { Profile } from './profile'

export interface StatRow {
  label: string
  a: number | null
  b: number | null
  /** Which side wins the row; for places, lower is better. */
  better: 'higher' | 'lower'
  format?: 'place' | 'signed'
}

export function compareStats(a: Profile, b: Profile): StatRow[] {
  const summaryA = contestSummary(a.details.contests)
  const summaryB = contestSummary(b.details.contests)
  const row = (
    label: string,
    pick: (profile: Profile, summary: typeof summaryA) => number | null,
    better: StatRow['better'] = 'higher',
    format?: StatRow['format'],
  ): StatRow => ({
    label,
    a: pick(a, summaryA),
    b: pick(b, summaryB),
    better,
    format,
  })

  return [
    row('Rating', (profile) => profile.user.rating),
    row('Peak rating', (profile) => profile.user.maxRating),
    row('Rated contests', (_, summary) => summary.rated),
    row('Best place', (_, summary) => summary.bestPlace, 'lower', 'place'),
    row('Problems solved', (profile) => profile.details.activity.solved.all),
    row('Solved last year', (profile) => profile.details.activity.solved.year),
    row('Submissions last year', (profile) => submissionsLastYear(profile.details.activity.perDay, profile.fetchedAt)),
    row('Longest streak', (profile) => profile.details.activity.streak.all),
    row('Contribution', (profile) => profile.user.contribution, 'higher', 'signed'),
  ]
}

/** Which side a row favours, or null for a tie or a missing value. */
export function rowWinner(row: StatRow): 'a' | 'b' | null {
  if (row.a === null || row.b === null || row.a === row.b) return null
  const aBetter = row.better === 'higher' ? row.a > row.b : row.a < row.b
  return aBetter ? 'a' : 'b'
}

export interface SharedContest {
  id: number
  name: string
  start: number
  a: ContestEntry
  b: ContestEntry
  /** Who finished higher; only known when both were rated in it. */
  ahead: 'a' | 'b' | 'tie' | null
}

/** Contests both entered live, most recent first, with who finished ahead. */
export function headToHead(contestsA: ContestEntry[], contestsB: ContestEntry[]) {
  const byId = new Map(contestsB.map((contest) => [contest.id, contest]))
  const shared: SharedContest[] = []
  for (const a of contestsA) {
    const b = byId.get(a.id)
    if (!b) continue
    const comparable = isRated(a) && isRated(b) && a.place !== undefined && b.place !== undefined
    const ahead = !comparable ? null : a.place! < b.place! ? 'a' : a.place! > b.place! ? 'b' : 'tie'
    shared.push({ id: a.id, name: a.name, start: a.start, a, b, ahead })
  }
  shared.sort((x, y) => y.start - x.start)
  return {
    shared,
    aAhead: shared.filter((contest) => contest.ahead === 'a').length,
    bAhead: shared.filter((contest) => contest.ahead === 'b').length,
  }
}
