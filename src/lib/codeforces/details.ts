/**
 * Everything below the profile header, computed once from the raw responses.
 * Kept free of browser storage so it can run inside the details worker.
 */
import { call } from '../api/client'
import type { ApiContest, ApiRatingChange, ApiSubmission } from '../api/types'
import { buildActivity, type Activity } from './activity'
import { buildContests, type ContestEntry } from './contests'
import {
  languageShares,
  solvedByDifficulty,
  topTags,
  type DifficultyBucket,
  type LanguageShare,
  type TagCount,
} from './insights'
import { toRatingHistory, type RatingPoint } from './user'

export interface ProfileDetails {
  ratingHistory: RatingPoint[]
  /** Most recent first. */
  contests: ContestEntry[]
  activity: Activity
  difficulty: { buckets: DifficultyBucket[]; withoutRating: number }
  tags: TagCount[]
  languages: LanguageShare[]
}

export function deriveDetails(
  ratings: ApiRatingChange[],
  submissions: ApiSubmission[],
  contests: ApiContest[],
  now: number,
): ProfileDetails {
  return {
    ratingHistory: toRatingHistory(ratings),
    contests: buildContests(ratings, submissions, contests, now),
    activity: buildActivity(submissions, now),
    difficulty: solvedByDifficulty(submissions),
    tags: topTags(submissions),
    languages: languageShares(submissions),
  }
}

/**
 * Downloads the rating history and every submission (up to several MB), then
 * waits for the contest list and derives the details.
 */
export async function fetchDetails(handle: string, contests: Promise<ApiContest[]>, signal: AbortSignal) {
  const [ratings, submissions, contestList] = await Promise.all([
    call<ApiRatingChange[]>('user.rating', { handle }, signal),
    call<ApiSubmission[]>('user.status', { handle }, signal),
    contests,
  ])
  return deriveDetails(ratings, submissions, contestList, Date.now())
}
