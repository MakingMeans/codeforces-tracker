import { cn } from '../../lib/cn'
import { rowWinner, type StatRow } from '../../lib/codeforces/compare'
import { formatDelta, formatNumber } from '../../lib/codeforces/format'

const show = (row: StatRow, value: number | null) => {
  if (value === null) return '—'
  if (row.format === 'place') return `#${formatNumber(value)}`
  if (row.format === 'signed') return formatDelta(value)
  return formatNumber(value)
}

/** How far each bar reaches: share of the larger value (or, for places, of the smaller). */
function reach(row: StatRow, value: number | null) {
  if (value === null || row.a === null || row.b === null) return 0
  const values = [Math.abs(row.a), Math.abs(row.b)]
  if (row.better === 'lower') return Math.min(...values) / Math.max(Math.abs(value), 1)
  return Math.abs(value) / Math.max(...values, 1)
}

/** One line per stat: each side's value and a bar leaning towards the better one. */
export function StatRows({ rows, colors }: { rows: StatRow[]; colors: [string, string] }) {
  return (
    <dl className="grid gap-3">
      {rows.map((row) => {
        const winner = rowWinner(row)
        return (
          <div
            key={row.label}
            className="grid grid-cols-[minmax(0,1fr)_minmax(7rem,auto)_minmax(0,1fr)] items-center gap-3"
          >
            <dd className="grid gap-1 justify-items-end">
              <span
                className={cn(
                  'font-display text-xl leading-none tabular-nums',
                  winner === 'a' ? 'text-ink' : 'text-ink-muted',
                )}
              >
                {winner === 'a' ? <span className="sr-only">Ahead: </span> : null}
                {show(row, row.a)}
              </span>
              <span aria-hidden className="flex h-1.5 w-full justify-end bg-surface-2">
                <span
                  className="block h-full"
                  style={{ width: `${reach(row, row.a) * 100}%`, backgroundColor: colors[0] }}
                />
              </span>
            </dd>
            <dt className="text-center font-label text-[13px] font-semibold tracking-[0.12em] text-ink-muted uppercase">
              {row.label}
            </dt>
            <dd className="grid gap-1 justify-items-start">
              <span
                className={cn(
                  'font-display text-xl leading-none tabular-nums',
                  winner === 'b' ? 'text-ink' : 'text-ink-muted',
                )}
              >
                {winner === 'b' ? <span className="sr-only">Ahead: </span> : null}
                {show(row, row.b)}
              </span>
              <span aria-hidden className="flex h-1.5 w-full bg-surface-2">
                <span
                  className="block h-full"
                  style={{ width: `${reach(row, row.b) * 100}%`, backgroundColor: colors[1] }}
                />
              </span>
            </dd>
          </div>
        )
      })}
    </dl>
  )
}
