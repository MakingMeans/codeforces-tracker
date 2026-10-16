import { useState, type KeyboardEvent, type PointerEvent } from 'react'
import { cn } from '../../lib/cn'
import { formatNumber } from '../../lib/codeforces/format'
import type { DifficultyBucket } from '../../lib/codeforces/insights'
import { rankFor } from '../../lib/codeforces/ranks'
import { useElementWidth } from '../../lib/use-element-width'

const HEIGHT = 200
const TOP = 22
const BOTTOM = 26
const GAP = 3

/** A bar with its top-right corner cut, in the angular language of the rest of the page. */
function barPath(x: number, y: number, width: number, base: number) {
  const cut = Math.min(4, width / 3, base - y)
  return `M${x} ${base}V${y}H${x + width - cut}L${x + width} ${y + cut}V${base}Z`
}

/**
 * Solved problems per difficulty. Each bar wears the colour Codeforces gives
 * problems of that rating; the axis carries the value, so colour is never the
 * only cue. Arrow keys read each bar.
 */
export function DifficultyChart({ buckets }: { buckets: DifficultyBucket[] }) {
  const [ref, width] = useElementWidth<HTMLDivElement>()
  const [active, setActive] = useState<number | null>(null)

  if (buckets.length === 0) {
    return <p className="py-6 text-center text-sm text-ink-muted">No problem with a difficulty rating solved yet.</p>
  }

  const n = buckets.length
  const barWidth = Math.max(1, (width - GAP * (n - 1)) / n)
  const base = HEIGHT - BOTTOM
  const max = Math.max(...buckets.map((bucket) => bucket.count))
  const barTop = (count: number) => base - ((base - TOP) * count) / max
  const labelEvery = barWidth >= 30 ? 1 : barWidth >= 14 ? 2 : 4
  const showValues = barWidth >= 24
  const bucket = active === null ? null : buckets[active]

  function onPointerMove(event: PointerEvent<SVGSVGElement>) {
    const bounds = event.currentTarget.getBoundingClientRect()
    const index = Math.floor((event.clientX - bounds.left) / (barWidth + GAP))
    setActive(index >= 0 && index < n ? index : null)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const current = active ?? 0
    const next =
      event.key === 'ArrowLeft'
        ? current - 1
        : event.key === 'ArrowRight'
          ? current + 1
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? n - 1
              : null
    if (next === null) return
    event.preventDefault()
    setActive(Math.min(n - 1, Math.max(0, next)))
  }

  return (
    <div
      ref={ref}
      tabIndex={0}
      role="group"
      aria-label={`Solved problems by difficulty, from ${buckets[0].rating} to ${buckets[n - 1].rating}. Use the arrow keys to read each one.`}
      onKeyDown={onKeyDown}
      onFocus={() => setActive((value) => value ?? 0)}
      onBlur={() => setActive(null)}
      className="relative"
      style={{ height: HEIGHT }}
    >
      {width > 0 ? (
        <svg
          width={width}
          height={HEIGHT}
          aria-hidden
          className="block"
          onPointerMove={onPointerMove}
          onPointerLeave={() => setActive(null)}
        >
          <line x1={0} x2={width} y1={base} y2={base} className="stroke-ink/12" />
          {buckets.map((entry, i) => {
            const x = i * (barWidth + GAP)
            const y = barTop(entry.count)
            const labelled = showValues ? entry.count > 0 : entry.count === max
            return (
              <g key={entry.rating}>
                {entry.count > 0 ? (
                  <path
                    d={barPath(x, y, barWidth, base)}
                    fill={rankFor(entry.rating).color}
                    fillOpacity={active === null || active === i ? 0.9 : 0.45}
                  />
                ) : null}
                {labelled ? (
                  <text
                    x={x + barWidth / 2}
                    y={y - 6}
                    textAnchor="middle"
                    className={cn(
                      'font-label text-[11px] font-semibold tabular-nums',
                      entry.count === max ? 'fill-ink' : 'fill-ink-muted',
                    )}
                  >
                    {formatNumber(entry.count)}
                  </text>
                ) : null}
                {((entry.rating - buckets[0].rating) / 100) % labelEvery === 0 ? (
                  <text
                    x={x + barWidth / 2}
                    y={HEIGHT - 8}
                    textAnchor="middle"
                    className="fill-ink-muted font-label text-[11px] tabular-nums"
                  >
                    {entry.rating}
                  </text>
                ) : null}
              </g>
            )
          })}
        </svg>
      ) : null}

      <div aria-live="polite" className="sr-only">
        {bucket ? `Difficulty ${bucket.rating}: ${bucket.count} solved` : ''}
      </div>

      {bucket ? (
        <div
          aria-hidden
          className="cut pointer-events-none absolute top-0 z-10 grid px-3 py-1.5 [--cut:8px] [--cut-fill:var(--color-surface-3)] [--cut-line:var(--color-line-strong)]"
          style={{
            left: Math.min(Math.max(0, active! * (barWidth + GAP) + barWidth / 2 - 70), Math.max(0, width - 140)),
            width: 140,
          }}
        >
          <span
            className="font-label text-[13px] font-bold tracking-[0.08em] uppercase"
            style={{ color: rankFor(bucket.rating).color }}
          >
            Difficulty {bucket.rating}
          </span>
          <span className="text-sm">{formatNumber(bucket.count)} solved</span>
        </div>
      ) : null}
    </div>
  )
}
