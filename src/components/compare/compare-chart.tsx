import { useMemo, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { monthTicks, nearestIndex, ratingDomain, ratingTicks, timeDomain } from '../../lib/charts/rating-scale'
import { formatMonthYear } from '../../lib/codeforces/format'
import { rankFor, RANKS } from '../../lib/codeforces/ranks'
import type { RatingPoint } from '../../lib/codeforces/user'
import { useElementWidth } from '../../lib/use-element-width'

export interface Series {
  handle: string
  /** Validated as a pair: blue and orange stay apart for colour-blind readers. */
  color: string
  dashed: boolean
  history: RatingPoint[]
}

const HEIGHT = 280
const MARGIN = { top: 16, right: 18, bottom: 30, left: 46 }
const TOOLTIP_WIDTH = 220

/** The rating a series held at `time`: its last point at or before it. */
function ratingAt(history: RatingPoint[], time: number) {
  let rating: number | null = null
  for (const point of history) {
    if (point.time > time) break
    rating = point.rating
  }
  return rating
}

function Swatch({ series }: { series: Series }) {
  return (
    <svg width="22" height="8" aria-hidden className="shrink-0">
      <line
        x1="1"
        x2="21"
        y1="4"
        y2="4"
        stroke={series.color}
        strokeWidth="2.5"
        strokeDasharray={series.dashed ? '5 3' : undefined}
      />
    </svg>
  )
}

/**
 * Both ratings over time on the rank bands. The cursor reads what each one
 * held at that moment; arrow keys step through every contest of either.
 */
export function CompareChart({ series }: { series: Series[] }) {
  const [ref, width] = useElementWidth<HTMLDivElement>()
  const [active, setActive] = useState<number | null>(null)
  const plotted = useMemo(() => series.filter((entry) => entry.history.length > 0), [series])
  const times = useMemo(
    () => [...new Set(plotted.flatMap((entry) => entry.history.map((point) => point.time)))].sort((a, b) => a - b),
    [plotted],
  )

  const chart = useMemo(() => {
    if (times.length === 0 || width === 0) return null
    const plotWidth = Math.max(0, width - MARGIN.left - MARGIN.right)
    const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom
    const [x0, x1] = timeDomain(times)
    const [lo, hi] = ratingDomain(plotted.flatMap((entry) => entry.history.map((point) => point.rating)))
    const x = (time: number) => MARGIN.left + ((time - x0) / (x1 - x0)) * plotWidth
    const y = (rating: number) => MARGIN.top + ((hi - rating) / (hi - lo)) * plotHeight
    const bands = RANKS.flatMap((rank, i) => {
      const from = Math.max(lo, rank.min ?? -Infinity)
      const to = Math.min(hi, RANKS[i + 1]?.min ?? Infinity)
      return to > from ? [{ rank, top: y(to), height: y(from) - y(to) }] : []
    })
    const paths = plotted.map((entry) =>
      entry.history
        .map((point, i) => `${i ? 'L' : 'M'}${x(point.time).toFixed(1)} ${y(point.rating).toFixed(1)}`)
        .join(''),
    )
    // End labels, nudged apart when the two lines finish close together.
    const ends = plotted.map((entry) => {
      const last = entry.history[entry.history.length - 1]
      return { x: x(last.time), y: y(last.rating) }
    })
    if (ends.length === 2 && Math.abs(ends[0].y - ends[1].y) < 16) {
      const [upper, lower] = ends[0].y <= ends[1].y ? [ends[0], ends[1]] : [ends[1], ends[0]]
      upper.y -= 8
      lower.y += 8
    }
    return {
      plotWidth,
      plotHeight,
      x,
      y,
      bands,
      paths,
      ends,
      xs: times.map(x),
      ratingTicks: ratingTicks(lo, hi, y),
      monthTicks: monthTicks(x0, x1, plotWidth),
    }
  }, [times, plotted, width])

  if (plotted.length === 0) {
    return <p className="py-8 text-center text-sm text-ink-muted">Neither has taken a rated contest yet.</p>
  }

  const last = times.length - 1
  const time = active === null ? null : times[active]
  const cursorX = chart && active !== null ? chart.xs[active] : 0
  const tooltipLeft = cursorX + 14 + TOOLTIP_WIDTH <= width ? cursorX + 14 : Math.max(0, cursorX - 14 - TOOLTIP_WIDTH)
  const readings = time === null ? [] : series.map((entry) => ({ entry, rating: ratingAt(entry.history, time) }))

  function onPointer(event: PointerEvent<SVGRectElement>) {
    if (!chart) return
    const bounds = event.currentTarget.ownerSVGElement!.getBoundingClientRect()
    setActive(nearestIndex(chart.xs, event.clientX - bounds.left))
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const current = active ?? last
    const next =
      event.key === 'ArrowLeft'
        ? current - 1
        : event.key === 'ArrowRight'
          ? current + 1
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? last
              : null
    if (next === null) return
    event.preventDefault()
    setActive(Math.min(last, Math.max(0, next)))
  }

  return (
    <div className="grid gap-3">
      <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm" aria-label="Legend">
        {series.map((entry) => (
          <li key={entry.handle} className="flex items-center gap-2">
            <Swatch series={entry} />
            <span className="font-semibold">{entry.handle}</span>
            {entry.history.length === 0 ? <span className="text-ink-muted">(no rated contests)</span> : null}
          </li>
        ))}
      </ul>

      <div
        ref={ref}
        tabIndex={0}
        role="group"
        aria-label={`Rating history of ${series.map((entry) => entry.handle).join(' and ')}. Use the arrow keys to compare them over time.`}
        onKeyDown={onKeyDown}
        onFocus={() => setActive((value) => value ?? last)}
        onBlur={() => setActive(null)}
        className="relative touch-pan-y select-none"
        style={{ height: HEIGHT }}
      >
        {chart ? (
          <svg width={width} height={HEIGHT} aria-hidden className="block">
            {chart.bands.map(({ rank, top, height }) => (
              <rect
                key={rank.name}
                x={MARGIN.left}
                y={top}
                width={chart.plotWidth}
                height={height}
                fill={rank.color}
                fillOpacity={0.07}
              />
            ))}
            {chart.ratingTicks.map((tick) => (
              <g key={tick}>
                <line
                  x1={MARGIN.left}
                  x2={MARGIN.left + chart.plotWidth}
                  y1={chart.y(tick)}
                  y2={chart.y(tick)}
                  className="stroke-ink/7"
                />
                <text
                  x={MARGIN.left - 8}
                  y={chart.y(tick)}
                  dy="0.32em"
                  textAnchor="end"
                  className="fill-ink-muted font-label text-xs tabular-nums"
                >
                  {tick}
                </text>
              </g>
            ))}
            {chart.monthTicks.map((tick) => (
              <text
                key={tick.time}
                x={chart.x(tick.time)}
                y={HEIGHT - 9}
                textAnchor="middle"
                className="fill-ink-muted font-label text-xs"
              >
                {tick.label}
              </text>
            ))}
            {time !== null ? (
              <line
                x1={cursorX}
                x2={cursorX}
                y1={MARGIN.top}
                y2={MARGIN.top + chart.plotHeight}
                strokeDasharray="3 3"
                className="stroke-ink/35"
              />
            ) : null}
            {plotted.map((entry, i) => (
              <path
                key={entry.handle}
                d={chart.paths[i]}
                fill="none"
                stroke={entry.color}
                strokeWidth={2}
                strokeDasharray={entry.dashed ? '6 4' : undefined}
                strokeLinejoin="round"
              />
            ))}
            {readings.map(({ entry, rating }) =>
              rating === null ? null : (
                <circle
                  key={entry.handle}
                  cx={cursorX}
                  cy={chart.y(rating)}
                  r={4.5}
                  fill={entry.color}
                  strokeWidth={2}
                  className="stroke-surface"
                />
              ),
            )}
            {time === null
              ? plotted.map((entry, i) => (
                  <text
                    key={entry.handle}
                    x={chart.ends[i].x - 8}
                    y={chart.ends[i].y - 10}
                    textAnchor="end"
                    className="fill-ink stroke-surface font-label text-[13px] font-bold [paint-order:stroke] [stroke-width:4px]"
                  >
                    {entry.handle}
                  </text>
                ))
              : null}
            <rect
              x={MARGIN.left}
              y={MARGIN.top}
              width={chart.plotWidth}
              height={chart.plotHeight}
              fill="transparent"
              onPointerMove={onPointer}
              onPointerDown={onPointer}
              onPointerLeave={(event) => {
                if (event.pointerType === 'mouse') setActive(null)
              }}
            />
          </svg>
        ) : null}

        <div aria-live="polite" className="sr-only">
          {time === null
            ? ''
            : `${formatMonthYear(time)}: ${readings.map(({ entry, rating }) => `${entry.handle} ${rating ?? 'unrated'}`).join(', ')}`}
        </div>

        {time !== null ? (
          <div
            aria-hidden
            className="cut pointer-events-none absolute z-10 grid gap-1.5 px-3 py-2.5 [--cut:10px] [--cut-fill:var(--color-surface-3)] [--cut-line:var(--color-line-strong)]"
            style={{ left: tooltipLeft, top: MARGIN.top, width: TOOLTIP_WIDTH }}
          >
            <span className="text-xs text-ink-muted">{formatMonthYear(time)}</span>
            {readings.map(({ entry, rating }) => (
              <span key={entry.handle} className="flex items-center gap-2">
                <Swatch series={entry} />
                <span className="min-w-0 flex-1 truncate text-[13px] font-semibold">{entry.handle}</span>
                {rating === null ? (
                  <span className="text-[13px] text-ink-muted">Unrated</span>
                ) : (
                  <span className="font-display text-lg leading-none" style={{ color: rankFor(rating).color }}>
                    {rating}
                  </span>
                )}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}
