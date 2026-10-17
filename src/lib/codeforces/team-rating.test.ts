import { describe, expect, it } from 'vitest'
import { teamRating, topThreeTeamRating } from './team-rating'

describe('teamRating', () => {
  it('is the member’s own rating for one member', () => {
    expect(teamRating([1500])).toBe(1500)
  })

  it('rates a team above its best member', () => {
    expect(teamRating([2000, 2000, 2000])).toBe(2234)
    expect(teamRating([2405, 2205, 2172])).toBeGreaterThan(2405)
  })

  it('does not depend on the order of the members', () => {
    expect(teamRating([1171, 1267, 1192])).toBe(teamRating([1267, 1192, 1171]))
  })

  it('grows with the number of members', () => {
    expect(teamRating(Array(30).fill(1200))).toBe(1853)
  })

  it('has no rating without members', () => {
    expect(teamRating([])).toBeNull()
  })
})

describe('topThreeTeamRating', () => {
  it('uses only the best three', () => {
    expect(topThreeTeamRating([800, 2000, 900, 2000, 2000])).toBe(2234)
  })
})
