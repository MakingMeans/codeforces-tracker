import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { contests, NOW, ratings, submissions, user } from '../../tests/fixtures'
import { deriveDetails, type Profile } from './codeforces/profile'
import { toProfileUser } from './codeforces/user'
import {
  cacheProfile,
  clearProfileMemory,
  deserialize,
  getCachedProfile,
  PROFILE_TTL_MS,
  serialize,
} from './profile-cache'

const profile: Profile = {
  user: toProfileUser(user, NOW),
  details: deriveDetails(ratings, submissions, contests, NOW),
  fetchedAt: NOW,
}

class MemoryStorage {
  items = new Map<string, string>()
  get length() {
    return this.items.size
  }
  key(index: number) {
    return [...this.items.keys()][index] ?? null
  }
  getItem(key: string) {
    return this.items.get(key) ?? null
  }
  setItem(key: string, value: string) {
    this.items.set(key, value)
  }
  removeItem(key: string) {
    this.items.delete(key)
  }
}

beforeEach(() => {
  clearProfileMemory()
  vi.stubGlobal('sessionStorage', new MemoryStorage())
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('profile cache', () => {
  it('survives a JSON round trip, per-day Map and ranks included', () => {
    const restored = deserialize(JSON.parse(JSON.stringify(serialize(profile, NOW))))
    expect(restored.details.activity.perDay).toEqual(profile.details.activity.perDay)
    expect(restored.details.contests).toEqual(profile.details.contests)
    expect(restored.user.rank).toEqual(profile.user.rank)
    expect(restored.user.rank.min).toBe(1400)
  })

  it('finds a profile by handle, whatever its case', () => {
    cacheProfile(profile, NOW)
    expect(getCachedProfile('sample_handle', NOW + 1000)).toBe(profile)
  })

  it('reads sessionStorage when memory is empty (after a reload)', () => {
    cacheProfile(profile, NOW)
    clearProfileMemory()
    expect(getCachedProfile('Sample_Handle', NOW + 1000)?.user.handle).toBe('Sample_Handle')
  })

  it('forgets a profile after five minutes', () => {
    cacheProfile(profile, NOW)
    expect(getCachedProfile('Sample_Handle', NOW + PROFILE_TTL_MS)).toBeNull()
  })
})
