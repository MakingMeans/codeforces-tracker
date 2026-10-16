import { describe, expect, it } from 'vitest'
import { contests, NOW, ratings, submissions, user, userInfoUnrated } from '../../../tests/fixtures'
import { compareStats, headToHead, rowWinner } from './compare'
import type { ContestEntry } from './contests'
import { deriveDetails } from './details'
import type { Profile } from './profile'
import { toProfileUser } from './user'

const rated: Profile = {
  user: toProfileUser(user, NOW),
  details: deriveDetails(ratings, submissions, contests, NOW),
  fetchedAt: NOW,
}
const fresh: Profile = {
  user: toProfileUser(userInfoUnrated, NOW),
  details: deriveDetails([], [], contests, NOW),
  fetchedAt: NOW,
}

describe('compareStats', () => {
  const rows = compareStats(rated, fresh)
  const row = (label: string) => rows.find((entry) => entry.label === label)!

  it('lines up the same stats for both', () => {
    expect(row('Rating')).toMatchObject({ a: 1429, b: null })
    expect(row('Rated contests')).toMatchObject({ a: 4, b: 0 })
    expect(row('Problems solved')).toMatchObject({ a: 17, b: 0 })
  })

  it('picks the winner of each row, lower place being better', () => {
    expect(rowWinner(row('Problems solved'))).toBe('a')
    expect(rowWinner({ label: 'Best place', a: 12, b: 3, better: 'lower' })).toBe('b')
    expect(rowWinner({ label: 'Rating', a: 1500, b: 1500, better: 'higher' })).toBeNull()
    expect(rowWinner(row('Rating'))).toBeNull()
  })
})

describe('headToHead', () => {
  const entry = (id: number, start: number, place?: number): ContestEntry => ({
    id,
    name: `Round ${id}`,
    start,
    duration: 7200,
    outcome: place ? 'gain' : 'unrated',
    place,
    before: 1500,
    after: place ? 1520 : 1500,
    problems: [],
    failed: 0,
  })

  it('keeps contests both entered, newest first, with who finished ahead', () => {
    const a = [entry(1, 100, 50), entry(2, 200, 900), entry(3, 300), entry(4, 400, 10)]
    const b = [entry(2, 200, 40), entry(3, 300, 70), entry(1, 100, 80), entry(5, 500, 1)]
    const result = headToHead(a, b)
    expect(result.shared.map((contest) => [contest.id, contest.ahead])).toEqual([
      [3, null],
      [2, 'b'],
      [1, 'a'],
    ])
    expect(result).toMatchObject({ aAhead: 1, bAhead: 1 })
  })
})
