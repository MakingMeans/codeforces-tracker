/**
 * Scales and ticks for the rating chart, kept apart from the drawing so they
 * can be tested. Same rules as the portfolio chart.
 */
import { nextRank, RANKS } from '../codeforces/ranks'

export const DAY_MS = 86_400_000

/**
 * Rating range on the y axis: 100 below the lowest point, and enough above the
 * highest to show the next rank's band (the one being climbed towards),
 * rounded to hundreds.
 */
export function ratingDomain(ratings: number[]): [number, number] {
  const low = Math.min(...ratings)
  const top = Math.max(...ratings)
  const next = nextRank(top)?.min ?? top
  const lo = Math.max(0, Math.floor((low - 100) / 100) * 100)
  const hi = Math.ceil(Math.max(top + 150, next + 100) / 100) * 100
  return [lo, hi]
}

/** Time range on the x axis: at least two months, with a little room on both sides. */
export function timeDomain(times: number[]): [number, number] {
  const first = Math.min(...times)
  const last = Math.max(...times)
  const span = Math.max(last - first, 60 * DAY_MS)
  const middle = (first + last) / 2
  return [middle - span * 0.54, middle + span * 0.54]
}

/**
 * Rank thresholds first (they are what the reader steers by), then round values
 * where there is room. Thresholds may sit a little closer together than round
 * values, but never so close that their labels overlap.
 */
export function ratingTicks(lo: number, hi: number, y: (rating: number) => number, minGapPx = 18, thresholdGapPx = 14) {
  const ticks: number[] = []
  const clear = (value: number, gap: number) => ticks.every((tick) => Math.abs(y(tick) - y(value)) >= gap)

  for (const rank of RANKS.slice(1)) {
    const value = rank.min ?? 0
    if (value > lo && value < hi && clear(value, thresholdGapPx)) ticks.push(value)
  }
  const step = hi - lo > 1600 ? 400 : 200
  for (let value = Math.ceil(lo / step) * step; value < hi; value += step) {
    if (clear(value, minGapPx)) ticks.push(value)
  }
  return ticks.sort((a, b) => a - b)
}

const LABEL_SPACING_PX = 64

/**
 * Time labels for the x axis, at least ~64 px apart. Short histories get months
 * (the year on the first label and on each January); once labels would be half a
 * year or more apart, they switch to years.
 */
export function monthTicks(from: number, to: number, plotWidth: number) {
  const months: number[] = []
  const cursor = new Date(from)
  cursor.setHours(0, 0, 0, 0)
  cursor.setDate(1)
  cursor.setMonth(cursor.getMonth() + 1)
  for (; cursor.getTime() <= to; cursor.setMonth(cursor.getMonth() + 1)) months.push(cursor.getTime())

  const width = Math.max(plotWidth, 1)
  const every = Math.max(1, Math.ceil((months.length * LABEL_SPACING_PX) / width))

  if (every >= 6) {
    const years = months.filter((time) => new Date(time).getMonth() === 0)
    const everyYear = Math.max(1, Math.ceil((years.length * LABEL_SPACING_PX) / width))
    return years
      .filter((time) => new Date(time).getFullYear() % everyYear === 0)
      .map((time) => ({ time, label: String(new Date(time).getFullYear()) }))
  }

  return months
    .filter((_, i) => i % every === 0)
    .map((time, i) => {
      const date = new Date(time)
      const month = date.toLocaleDateString('en-US', { month: 'short' })
      return { time, label: i === 0 || date.getMonth() === 0 ? `${month} ${date.getFullYear()}` : month }
    })
}

/**
 * SVG path of the rating a player held over time: flat while it does not change,
 * a vertical step at each contest, and flat again from the last contest to `until`.
 * Any date on the line reads the rating held on that date, which is what the
 * comparison cursor shows.
 */
export function heldPath(
  points: { time: number; rating: number }[],
  until: number,
  x: (time: number) => number,
  y: (rating: number) => number,
) {
  if (points.length === 0) return ''
  const px = (time: number) => x(time).toFixed(1)
  const steps = points.slice(1).map((point) => `H${px(point.time)}V${y(point.rating).toFixed(1)}`)
  const end = Math.max(until, points[points.length - 1].time)
  return `M${px(points[0].time)} ${y(points[0].rating).toFixed(1)}${steps.join('')}H${px(end)}`
}

/** Index of the point closest to `target` in a list sorted ascending. */
export function nearestIndex(sorted: number[], target: number) {
  let lo = 0
  let hi = sorted.length - 1
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (sorted[mid] < target) lo = mid + 1
    else hi = mid
  }
  if (lo > 0 && Math.abs(sorted[lo - 1] - target) <= Math.abs(sorted[lo] - target)) return lo - 1
  return lo
}
