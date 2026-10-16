/**
 * The match history: every contest entered live, rebuilt from the user's own
 * submissions because `contest.standings` no longer filters by handle for
 * anonymous callers.
 */
import type { ApiContest, ApiRatingChange, ApiSubmission } from '../api/types'
import { DAY_MS } from './activity'

/** `even` is a rated contest that moved nothing; `pending` is still waiting for its change. */
export type ContestOutcome = 'gain' | 'loss' | 'even' | 'unrated' | 'pending'

export interface ProblemAttempt {
  index: string
  name: string
  solved: boolean
  /** Judged submissions that were not accepted, compilation errors included. */
  failed: number
}

export interface ContestEntry {
  id: number
  name: string
  /** Start time in ms. */
  start: number
  /** In seconds; 0 when the contest is not in the public list (gyms). */
  duration: number
  outcome: ContestOutcome
  /** Final place; only known for rated contests. */
  place?: number
  /** Rating going in; for unrated and pending contests, after equals before. */
  before: number
  after: number
  problems: ProblemAttempt[]
  failed: number
}

export const isRated = (contest: ContestEntry) =>
  contest.outcome === 'gain' || contest.outcome === 'loss' || contest.outcome === 'even'

/** Live participation only: practice, virtual and manager runs are not contests taken. */
const LIVE = new Set(['CONTESTANT', 'OUT_OF_COMPETITION'])
/** Submissions that never got a verdict are not failures. */
const UNJUDGED = new Set(['TESTING', 'SKIPPED'])
/** Rated rounds can take a day or two to apply their changes. */
export const RATING_GRACE_MS = 3 * DAY_MS

/** One entry per problem, ordered A, B, C1, C2, D… */
export function attemptsByProblem(submissions: ApiSubmission[]): ProblemAttempt[] {
  const byIndex = new Map<string, ProblemAttempt>()
  for (const { problem, verdict } of submissions) {
    let attempt = byIndex.get(problem.index)
    if (!attempt) {
      attempt = { index: problem.index, name: problem.name, solved: false, failed: 0 }
      byIndex.set(problem.index, attempt)
    }
    if (verdict === 'OK') attempt.solved = true
    else if (verdict && !UNJUDGED.has(verdict)) attempt.failed += 1
  }
  return [...byIndex.values()].sort((a, b) => a.index.localeCompare(b.index, 'en', { numeric: true }))
}

/** Rating held at `time`: the last change applied before it, or 0 before the first. */
export function ratingAt(ratings: ApiRatingChange[], time: number) {
  let rating = 0
  for (const change of ratings) {
    if (change.ratingUpdateTimeSeconds * 1000 > time) break
    rating = change.newRating
  }
  return rating
}

/** Rated contests plus every contest with live submissions, most recent first. */
export function buildContests(
  ratings: ApiRatingChange[],
  submissions: ApiSubmission[],
  contests: ApiContest[],
  now: number,
): ContestEntry[] {
  const contestById = new Map(contests.map((contest) => [contest.id, contest]))
  const changeById = new Map(ratings.map((change) => [change.contestId, change]))
  const ownById = new Map<number, ApiSubmission[]>()
  for (const submission of submissions) {
    if (submission.contestId === undefined || !LIVE.has(submission.author.participantType)) continue
    const own = ownById.get(submission.contestId)
    if (own) own.push(submission)
    else ownById.set(submission.contestId, [submission])
  }

  return [...new Set([...changeById.keys(), ...ownById.keys()])]
    .map((id): ContestEntry => {
      const contest = contestById.get(id)
      const change = changeById.get(id)
      const own = ownById.get(id) ?? []
      const startSeconds =
        contest?.startTimeSeconds ??
        change?.ratingUpdateTimeSeconds ??
        Math.min(...own.map((s) => s.creationTimeSeconds))
      const problems = attemptsByProblem(own)

      const entry = {
        id,
        name: contest?.name ?? change?.contestName ?? `Contest ${id}`,
        start: startSeconds * 1000,
        duration: contest?.durationSeconds ?? 0,
        problems,
        failed: problems.reduce((total, problem) => total + problem.failed, 0),
      }

      if (change) {
        const delta = change.newRating - change.oldRating
        return {
          ...entry,
          outcome: delta > 0 ? 'gain' : delta < 0 ? 'loss' : 'even',
          place: change.rank,
          before: change.oldRating,
          after: change.newRating,
        }
      }

      const before = ratingAt(ratings, entry.start)
      const ended = entry.start + entry.duration * 1000
      const awaitingChange =
        contest !== undefined &&
        own.some((s) => s.author.participantType === 'CONTESTANT') &&
        !/unrated/i.test(entry.name) &&
        (contest.phase !== 'FINISHED' || now - ended < RATING_GRACE_MS)

      return { ...entry, outcome: awaitingChange ? 'pending' : 'unrated', before, after: before }
    })
    .sort((a, b) => b.start - a.start)
}
