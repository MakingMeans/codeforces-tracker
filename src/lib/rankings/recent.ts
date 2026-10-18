/**
 * The last week of contests, laid over Codeforces' rated list. Codeforces rebuilds
 * `user.ratedList` once a day, so a contest rated in the afternoon would wait until
 * the next day's list; the rankings build also reads the rating changes of every
 * contest that ended in the last week (`contest.ratingChanges`) and brings each
 * player up to date. The same changes say who moved to another rank this week.
 *
 * Imports carry their extension: the build script runs this file with Node's type
 * stripping.
 */
import { rankFor } from '../codeforces/ranks.ts'
import type { RatedUser } from './format.ts'

/** How far back the build reads rating changes, and so how long a change of rank is shown. */
export const RECENT_DAYS = 7

/** The fields of a Codeforces RatingChange the build keeps. */
export interface RatingChange {
  contestId: number
  handle: string
  ratingUpdateTimeSeconds: number
  oldRating: number
  newRating: number
}

export interface Recent {
  /** The players, with ratings the list does not have yet. */
  users: RatedUser[]
  /** Everyone rated in one of the contests: they competed this month. */
  competed: Set<string>
  /** Handle → rating a week ago, for the players whose rank is not the one they had then. */
  moved: Map<string, number>
}

/**
 * Walks each player's changes in order. The list's rating is somewhere along that
 * chain (before the week, or after some of its contests), and once it matches a
 * change's old rating it follows the chain to the end, so contests the list already
 * counted are never applied twice.
 */
export function applyRecent(users: RatedUser[], changes: RatingChange[]): Recent {
  const byHandle = new Map<string, RatingChange[]>()
  for (const change of changes) {
    const list = byHandle.get(change.handle)
    if (list) list.push(change)
    else byHandle.set(change.handle, [change])
  }
  for (const list of byHandle.values()) {
    list.sort((a, b) => a.ratingUpdateTimeSeconds - b.ratingUpdateTimeSeconds || a.contestId - b.contestId)
  }

  const moved = new Map<string, number>()
  const updated = users.map((user) => {
    const chain = byHandle.get(user.handle)
    if (!chain) return user
    let rating = user.rating
    for (const change of chain) if (rating === change.oldRating) rating = change.newRating
    // A first contest starts from 0: that player was unrated, not a Newbie.
    const start = chain[0].oldRating
    if (start !== 0 && rankFor(start).tier !== rankFor(rating).tier) moved.set(user.handle, start)
    return rating === user.rating ? user : { ...user, rating, maxRating: Math.max(user.maxRating, rating) }
  })

  return { users: updated, competed: new Set(byHandle.keys()), moved }
}
