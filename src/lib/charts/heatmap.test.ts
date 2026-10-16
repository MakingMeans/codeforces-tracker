import { describe, expect, it } from 'vitest'
import { dayKey } from '../codeforces/activity'
import { heatLevel, heatmapGrid, weeksThatFit } from './heatmap'

describe('heatLevel', () => {
  it.each([
    [0, 0],
    [1, 1],
    [2, 2],
    [3, 2],
    [4, 3],
    [6, 3],
    [7, 4],
    [40, 4],
  ])('%i submissions is level %i', (count, level) => {
    expect(heatLevel(count)).toBe(level)
  })
})

describe('weeksThatFit', () => {
  it('stays between 12 and 53 weeks', () => {
    expect(weeksThatFit(100, 14, 30, 3)).toBe(12)
    expect(weeksThatFit(5000, 14, 30, 3)).toBe(53)
    expect(weeksThatFit(500, 14, 30, 3)).toBe(33)
  })
})

describe('heatmapGrid', () => {
  // Thursday, October 15, 2026.
  const now = new Date(2026, 9, 15, 12)
  const perDay = new Map([
    [dayKey(new Date(2026, 9, 12)), 3],
    [dayKey(new Date(2026, 9, 15)), 1],
  ])
  const { cells, months } = heatmapGrid(perDay, now, 20)

  it('puts Monday on top and ends today', () => {
    const lastCell = cells[cells.length - 1]
    expect(lastCell.date.getDate()).toBe(15)
    expect(lastCell.weekday).toBe(3) // Thursday
    expect(cells[0].weekday).toBe(0)
    expect(cells[0].date.getDay()).toBe(1) // a Monday
  })

  it('shows full weeks before the current one', () => {
    expect(cells).toHaveLength(19 * 7 + 4)
  })

  it('reads each day from the per-day counts', () => {
    expect(cells.find((cell) => cell.date.getDate() === 12 && cell.date.getMonth() === 9)?.count).toBe(3)
    expect(cells.filter((cell) => cell.count > 0)).toHaveLength(2)
  })

  it('names each month once, over its first week', () => {
    const labels = months.map((month) => month.label)
    expect(new Set(labels).size).toBe(labels.length)
    expect(labels).toContain('Sep')
  })
})
