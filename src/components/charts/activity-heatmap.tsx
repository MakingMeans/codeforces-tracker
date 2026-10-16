import { useMemo, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { heatLevel, heatmapGrid, LEVEL_HINTS, weeksThatFit, type HeatCell } from '../../lib/charts/heatmap'
import { formatNumber } from '../../lib/codeforces/format'
import { useElementWidth } from '../../lib/use-element-width'
import { useNow } from '../../lib/use-now'

const CELL = 11
const GAP = 3
const STEP = CELL + GAP
const LABEL_WIDTH = 30
const TOP = 18
const TOOLTIP_WIDTH = 190
const DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', '']
/** Literal class names, so Tailwind generates them. */
const LEVEL_FILL = ['fill-heat-0', 'fill-heat-1', 'fill-heat-2', 'fill-heat-3', 'fill-heat-4']
const LEVEL_BG = ['bg-heat-0', 'bg-heat-1', 'bg-heat-2', 'bg-heat-3', 'bg-heat-4']

const describeDay = (cell: HeatCell) =>
  `${cell.count === 0 ? 'No' : formatNumber(cell.count)} submission${cell.count === 1 ? '' : 's'} on ${cell.date.toLocaleDateString(
    'en-US',
    { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
  )}`

/**
 * Submissions per day in the visitor's time zone, one column per week with
 * Monday on top, as many weeks as fit (12 to 53). Arrow keys move day by day
 * and week by week.
 */
export function ActivityHeatmap({ perDay }: { perDay: Map<string, number> }) {
  const [ref, width] = useElementWidth<HTMLDivElement>()
  const [active, setActive] = useState<number | null>(null)
  const now = useNow(60 * 60 * 1000)

  const weeks = weeksThatFit(width, STEP, LABEL_WIDTH, GAP)
  const { cells, months } = useMemo(() => heatmapGrid(perDay, new Date(now), weeks), [perDay, now, weeks])
  const index = useMemo(() => new Map(cells.map((cell, i) => [`${cell.week}:${cell.weekday}`, i])), [cells])

  const svgWidth = LABEL_WIDTH + weeks * STEP - GAP
  const svgHeight = TOP + 7 * STEP - GAP
  const cell = active === null ? null : cells[active]
  const last = cells.length - 1

  function onPointerMove(event: PointerEvent<SVGSVGElement>) {
    const bounds = event.currentTarget.getBoundingClientRect()
    const week = Math.floor((event.clientX - bounds.left - LABEL_WIDTH) / STEP)
    const weekday = Math.floor((event.clientY - bounds.top - TOP) / STEP)
    setActive(index.get(`${week}:${weekday}`) ?? null)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const current = active ?? last
    const moves: Record<string, number> = { ArrowUp: -1, ArrowDown: 1, ArrowLeft: -7, ArrowRight: 7 }
    let next: number | null = null
    if (event.key in moves) next = current + moves[event.key]
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = last
    if (next === null) return
    event.preventDefault()
    setActive(Math.min(last, Math.max(0, next)))
  }

  const tooltipCenter = cell
    ? Math.min(
        Math.max(LABEL_WIDTH + cell.week * STEP + CELL / 2, TOOLTIP_WIDTH / 2),
        Math.max(width, svgWidth) - TOOLTIP_WIDTH / 2,
      )
    : 0

  return (
    <div className="grid gap-2">
      <div
        ref={ref}
        tabIndex={0}
        role="group"
        aria-label={`Daily submissions over the last ${weeks} weeks. Use the arrow keys to read each day.`}
        onKeyDown={onKeyDown}
        onFocus={() => setActive((value) => value ?? last)}
        onBlur={() => setActive(null)}
        className="relative overflow-x-clip"
        style={{ height: svgHeight }}
      >
        {width > 0 ? (
          <svg
            width={svgWidth}
            height={svgHeight}
            aria-hidden
            className="block"
            onPointerMove={onPointerMove}
            onPointerLeave={() => setActive(null)}
          >
            {months.map(({ week, label }) => (
              <text key={week} x={LABEL_WIDTH + week * STEP} y={11} className="fill-ink-muted font-label text-[11px]">
                {label}
              </text>
            ))}
            {DAY_LABELS.map((label, weekday) =>
              label ? (
                <text
                  key={label}
                  x={0}
                  y={TOP + weekday * STEP + CELL - 2}
                  className="fill-ink-muted font-label text-[11px]"
                >
                  {label}
                </text>
              ) : null,
            )}
            {cells.map((day, i) => (
              <rect
                key={`${day.week}:${day.weekday}`}
                x={LABEL_WIDTH + day.week * STEP}
                y={TOP + day.weekday * STEP}
                width={CELL}
                height={CELL}
                className={LEVEL_FILL[heatLevel(day.count)]}
                stroke={i === active ? 'var(--color-ink)' : 'none'}
                strokeWidth={1.5}
              />
            ))}
          </svg>
        ) : null}

        <div aria-live="polite" className="sr-only">
          {cell ? describeDay(cell) : ''}
        </div>

        {cell ? (
          <div
            aria-hidden
            className="cut pointer-events-none absolute z-10 grid px-3 py-1.5 text-center [--cut:8px] [--cut-fill:var(--color-surface-3)] [--cut-line:var(--color-line-strong)]"
            style={{
              left: tooltipCenter - TOOLTIP_WIDTH / 2,
              top: TOP + cell.weekday * STEP - 8,
              width: TOOLTIP_WIDTH,
              transform: 'translateY(-100%)',
            }}
          >
            <span className="text-sm font-semibold">
              {cell.count === 0 ? 'No' : formatNumber(cell.count)} submission{cell.count === 1 ? '' : 's'}
            </span>
            <span className="text-xs text-ink-muted">
              {cell.date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-end gap-1.5 text-xs text-ink-muted">
        <span>Less</span>
        {LEVEL_BG.map((background, level) => (
          <span key={background} title={LEVEL_HINTS[level]} className={`h-[11px] w-[11px] ${background}`}>
            <span className="sr-only">{LEVEL_HINTS[level]}</span>
          </span>
        ))}
        <span>More</span>
      </div>
    </div>
  )
}
