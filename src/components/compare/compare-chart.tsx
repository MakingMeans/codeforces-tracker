import { useMemo, useState, type KeyboardEvent, type PointerEvent } from 'react'
import {
  diamond,
  markerSize,
  monthTicks,
  nearestIndex,
  ratingDomain,
  ratingPath,
  ratingTicks,
  timeDomain,
} from '../../lib/charts/rating-scale'
import { formatDate } from '../../lib/codeforces/format'
import { rankFor, RANKS } from '../../lib/codeforces/ranks'
import type { RatingPoint } from '../../lib/codeforces/user'
import { useElementWidth } from '../../lib/use-element-width'
import { useNow } from '../../lib/use-now'

export interface Series {
  handle: string
  /** Validated as a pair: blue and orange stay apart for colour-blind readers. */
  color: string
  dashed: boolean
  history: RatingPoint[]
}

const HEIGHT = 280
const MARGIN = { top: 16, right: 18, bottom: 30, left: 46 }
const TOOLTIP_WIDTH = 240

/**
 * What a series reads at `time`: the rating it held, from its last contest at or
 * before then. `live` when that contest is at `time` itself, so it has a point
 * on the line there.
 */
function readingAt(history: RatingPoint[], time: number) {
  let held: RatingPoint | null = null
  for (const point of history) {
    if (point.time > time) break
    held = point
  }
  return held ? { rating: held.rating, since: held.time, live: held.time === time } : null
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
 * Both ratings over time on the rank bands, each carried on flat to today
 * after its last contest. Diamonds mark contests, and the cursor only lights
 * up a diamond that is there: the other player's rating at that moment is in
 * the tooltip, as the one held since their last contest. Arrow keys step
 * through every contest of either.
 */
export function CompareChart({ series }: { series: Series[] }) {
  const [ref, width] = useElementWidth<HTMLDivElement>()
  const [active, setActive] = useState<number | null>(null)
  const now = useNow(60 * 60 * 1000)
  const plotted = useMemo(() => series.filter((entry) => entry.history.length > 0), [series])
  const times = useMemo(
    () => [...new Set(plotted.flatMap((entry) => entry.history.map((point) => point.time)))].sort((a, b) => a - b),
    [plotted],
  )

  const chart = useMemo(() => {
    if (times.length === 0 || width === 0) return null
    const plotWidth = Math.max(0, width - MARGIN.left - MARGIN.right)
    const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom
    const [x0, x1] = timeDomain([...times, now])
    const [lo, hi] = ratingDomain(plotted.flatMap((entry) => entry.history.map((point) => point.rating)))
    const x = (time: number) => MARGIN.left + ((time - x0) / (x1 - x0)) * plotWidth
    const y = (rating: number) => MARGIN.top + ((hi - rating) / (hi - lo)) * plotHeight
    const bands = RANKS.flatMap((rank, i) => {
      const from = Math.max(lo, rank.min ?? -Infinity)
      const to = Math.min(hi, RANKS[i + 1]?.min ?? Infinity)
      return to > from ? [{ rank, top: y(to), height: y(from) - y(to) }] : []
    })
    // A rating holds until the next contest, so both lines run on flat to today.
    const until = Math.max(now, times[times.length - 1])
    const paths = plotted.map((entry) => ratingPath(entry.history, until, x, y))
    const markers = plotted.map((entry) => ({
      r: markerSize(entry.history.length),
      points: entry.history.map((point) => ({ time: point.time, x: x(point.time), y: y(point.rating) })),
    }))
    // End labels: above the higher line and below the lower one, so neither sits on the other line.
    const lastY = plotted.map((entry) => y(entry.history[entry.history.length - 1].rating))
    const below = lastY.length === 2 ? (lastY[1] >= lastY[0] ? 1 : 0) : -1
    const ends = lastY.map((endY, i) => ({ x: x(until), y: i === below ? endY + 20 : endY - 10 }))
    return {
      plotWidth,
      plotHeight,
      x,
      y,
      bands,
      paths,
      markers,
      ends,
      xs: times.map(x),
      ratingTicks: ratingTicks(lo, hi, y),
      monthTicks: monthTicks(x0, x1, plotWidth),
    }
  }, [times, plotted, width, now])

  if (plotted.length === 0) {
    return <p className="py-8 text-center text-sm text-ink-muted">Neither has taken a rated contest yet.</p>
  }

  const last = times.length - 1
  const time = active === null ? null : times[active]
  const cursorX = chart && active !== null ? chart.xs[active] : 0
  const tooltipLeft = cursorX + 14 + TOOLTIP_WIDTH <= width ? cursorX + 14 : Math.max(0, cursorX - 14 - TOOLTIP_WIDTH)
  const readings = time === null ? [] : series.map((entry) => ({ entry, reading: readingAt(entry.history, time) }))

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
            {plotted.map((entry, i) =>
              chart.markers[i].r > 0 ? (
                <g key={entry.handle} fill={entry.color} strokeWidth={1.5} className="stroke-surface">
                  {chart.markers[i].points.map((point) =>
                    point.time === time ? null : (
                      <polygon key={point.time} points={diamond(point.x, point.y, chart.markers[i].r)} />
                    ),
                  )}
                </g>
              ) : null,
            )}
            {/* Only a player with a contest at the cursor gets a marker: it is a point on their line. */}
            {readings.map(({ entry, reading }) =>
              reading?.live ? (
                <polygon
                  key={entry.handle}
                  points={diamond(cursorX, chart.y(reading.rating), 6)}
                  fill={entry.color}
                  strokeWidth={2}
                  className="stroke-surface"
                />
              ) : null,
            )}
            {time === null
              ? plotted.map((entry, i) => (
                  <text
                    key={entry.handle}
                    x={chart.ends[i].x - 8}
                    y={chart.ends[i].y}
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
            : `${formatDate(time)}: ${readings
                .map(({ entry, reading }) =>
                  reading === null
                    ? `${entry.handle} unrated`
                    : reading.live
                      ? `${entry.handle} ${reading.rating} after a contest`
                      : `${entry.handle} ${reading.rating}, held since ${formatDate(reading.since)}`,
                )
                .join(', ')}`}
        </div>

        {time !== null ? (
          <div
            aria-hidden
            className="cut pointer-events-none absolute z-10 grid gap-1.5 px-3 py-2.5 [--cut:10px] [--cut-fill:var(--color-surface-3)] [--cut-line:var(--color-line-strong)]"
            style={{ left: tooltipLeft, top: MARGIN.top, width: TOOLTIP_WIDTH }}
          >
            <span className="text-xs text-ink-muted">{formatDate(time)}</span>
            {readings.map(({ entry, reading }) => (
              <span key={entry.handle} className="flex items-center gap-2">
                <Swatch series={entry} />
                <span className="grid min-w-0 flex-1">
                  <span className="truncate text-[13px] font-semibold">{entry.handle}</span>
                  {reading && !reading.live ? (
                    <span className="truncate text-xs text-ink-muted">Held since {formatDate(reading.since)}</span>
                  ) : null}
                </span>
                {reading === null ? (
                  <span className="text-[13px] text-ink-muted">Unrated</span>
                ) : (
                  <span
                    className="font-display text-lg leading-none"
                    style={{ color: reading.live ? rankFor(reading.rating).color : 'var(--color-ink-muted)' }}
                  >
                    {reading.rating}
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
