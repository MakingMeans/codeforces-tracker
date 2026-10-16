import { describe, expect, it } from 'vitest'
import { formatAgo, formatCountdown, formatDelta, formatDuration, formatNumber, plural } from './format'

const MIN = 60_000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

describe('formatDelta', () => {
  it('signs gains and uses a true minus sign for losses', () => {
    expect(formatDelta(62)).toBe('+62')
    expect(formatDelta(-33)).toBe('−33')
    expect(formatDelta(0)).toBe('0')
  })
})

describe('formatDuration', () => {
  it.each([
    [8100, '2h 15m'],
    [7200, '2h'],
    [2700, '45m'],
    [0, ''],
  ])('%i seconds is "%s"', (seconds, text) => {
    expect(formatDuration(seconds)).toBe(text)
  })
})

describe('formatNumber and plural', () => {
  it('groups thousands', () => {
    expect(formatNumber(11183)).toBe('11,183')
  })

  it('picks the singular only for one', () => {
    expect(plural(1, 'contest')).toBe('1 contest')
    expect(plural(1631, 'contest')).toBe('1,631 contests')
    expect(plural(0, 'day')).toBe('0 days')
  })
})

describe('formatCountdown', () => {
  it.each([
    [4 * DAY + 6 * HOUR + 30 * MIN, 'in 4d 6h'],
    [3 * HOUR + 12 * MIN, 'in 3h 12m'],
    [12 * MIN + 30_000, 'in 12m'],
    [30_000, 'starting now'],
    [-MIN, 'starting now'],
  ])('%i ms is "%s"', (ms, text) => {
    expect(formatCountdown(ms)).toBe(text)
  })
})

describe('formatAgo', () => {
  const then = Date.parse('2023-03-10T12:00:00Z')
  it.each([
    [20_000, 'just now'],
    [MIN, '1 minute ago'],
    [5 * MIN, '5 minutes ago'],
    [2 * HOUR, '2 hours ago'],
    [3 * DAY, '3 days ago'],
    [400 * DAY, 'Mar 2023'],
  ])('%i ms ago is "%s"', (ms, text) => {
    expect(formatAgo(ms, then)).toBe(text)
  })
})
