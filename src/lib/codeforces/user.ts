import type { ApiRatingChange, ApiUser } from '../api/types'
import { rankFor, type Rank } from './ranks'

export interface ProfileUser {
  /** With Codeforces' own capitalisation. */
  handle: string
  /** Where to load the photo from, in order; the page falls back to a local image after the last. */
  photos: string[]
  /** null until the first rated contest. */
  rating: number | null
  maxRating: number | null
  rank: Rank
  maxRank: Rank
  organization?: string
  /** "City, Country" with whichever parts are known. */
  location?: string
  contribution: number
  friendOfCount: number
  /** In ms. */
  registeredAt: number
  lastOnlineAt: number
}

export interface RatingPoint {
  contestId: number
  contestName: string
  /** When the change was applied, in ms. */
  time: number
  rating: number
  delta: number
  place: number
}

/** Some photo URLs come protocol-relative (`//userpic…`). */
export const absolute = (url: string) => (url.startsWith('//') ? `https:${url}` : url)

/**
 * userpic.codeforces.org sometimes fails, and its CDN can cache the error for
 * days, so the second try asks past that cache; the small avatar comes last.
 */
export function photoSources(user: Pick<ApiUser, 'titlePhoto' | 'avatar'>, now: number) {
  const title = absolute(user.titlePhoto)
  const bust = `${title}${title.includes('?') ? '&' : '?'}v=${now}`
  return [...new Set([title, bust, absolute(user.avatar)])]
}

export function toProfileUser(user: ApiUser, now: number): ProfileUser {
  const rating = user.rating ?? null
  const maxRating = user.maxRating ?? rating
  return {
    handle: user.handle,
    photos: photoSources(user, now),
    rating,
    maxRating,
    rank: rankFor(rating),
    maxRank: rankFor(maxRating),
    organization: user.organization?.trim() || undefined,
    location:
      [user.city, user.country]
        .map((part) => part?.trim())
        .filter(Boolean)
        .join(', ') || undefined,
    contribution: user.contribution ?? 0,
    friendOfCount: user.friendOfCount ?? 0,
    registeredAt: user.registrationTimeSeconds * 1000,
    lastOnlineAt: user.lastOnlineTimeSeconds * 1000,
  }
}

export const toRatingHistory = (ratings: ApiRatingChange[]): RatingPoint[] =>
  ratings.map((change) => ({
    contestId: change.contestId,
    contestName: change.contestName,
    time: change.ratingUpdateTimeSeconds * 1000,
    rating: change.newRating,
    delta: change.newRating - change.oldRating,
    place: change.rank,
  }))
