import { describe, expect, it } from 'vitest'
import { contrast } from '../contrast'
import { nextRank, rankFor, RANKS, UNRATED } from './ranks'

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
