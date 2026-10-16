import { describe, expect, it } from 'vitest'
import { formatDelta, formatDuration, formatNumber, plural } from './format'

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
