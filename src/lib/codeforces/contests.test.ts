import { describe, expect, it } from 'vitest'
import { contests as contestList, NOW, ratings, submissions } from '../../../tests/fixtures'
import { DAY_MS } from './activity'
import { buildContests, isRated, ratingAt, RATING_GRACE_MS } from './contests'

const history = buildContests(ratings, submissions, contestList, NOW)
const entry = (id: number) => {
  const found = history.find((contest) => contest.id === id)
  if (!found) throw new Error(`contest ${id} is not in the history`)
  return found
}

describe('buildContests', () => {
  it('joins rated contests and live participation, most recent first', () => {
    expect(history.map((contest) => contest.id)).toEqual([2004, 2005, 100500, 2003, 2002, 2001, 2009, 1990])
  })

  it('leaves out virtual and practice runs', () => {
    expect(history.some((contest) => contest.id === 2006)).toBe(false)
    expect(history.some((contest) => contest.id === 2007)).toBe(false)
  })

  it('reads gains, losses and unchanged ratings from user.rating', () => {
    expect(entry(2001)).toMatchObject({ outcome: 'gain', before: 1400, after: 1462, place: 1631 })
    expect(entry(2002)).toMatchObject({ outcome: 'loss', before: 1462, after: 1429, place: 4210 })
    expect(entry(2009)).toMatchObject({ outcome: 'even', before: 1400, after: 1400, place: 5000 })
    expect(entry(1990)).toMatchObject({ outcome: 'gain', before: 0, after: 1400 })
  })

  it('names a contest missing from contest.list after its rating change, without a duration', () => {
    expect(entry(1990)).toMatchObject({
      name: 'Codeforces Round 990 (Div. 2)',
      duration: 0,
      start: Date.parse('2026-06-01T17:00:00Z'),
    })
  })

  it('marks a recent contest with no rating change yet as pending', () => {
    expect(entry(2004)).toMatchObject({ outcome: 'pending', before: 1429, after: 1429 })
    expect(entry(2004).place).toBeUndefined()
  })

  it('stops waiting once the grace period has passed', () => {
    const ended = Date.parse('2026-10-14T14:35:00Z') + 9000 * 1000
    const later = buildContests(ratings, submissions, contestList, ended + RATING_GRACE_MS + 1)
    expect(later.find((contest) => contest.id === 2004)?.outcome).toBe('unrated')
  })

  it('keeps waiting while the contest is still being judged', () => {
    const judging = contestList.map((contest) => (contest.id === 2004 ? { ...contest, phase: 'SYSTEM_TEST' } : contest))
    const later = buildContests(ratings, submissions, judging, NOW + 30 * DAY_MS)
    expect(later.find((contest) => contest.id === 2004)?.outcome).toBe('pending')
  })

  it('never waits on a round whose name says it is unrated', () => {
    expect(entry(2005)).toMatchObject({ outcome: 'unrated', before: 1429, after: 1429 })
  })

  it('counts out-of-competition runs as live, with the rating held at the start', () => {
    expect(entry(2003)).toMatchObject({ outcome: 'unrated', before: 1429, after: 1429 })
  })

  it('shows a gym as "Contest {id}" without a duration, starting at the first submission', () => {
    expect(entry(100500)).toMatchObject({
      name: 'Contest 100500',
      duration: 0,
      outcome: 'unrated',
      start: Date.parse('2026-09-28T09:00:00Z'),
    })
  })

  it('orders problems naturally and counts failed attempts per problem', () => {
    expect(entry(2001).problems).toEqual([
      { index: 'A', name: 'Problem A', solved: true, failed: 0 },
      { index: 'B', name: 'Problem B', solved: true, failed: 0 },
      { index: 'C1', name: 'Problem C1', solved: true, failed: 0 },
      { index: 'C2', name: 'Problem C2', solved: false, failed: 2 },
    ])
    expect(entry(2001).failed).toBe(2)
  })

  it('counts compilation errors as failures but not skipped or untested submissions', () => {
    const problems = Object.fromEntries(entry(2003).problems.map((problem) => [problem.index, problem]))
    expect(problems.C).toMatchObject({ solved: true, failed: 1 })
    expect(problems.D).toMatchObject({ solved: false, failed: 1 })
    expect(problems.E).toMatchObject({ solved: false, failed: 0 })
    expect(entry(2003).failed).toBe(2)
  })

  it('tells rated outcomes apart from the rest', () => {
    expect(history.filter(isRated).map((contest) => contest.id)).toEqual([2002, 2001, 2009, 1990])
  })
})

describe('ratingAt', () => {
  it('is 0 before the first rated contest', () => {
    expect(ratingAt(ratings, Date.parse('2026-05-01T00:00:00Z'))).toBe(0)
  })

  it('is the last change applied before the given time', () => {
    expect(ratingAt(ratings, Date.parse('2026-08-21T09:59:00Z'))).toBe(1462)
    expect(ratingAt(ratings, Date.parse('2026-08-21T10:00:00Z'))).toBe(1429)
  })
})
