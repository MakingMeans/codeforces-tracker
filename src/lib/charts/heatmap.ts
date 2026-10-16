import { dayKey } from '../codeforces/activity'

/** Five levels: none, 1, 2–3, 4–6, 7 or more submissions. */
export const heatLevel = (count: number) => (count === 0 ? 0 : count === 1 ? 1 : count <= 3 ? 2 : count <= 6 ? 3 : 4)
export const LEVEL_HINTS = [
  'No submissions',
  '1 submission',
  '2–3 submissions',
  '4–6 submissions',
  '7 or more submissions',
]

export interface HeatCell {
  week: number
  /** 0 = Monday … 6 = Sunday. */
  weekday: number
  date: Date
  count: number
}

const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)

/** How many week columns fit, between 12 and 53. */
export const weeksThatFit = (width: number, step: number, labelWidth: number, gap: number) =>
  Math.max(12, Math.min(53, Math.floor((width - labelWidth + gap) / step)))

/**
 * One column per week, Monday on top, ending with the week of `now` (no days
 * after today), as on the Codeforces profile.
 */
export function heatmapGrid(perDay: Map<string, number>, now: Date, weeks: number) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const start = addDays(today, -((today.getDay() + 6) % 7) - (weeks - 1) * 7)

  const cells: HeatCell[] = []
  for (let week = 0; week < weeks; week++) {
    for (let weekday = 0; weekday < 7; weekday++) {
      const date = addDays(start, week * 7 + weekday)
      if (date > today) break
      cells.push({ week, weekday, date, count: perDay.get(dayKey(date)) ?? 0 })
    }
  }

  // A month is named over the first week that starts in it, unless that would crowd an edge.
  const months = Array.from({ length: weeks }, (_, week) => addDays(start, week * 7)).flatMap((monday, week, all) =>
    week > 0 && week < weeks - 2 && monday.getMonth() !== all[week - 1].getMonth()
      ? [{ week, label: monday.toLocaleDateString('en-US', { month: 'short' }) }]
      : [],
  )

  return { cells, months }
}
