import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { contests, NOW } from '../../../tests/fixtures'
import { CONTEST_LIST_TTL_MS, getContestList, resetContestListMemory, upcomingContests } from './contest-list'

class MemoryStorage implements Storage {
  private items = new Map<string, string>()
  get length() {
    return this.items.size
  }
  clear() {
    this.items.clear()
  }
  getItem(key: string) {
    return this.items.get(key) ?? null
  }
  key(index: number) {
    return [...this.items.keys()][index] ?? null
  }
  removeItem(key: string) {
    this.items.delete(key)
  }
  setItem(key: string, value: string) {
    this.items.set(key, value)
  }
}

let fetchMock: ReturnType<typeof vi.fn>
const withExtras = contests.map((contest) => ({ ...contest, frozen: false, type: 'CF', relativeTimeSeconds: 0 }))

beforeEach(() => {
  fetchMock = vi.fn(async () => new Response(JSON.stringify({ status: 'OK', result: withExtras })))
  vi.stubGlobal('fetch', fetchMock)
  vi.stubGlobal('localStorage', new MemoryStorage())
  resetContestListMemory()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('getContestList', () => {
  it('fetches once and keeps only the fields the site reads', async () => {
    const list = await getContestList(undefined, NOW)
    expect(list).toHaveLength(contests.length)
    expect(Object.keys(list[0]).sort()).toEqual(['durationSeconds', 'id', 'name', 'phase', 'startTimeSeconds'])
    expect(fetchMock.mock.calls[0][0]).toBe('https://codeforces.com/api/contest.list?gym=false')
  })

  it('serves the list from memory, then from localStorage, for an hour', async () => {
    await getContestList(undefined, NOW)
    await getContestList(undefined, NOW + 1000)
    resetContestListMemory()
    await getContestList(undefined, NOW + CONTEST_LIST_TTL_MS - 1)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('fetches again once the hour has passed', async () => {
    await getContestList(undefined, NOW)
    await getContestList(undefined, NOW + CONTEST_LIST_TTL_MS)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('still works when storage is blocked', async () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
    })
    await expect(getContestList(undefined, NOW)).resolves.toHaveLength(contests.length)
  })
})

describe('upcomingContests', () => {
  it('lists contests that have not started, soonest first', () => {
    expect(upcomingContests(contests, NOW).map((contest) => contest.id)).toEqual([2008])
  })
})
