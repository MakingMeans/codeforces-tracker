import { describe, expect, it } from 'vitest'
import { contests as contestList, NOW, ratings, submissions } from '../../../tests/fixtures'
import { buildContests } from './contests'
import { contestSummary } from './insights'

describe('contestSummary', () => {
  it('summarises the match history', () => {
    expect(contestSummary(buildContests(ratings, submissions, contestList, NOW))).toEqual({
      total: 8,
      rated: 4,
      unrated: 3,
      pending: 1,
      bestPlace: 1631,
      // The first contest's jump from 0 to 1400 is left out.
      bestGain: 62,
      worstLoss: -33,
    })
  })

  it('has nothing to report without contests', () => {
    expect(contestSummary([])).toEqual({
      total: 0,
      rated: 0,
      unrated: 0,
      pending: 0,
      bestPlace: null,
      bestGain: null,
      worstLoss: null,
    })
  })
})
