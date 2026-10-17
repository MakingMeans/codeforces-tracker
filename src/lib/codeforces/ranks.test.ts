import { describe, expect, it } from 'vitest'
import { contrast } from '../contrast'
import { DIVISIONS, divisionFor, nextRank, rankFor, RANKS, romanFor, UNRATED } from './ranks'

const SURFACE = '#16232f'
const SURFACE_2 = '#1d2c3a'

describe('rankFor', () => {
  it.each([
    [0, 'Newbie'],
    [1199, 'Newbie'],
    [1200, 'Pupil'],
    [1400, 'Specialist'],
    [1600, 'Expert'],
    [1899, 'Expert'],
    [1900, 'Candidate Master'],
    [2100, 'Master'],
    [2300, 'International Master'],
    [2400, 'Grandmaster'],
    [2600, 'International Grandmaster'],
    [2999, 'International Grandmaster'],
    [3000, 'Legendary Grandmaster'],
    [4000, 'Legendary Grandmaster'],
  ])('%i is %s', (rating, name) => {
    expect(rankFor(rating).name).toBe(name)
  })

  it('treats a missing rating as Unrated, never as Newbie', () => {
    expect(rankFor(null)).toBe(UNRATED)
    expect(rankFor(undefined)).toBe(UNRATED)
  })

  it('numbers the tiers 0 to 9 in order', () => {
    expect(RANKS.map((rank) => rank.tier)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  })
})

describe('nextRank', () => {
  it('is the band being climbed towards', () => {
    expect(nextRank(1874)?.name).toBe('Candidate Master')
  })

  it('is undefined at the top', () => {
    expect(nextRank(3500)).toBeUndefined()
  })
})

describe('rank colours', () => {
  it.each([...RANKS, UNRATED].map((rank) => [rank.name, rank.color]))(
    '%s reads at 4.5:1 or more on panels',
    (_, color) => {
      expect(contrast(color, SURFACE)).toBeGreaterThanOrEqual(4.5)
      expect(contrast(color, SURFACE_2)).toBeGreaterThanOrEqual(4.5)
    },
  )
})

describe('divisionFor', () => {
  it.each([
    [-50, 1],
    [0, 1],
    [399, 1],
    [400, 2],
    [800, 3],
    [1199, 3],
    [1200, 1],
    [1249, 1],
    [1250, 2],
    [1399, 4],
    [1450, 2],
    [1600, 1],
    [1799, 2],
    [1899, 3],
    [2050, 4],
    [2100, 1],
    [2299, 4],
    [2300, 1],
    [2349, 1],
    [2350, 2],
    [2399, 2],
    [2400, 1],
    [2599, 4],
    [2600, 1],
    [2999, 4],
    [3000, 1],
    [3343, 2],
    [3599, 3],
    [3600, 4],
    [4000, 4],
  ])('puts %i in division %i', (rating, division) => {
    expect(divisionFor(rating)).toBe(division)
  })

  it('has no division without a rating', () => {
    expect(divisionFor(null)).toBe(0)
    expect(divisionFor(undefined)).toBe(0)
  })

  it('starts each split at its rank, and covers the rank without gaps', () => {
    RANKS.forEach((rank, tier) => {
      const split = DIVISIONS[tier]
      if (tier > 0) expect(split.from).toBe(rank.min)
      const next = RANKS[tier + 1]
      if (next) expect(split.from + split.step * split.count).toBe(next.min)
    })
  })
})

describe('romanFor', () => {
  it('writes divisions as roman numerals', () => {
    expect([1, 2, 3, 4].map(romanFor)).toEqual(['I', 'II', 'III', 'IV'])
    expect(romanFor(0)).toBe('')
  })
})
