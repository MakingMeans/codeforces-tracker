import { describe, expect, it } from 'vitest'
import { contrast } from '../contrast'
import {
  averageRankFor,
  DIVISIONS,
  divisionFor,
  NEWBIE_AVERAGE,
  nextRank,
  rankFor,
  RANKS,
  romanFor,
  UNRATED,
} from './ranks'

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

describe('averageRankFor', () => {
  it('draws a Newbie average in yellow', () => {
    expect(averageRankFor(1169)).toEqual({ ...RANKS[0], color: NEWBIE_AVERAGE })
  })

  it('leaves every other rank as it is', () => {
    expect(averageRankFor(1424)).toBe(rankFor(1424))
    expect(averageRankFor(2405)).toBe(rankFor(2405))
    expect(averageRankFor(null)).toBe(UNRATED)
  })
})

describe('rank colours', () => {
  it.each(
    [...RANKS, UNRATED, { name: 'Newbie average', color: NEWBIE_AVERAGE }].map((rank) => [rank.name, rank.color]),
  )('%s reads at 4.5:1 or more on panels', (_, color) => {
    expect(contrast(color, SURFACE)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(color, SURFACE_2)).toBeGreaterThanOrEqual(4.5)
  })
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
    [1267, 1],
    [1269, 1],
    [1270, 2],
    [1329, 2],
    [1330, 3],
    [1399, 3],
    [1530, 3],
    [1699, 1],
    [1700, 2],
    [1899, 3],
    [2029, 2],
    [2030, 3],
    [2169, 1],
    [2170, 2],
    [2300, 1],
    [2330, 2],
    [2369, 2],
    [2370, 3],
    [2399, 3],
    [2470, 2],
    [2600, 1],
    [2729, 1],
    [2730, 2],
    [2870, 3],
    [2999, 3],
    [3000, 1],
    [3343, 2],
    [3400, 3],
    [3670, 3],
    [4000, 3],
  ])('puts %i in division %i', (rating, division) => {
    expect(divisionFor(rating)).toBe(division)
  })

  it('has no division without a rating', () => {
    expect(divisionFor(null)).toBe(0)
    expect(divisionFor(undefined)).toBe(0)
  })

  it('gives every rank three divisions inside it, the first at its start', () => {
    RANKS.forEach((rank, tier) => {
      const { starts } = DIVISIONS[tier]
      expect(starts).toHaveLength(3)
      expect([...starts].sort((a, b) => a - b)).toEqual(starts)
      if (tier > 0) expect(starts[0]).toBe(rank.min)
      const next = RANKS[tier + 1]
      if (next) expect(starts[2]).toBeLessThan(next.min ?? Infinity)
    })
  })

  it('cuts 200-point ranks 70 / 60 / 70', () => {
    expect(DIVISIONS[1].starts).toEqual([1200, 1270, 1330])
  })
})

describe('romanFor', () => {
  it('writes divisions as roman numerals', () => {
    expect([1, 2, 3].map(romanFor)).toEqual(['I', 'II', 'III'])
    expect(romanFor(0)).toBe('')
    expect(romanFor(4)).toBe('')
  })
})
