/**
 * Recently loaded profiles, kept in memory and in sessionStorage for five
 * minutes so going back to one is instant. Only the processed profile is
 * stored: raw submissions can exceed 6 MB, more than sessionStorage holds.
 */
import type { Profile } from './codeforces/profile'
import { rankFor } from './codeforces/ranks'

export const PROFILE_TTL_MS = 5 * 60 * 1000
const PREFIX = 'cf-tracker:profile:v3:'

/** The JSON form of a profile: the per-day Map becomes a list of pairs. */
interface Stored {
  savedAt: number
  profile: Omit<Profile, 'details'> & {
    details: Omit<Profile['details'], 'activity'> & {
      activity: Omit<Profile['details']['activity'], 'perDay'> & { perDay: Array<[string, number]> }
    }
  }
}

const memory = new Map<string, { savedAt: number; profile: Profile }>()
const keyFor = (handle: string) => PREFIX + handle.toLowerCase()

export function serialize(profile: Profile, savedAt: number): Stored {
  const { activity } = profile.details
  return {
    savedAt,
    profile: { ...profile, details: { ...profile.details, activity: { ...activity, perDay: [...activity.perDay] } } },
  }
}

export function deserialize(stored: Stored): Profile {
  const { profile } = stored
  const { activity } = profile.details
  return {
    ...profile,
    // Ranks are rebuilt rather than read back: JSON turns Newbie's -Infinity into null.
    user: { ...profile.user, rank: rankFor(profile.user.rating), maxRank: rankFor(profile.user.maxRating) },
    details: { ...profile.details, activity: { ...activity, perDay: new Map(activity.perDay) } },
  }
}

function session(): Storage | null {
  try {
    return globalThis.sessionStorage ?? null
  } catch {
    return null
  }
}

export function getCachedProfile(handle: string, now = Date.now()): Profile | null {
  const key = keyFor(handle)
  const fresh = (savedAt: number) => now - savedAt < PROFILE_TTL_MS

  const inMemory = memory.get(key)
  if (inMemory && fresh(inMemory.savedAt)) return inMemory.profile

  try {
    const raw = session()?.getItem(key)
    if (!raw) return null
    const stored = JSON.parse(raw) as Stored
    if (!fresh(stored.savedAt)) return null
    const profile = deserialize(stored)
    memory.set(key, { savedAt: stored.savedAt, profile })
    return profile
  } catch {
    return null
  }
}

export function cacheProfile(profile: Profile, now = Date.now()) {
  const key = keyFor(profile.user.handle)
  memory.set(key, { savedAt: now, profile })
  const store = session()
  if (!store) return
  const json = JSON.stringify(serialize(profile, now))
  try {
    store.setItem(key, json)
  } catch {
    // Probably full: drop the other cached profiles and try once more.
    try {
      for (let i = store.length - 1; i >= 0; i--) {
        const other = store.key(i)
        if (other?.startsWith(PREFIX) && other !== key) store.removeItem(other)
      }
      store.setItem(key, json)
    } catch {
      // Still no room; the in-memory copy is enough for this visit.
    }
  }
}

/** For tests. */
export const clearProfileMemory = () => memory.clear()
