/**
 * Small hand-made API responses for one fictional user, "Sample_Handle", seen on
 * 2026-10-15 at 12:00 UTC. They cover a gain, a loss, an unchanged rating, a
 * contest missing from contest.list, an unrated round, an out-of-competition run,
 * a pending contest, a gym, virtual and practice runs, a compilation error and a
 * problemset-only problem. `userInfoUnrated` has never taken a rated contest.
 */
import type { ApiContest, ApiRatingChange, ApiSubmission, ApiUser } from '../../src/lib/api/types'
import contestList from './contest-list.json'
import userInfo from './user-info.json'
import userInfoUnratedJson from './user-info-unrated.json'
import userRating from './user-rating.json'
import userStatus from './user-status.json'

export const NOW = Date.parse('2026-10-15T12:00:00Z')

export const contests = contestList as ApiContest[]
export const ratings = userRating as ApiRatingChange[]
export const submissions = userStatus as ApiSubmission[]
export const user = userInfo as ApiUser
export const userInfoUnrated = userInfoUnratedJson as ApiUser
