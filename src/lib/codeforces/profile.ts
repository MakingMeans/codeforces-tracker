/**
 * A profile loads in two steps: `user.info` first (fast, and it fails cleanly
 * for an unknown handle before megabytes of submissions are downloaded), then
 * the rating history, every submission and the contest list together.
 */
import { call } from '../api/client'
import type { ApiContest, ApiRatingChange, ApiSubmission, ApiUser } from '../api/types'
import { buildActivity, type Activity } from './activity'
import { getContestList } from './contest-list'
import { buildContests, type ContestEntry } from './contests'
import { toProfileUser, toRatingHistory, type ProfileUser, type RatingPoint } from './user'

export interface ProfileDetails {
  ratingHistory: RatingPoint[]
  /** Most recent first. */
  contests: ContestEntry[]
  activity: Activity
}

export interface Profile {
  user: ProfileUser
  details: ProfileDetails
  /** When the data was read from Codeforces, in ms. */
  fetchedAt: number
}

export async function loadUser(handle: string, signal: AbortSignal, now = Date.now()): Promise<ProfileUser> {
  const [user] = await call<ApiUser[]>('user.info', { handles: handle }, signal)
  return toProfileUser(user, now)
}

/** Everything below the header, computed once from the raw responses. */
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
  }
}

export async function loadDetails(handle: string, signal: AbortSignal): Promise<ProfileDetails> {
  const [ratings, submissions, contests] = await Promise.all([
    call<ApiRatingChange[]>('user.rating', { handle }, signal),
    call<ApiSubmission[]>('user.status', { handle }, signal),
    getContestList(signal),
  ])
  return deriveDetails(ratings, submissions, contests, Date.now())
}
