import { describe, expect, it } from 'vitest'
import { NOW, submissions } from '../../../tests/fixtures'
import { buildActivity, dayKey, longestStreak, submissionsLastYear } from './activity'

const activity = buildActivity(submissions, NOW)
const local = (year: number, month: number, day: number, hour = 12) => new Date(year, month - 1, day, hour).getTime()

describe('time zone', () => {
  it('runs these tests in a zone with daylight saving', () => {
    expect(Intl.DateTimeFormat().resolvedOptions().timeZone).toBe('America/New_York')
  })
})

describe('dayKey', () => {
  it('uses the local calendar day', () => {
    // 04:30 UTC on March 8 is still March 7 in New York.
    expect(dayKey(new Date(Date.parse('2026-03-08T04:30:00Z')))).toBe('2026-03-07')
  })
})

describe('buildActivity', () => {
  it('counts every submission per local day, whatever its verdict or kind', () => {
    expect(activity.perDay.get('2026-09-05')).toBe(7)
    expect(activity.perDay.get('2026-09-22')).toBe(1)
    expect([...activity.perDay.values()].reduce((total, count) => total + count, 0)).toBe(submissions.length)
  })

  it('counts each solved problem once, practice and virtual runs included', () => {
    expect(activity.solved).toEqual({ all: 17, year: 17, month: 7 })
  })

  it('finds the longest run of consecutive days', () => {
    expect(activity.streak).toEqual({ all: 2, year: 2, month: 2 })
  })

  it('totals the submissions of the last year', () => {
    expect(submissionsLastYear(activity.perDay, NOW)).toBe(submissions.length)
  })
})

describe('longestStreak', () => {
  it('is 0 without submissions', () => {
    expect(longestStreak([])).toBe(0)
  })

  it('counts several submissions on one day once', () => {
    expect(longestStreak([local(2026, 1, 10, 9), local(2026, 1, 10, 22)])).toBe(1)
  })

  it('survives the daylight-saving change, when a day is 23 hours long', () => {
    // DST starts on March 8, 2026 in New York.
    const days = [local(2026, 3, 7), local(2026, 3, 8), local(2026, 3, 9), local(2026, 3, 11)]
    expect(longestStreak(days)).toBe(3)
  })

  it('survives the change back, when a day is 25 hours long', () => {
    // DST ends on November 1, 2026 in New York.
    const days = [local(2026, 10, 31, 23), local(2026, 11, 1, 23), local(2026, 11, 2, 1)]
    expect(longestStreak(days)).toBe(3)
  })
})
