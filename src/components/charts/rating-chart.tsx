import { useMemo, useState, type KeyboardEvent, type PointerEvent } from 'react'
import {
  diamond,
  markerSize,
  monthTicks,
  nearestIndex,
  ratingDomain,
  ratingTicks,
  timeDomain,
} from '../../lib/charts/rating-scale'
import { cn } from '../../lib/cn'
import { formatDate, formatDelta, formatNumber } from '../../lib/codeforces/format'
import { rankFor, RANKS } from '../../lib/codeforces/ranks'
import type { RatingPoint } from '../../lib/codeforces/user'
import { useElementWidth } from '../../lib/use-element-width'

const HEIGHT = 260
const MARGIN = { top: 16, right: 18, bottom: 30, left: 46 }
const TOOLTIP_WIDTH = 248

/**
 * Rating over time on the rank bands. The cursor snaps to the nearest contest;
 * arrow keys, Home and End walk through them. Every value is also in the match
 * history, so the tooltip is never the only way to read one.
 */
export function RatingChart({ history }: { history: RatingPoint[] }) {
  const [ref, width] = useElementWidth<HTMLDivElement>()
  const [active, setActive] = useState<number | null>(null)

  const chart = useMemo(() => {
    if (history.length === 0 || width === 0) return null
    const plotWidth = Math.max(0, width - MARGIN.left - MARGIN.right)
    const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom
    const [x0, x1] = timeDomain(history.map((point) => point.time))
    const [lo, hi] = ratingDomain(history.map((point) => point.rating))
    const x = (time: number) => MARGIN.left + ((time - x0) / (x1 - x0)) * plotWidth
    const y = (rating: number) => MARGIN.top + ((hi - rating) / (hi - lo)) * plotHeight

    const bands = RANKS.flatMap((rank, i) => {
      const from = Math.max(lo, rank.min ?? -Infinity)
      const to = Math.min(hi, RANKS[i + 1]?.min ?? Infinity)
      return to > from ? [{ rank, top: y(to), height: y(from) - y(to) }] : []
    })
    const xs = history.map((point) => x(point.time))
    const ys = history.map((point) => y(point.rating))
    const path = xs.map((px, i) => `${i ? 'L' : 'M'}${px.toFixed(1)} ${ys[i].toFixed(1)}`).join('')

    return {
      plotWidth,
      plotHeight,
      bands,
      xs,
      ys,
      path,
      x,
      y,
      ratingTicks: ratingTicks(lo, hi, y),
      monthTicks: monthTicks(x0, x1, plotWidth),
    }
  }, [history, width])

  if (history.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-ink-muted">No rated contests yet, so there is no rating to chart.</p>
    )
  }

  const last = history.length - 1
  const point = active === null ? null : history[active]
  const r = markerSize(history.length)

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

  const pointX = chart && active !== null ? chart.xs[active] : 0
  const tooltipLeft = pointX + 14 + TOOLTIP_WIDTH <= width ? pointX + 14 : Math.max(0, pointX - 14 - TOOLTIP_WIDTH)
  const pointRank = point ? rankFor(point.rating) : null

  return (
    <div
      ref={ref}
      tabIndex={0}
      role="group"
      aria-label={`Rating history across ${history.length} rated contests. Use the arrow keys to read each one.`}
      onKeyDown={onKeyDown}
      onFocus={() => setActive((value) => value ?? last)}
      onBlur={() => setActive(null)}
      className="relative touch-pan-y select-none"
      style={{ height: HEIGHT }}
    >
      {chart ? (
        <svg width={width} height={HEIGHT} className="block" aria-hidden>
          {chart.bands.map(({ rank, top, height }) => (
            <g key={rank.name}>
              <rect
                x={MARGIN.left}
                y={top}
                width={chart.plotWidth}
                height={height}
                fill={rank.color}
                fillOpacity={0.11}
              />
              {height >= 16 ? (
                <text
                  x={MARGIN.left + 8}
                  y={top + 13}
                  className="fill-ink-muted font-label text-[11px] font-semibold tracking-[0.12em] uppercase"
                >
                  {rank.name}
                </text>
              ) : null}
            </g>
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

          {point ? (
            <line
              x1={pointX}
              x2={pointX}
              y1={MARGIN.top}
              y2={MARGIN.top + chart.plotHeight}
              strokeDasharray="3 3"
              className="stroke-ink/35"
            />
          ) : null}

          <path d={chart.path} fill="none" strokeWidth={2} strokeLinejoin="round" className="stroke-ink" />

          {r > 0
            ? history.map((entry, i) =>
                i === active ? null : (
                  <polygon
                    key={entry.contestId}
                    points={diamond(chart.xs[i], chart.ys[i], r)}
                    strokeWidth={1.5}
                    className="fill-ink stroke-surface"
                  />
                ),
              )
            : null}
          {point && pointRank && active !== null ? (
            <polygon
              points={diamond(pointX, chart.ys[active], 6)}
              fill={pointRank.color}
              strokeWidth={2}
              className="stroke-surface"
            />
          ) : null}

          {/* Only the latest value is labelled; the tooltip and the match history carry the rest. */}
          <text
            x={chart.xs[last] - 8}
            y={chart.ys[last] - 12}
            textAnchor="end"
            className={cn(
              'fill-ink stroke-surface font-display text-lg transition-opacity [paint-order:stroke] [stroke-width:4px]',
              point && 'opacity-0',
            )}
          >
            {history[last].rating}
          </text>

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
        {point
          ? `${point.contestName}: ${point.rating} (${formatDelta(point.delta)}), ${formatDate(point.time)}, place ${formatNumber(point.place)}`
          : ''}
      </div>

      {point && pointRank ? (
        <div
          aria-hidden
          className="cut pointer-events-none absolute z-10 grid gap-0.5 px-3 py-2.5 [--cut:10px] [--cut-fill:var(--color-surface-3)] [--cut-line:var(--color-line-strong)]"
          style={{ left: tooltipLeft, top: MARGIN.top, width: TOOLTIP_WIDTH }}
        >
          <p className="flex items-baseline gap-2">
            <span className="font-display text-2xl leading-none">{point.rating}</span>
            <span
              className={cn(
                'font-label text-[15px] font-bold tabular-nums',
                point.delta > 0 ? 'text-win' : point.delta < 0 ? 'text-loss' : 'text-ink-muted',
              )}
            >
              {formatDelta(point.delta)}
            </span>
          </p>
          <p
            className="font-label text-[13px] leading-tight font-bold tracking-[0.08em] uppercase"
            style={{ color: pointRank.color }}
          >
            {pointRank.name}
          </p>
          <p className="line-clamp-2 text-[13px]">{point.contestName}</p>
          <p className="text-xs text-ink-muted tabular-nums">
            {formatDate(point.time)} · Place #{formatNumber(point.place)}
          </p>
        </div>
      ) : null}
    </div>
  )
}
