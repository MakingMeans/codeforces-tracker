import type { ApiSubmission } from '../api/types'

export const DAY_MS = 86_400_000

export interface Activity {
  /** Submissions per local calendar day, keyed by `dayKey`; every verdict counts. */
  perDay: Map<string, number>
  solved: { all: number; year: number; month: number }
  /** Longest run of consecutive local days with at least one submission. */
  streak: { all: number; year: number; month: number }
}

/** Local calendar day, so the heatmap and streaks follow the visitor's clock, as Codeforces' own do. */
export const dayKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

/** One key per problem, so solving it again does not count twice. */
export const problemKey = (submission: ApiSubmission) =>
  `${submission.problem.contestId ?? submission.problem.problemsetName}-${submission.problem.index}`

export function longestStreak(times: number[]) {
  const days = [
    ...new Set(
      times.map((time) => {
        const date = new Date(time)
        return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
      }),
    ),
  ].sort((a, b) => a - b)

  let best = 0
  let run = 0
  days.forEach((day, i) => {
    // Rounded, because a day across a daylight-saving change is 23 or 25 hours long.
    run = i > 0 && Math.round((day - days[i - 1]) / DAY_MS) === 1 ? run + 1 : 1
    best = Math.max(best, run)
  })
  return best
}

export function buildActivity(submissions: ApiSubmission[], now: number): Activity {
  const perDay = new Map<string, number>()
  for (const submission of submissions) {
    const key = dayKey(new Date(submission.creationTimeSeconds * 1000))
    perDay.set(key, (perDay.get(key) ?? 0) + 1)
  }

  const since = (from: number) => submissions.filter((s) => s.creationTimeSeconds * 1000 >= from)
  const solved = (list: ApiSubmission[]) => new Set(list.filter((s) => s.verdict === 'OK').map(problemKey)).size
  const streak = (list: ApiSubmission[]) => longestStreak(list.map((s) => s.creationTimeSeconds * 1000))
  const year = since(now - 365 * DAY_MS)
  const month = since(now - 30 * DAY_MS)

  return {
    perDay,
    solved: { all: solved(submissions), year: solved(year), month: solved(month) },
    streak: { all: streak(submissions), year: streak(year), month: streak(month) },
  }
}

/** Submissions in the 365 days up to and including today. */
export function submissionsLastYear(perDay: Map<string, number>, now: number) {
  const since = dayKey(new Date(now - 365 * DAY_MS))
  let total = 0
  perDay.forEach((count, day) => {
    if (day > since) total += count
  })
  return total
}
