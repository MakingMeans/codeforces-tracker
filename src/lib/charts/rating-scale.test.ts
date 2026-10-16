import { describe, expect, it } from 'vitest'
import { monthTicks, nearestIndex, ratingDomain, ratingTicks, timeDomain, ratingPath, DAY_MS } from './rating-scale'

describe('ratingDomain', () => {
  it('starts 100 below the lowest point and leaves the next band in view', () => {
    // Highest 1874 (Expert): the top is the next rank (1900) + 100 = 2000, rounded to hundreds.
    expect(ratingDomain([412, 1874, 1700])).toEqual([300, 2100])
  })

  it('never goes below zero', () => {
    expect(ratingDomain([50, 400])[0]).toBe(0)
  })

  it('adds 150 above the top when that is higher than the next band', () => {
    // 3786 is past the last threshold (3000): 3786 + 150 = 3936 → 4000.
    expect(ratingDomain([2900, 3786])).toEqual([2800, 4000])
  })
})

describe('timeDomain', () => {
  it('spans at least two months, padded on both sides', () => {
    const [from, to] = timeDomain([0])
    expect(to - from).toBeCloseTo(60 * DAY_MS * 1.08)
  })
})

describe('ratingTicks', () => {
  const y = (rating: number) => 1000 - rating // one pixel per rating point

  it('keeps every rank threshold in range', () => {
    const ticks = ratingTicks(300, 2100, y)
    for (const threshold of [1200, 1400, 1600, 1900]) expect(ticks).toContain(threshold)
  })

  it('adds round values only where they do not crowd a threshold', () => {
    // 10 rating points per pixel: 2000 sits 10 px from the 1900 threshold, too close.
    const ticks = ratingTicks(300, 2100, (rating) => (2100 - rating) / 10, 18)
    expect(ticks).toEqual([400, 800, 1200, 1400, 1600, 1900])
    expect(ticks).not.toContain(2000)
  })

  it('drops a threshold whose label would overlap the one below', () => {
    // 100 rating points = 8.6 px, as on a long legendary-grandmaster history.
    const ticks = ratingTicks(1500, 4000, (rating) => ((4000 - rating) * 8.6) / 100)
    expect(ticks).toContain(2300)
    expect(ticks).not.toContain(2400)
    for (let i = 1; i < ticks.length; i++) expect(((ticks[i] - ticks[i - 1]) * 8.6) / 100).toBeGreaterThanOrEqual(14)
  })
})

describe('monthTicks', () => {
  it('labels the first month and every January with the year', () => {
    const from = new Date(2025, 9, 15).getTime()
    const to = new Date(2026, 3, 15).getTime()
    expect(monthTicks(from, to, 2000).map((tick) => tick.label)).toEqual([
      'Nov 2025',
      'Dec',
      'Jan 2026',
      'Feb',
      'Mar',
      'Apr',
    ])
  })

  it('thins labels when space is short', () => {
    const from = new Date(2025, 0, 15).getTime()
    const to = new Date(2026, 6, 15).getTime()
    const ticks = monthTicks(from, to, 640)
    expect(ticks.length).toBeLessThanOrEqual(10)
    expect(ticks[0].label).toBe('Feb 2025')
  })

  it('switches to years for long histories', () => {
    const from = new Date(2010, 1, 1).getTime()
    const to = new Date(2026, 9, 1).getTime()
    const labels = monthTicks(from, to, 760).map((tick) => tick.label)
    expect(labels.every((label) => /^\d{4}$/.test(label))).toBe(true)
    expect(labels.length).toBeGreaterThan(4)
    expect(labels.length).toBeLessThanOrEqual(12)
  })
})

describe('nearestIndex', () => {
  const sorted = [10, 20, 40, 80]
  it.each([
    [0, 0],
    [14, 0],
    [16, 1],
    [30, 1],
    [31, 2],
    [100, 3],
  ])('nearest to %i is index %i', (target, index) => {
    expect(nearestIndex(sorted, target)).toBe(index)
  })
})

describe('ratingPath', () => {
  const x = (time: number) => time
  const y = (rating: number) => 2000 - rating

  it('joins the contests with straight segments', () => {
    const points = [
      { time: 0, rating: 400 },
      { time: 10, rating: 700 },
    ]
    expect(ratingPath(points, 10, x, y)).toBe('M0.0 1600.0L10.0 1300.0')
  })

  it('stays flat from the last contest to the end', () => {
    const points = [
      { time: 0, rating: 400 },
      { time: 10, rating: 1171 },
    ]
    expect(ratingPath(points, 90, x, y)).toBe('M0.0 1600.0L10.0 829.0H90.0')
  })

  it('draws nothing without points', () => {
    expect(ratingPath([], 90, x, y)).toBe('')
  })
})
