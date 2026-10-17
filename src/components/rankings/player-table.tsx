import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { divisionFor, rankFor } from '../../lib/codeforces/ranks'
import { linkHandler, routeHref } from '../../lib/route'
import { RankEmblem } from '../rank-emblem'

export interface PlayerRow {
  key: string
  /** Place in the list; null leaves the cell empty. */
  position: number | null
  handle: string
  rating: number | null
  maxRating: number | null
  /** Competed in a rated contest this month. */
  active?: boolean
  /** One cell per extra column. */
  extra?: ReactNode[]
  /** The player the visitor came from, marked in the list (and found by `tr[data-focus]`). */
  highlight?: boolean
}

interface PlayerTableProps {
  caption: string
  /** Headers of the extra columns, hidden on phones. */
  extraColumns?: string[]
  rows: PlayerRow[]
  /** Rows after this index come after a "…" gap (a far-down player shown out of order). */
  gapAfter?: number
}

const cell = 'bg-surface-2 px-3 py-2'
const extraCell = 'hidden sm:table-cell'

/** Players in order: place, emblem and handle, rating and best rating, and any extra columns. */
export function PlayerTable({ caption, extraColumns = [], rows, gapAfter }: PlayerTableProps) {
  return (
    <div className="min-w-0">
      {/* Fixed layout: the player column takes what the numbers leave, and long handles are cut, not overflowing. */}
      <table className="w-full table-fixed border-separate border-spacing-x-0 border-spacing-y-1.5 text-[17px]">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="font-label text-[12px] font-semibold tracking-[0.14em] text-ink-muted uppercase">
            <th scope="col" className="w-16 px-3 py-1 text-right">
              #
            </th>
            <th scope="col" className="px-3 py-1 text-left">
              Player
            </th>
            <th scope="col" className="w-24 px-3 py-1 text-right">
              Rating
            </th>
            <th scope="col" className={cn('w-24 px-3 py-1 text-right', extraCell)}>
              Max
            </th>
            {extraColumns.map((column) => (
              <th key={column} scope="col" className={cn('px-3 py-1 text-left', extraCell)}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const rank = rankFor(row.rating)
            const columns = 4 + extraColumns.length
            return [
              gapAfter !== undefined && i === gapAfter + 1 ? (
                <tr key="gap" aria-hidden>
                  <td colSpan={columns} className="py-1 text-center tracking-[0.4em] text-ink-muted">
                    ···
                  </td>
                </tr>
              ) : null,
              <tr
                key={row.key}
                data-focus={row.highlight ? '' : undefined}
                className={cn(
                  row.highlight &&
                    '[&>td]:bg-[#1f3a36] [&>td]:shadow-[inset_0_1px_0_var(--color-win),inset_0_-1px_0_var(--color-win)] [&>td:first-child]:shadow-[inset_4px_0_0_var(--color-win),inset_0_1px_0_var(--color-win),inset_0_-1px_0_var(--color-win)]',
                )}
              >
                <td className={cn(cell, 'text-right font-display text-2xl leading-none tabular-nums')}>
                  {row.position ?? ''}
                </td>
                <td className={cell}>
                  <span className="flex min-w-0 items-center gap-3">
                    <RankEmblem
                      rank={rank}
                      division={divisionFor(row.rating)}
                      size={84}
                      className="h-16 w-16 sm:h-[84px] sm:w-[84px]"
                    />
                    <a
                      href={routeHref({ handle: row.handle })}
                      onClick={linkHandler({ handle: row.handle })}
                      className="min-w-0 truncate text-lg font-semibold underline-offset-3 hover:underline"
                      style={{ color: rank.color }}
                    >
                      {row.handle}
                    </a>
                    {row.active ? (
                      <span title="Competed in a rated contest this month" className="h-2 w-2 shrink-0 bg-win">
                        <span className="sr-only">, competed this month</span>
                      </span>
                    ) : null}
                    {row.highlight ? <span className="sr-only">, the profile you came from</span> : null}
                  </span>
                </td>
                <td className={cn(cell, 'text-right text-lg font-semibold tabular-nums')} style={{ color: rank.color }}>
                  {row.rating ?? <span className="text-ink-muted">Unrated</span>}
                </td>
                <td className={cn(cell, extraCell, 'text-right text-ink-muted tabular-nums')}>
                  {row.maxRating ?? '—'}
                </td>
                {(row.extra ?? []).map((content, column) => (
                  <td key={column} className={cn(cell, extraCell)}>
                    <span className="block max-w-[18rem] truncate">
                      {content ?? <span className="text-ink-muted">—</span>}
                    </span>
                  </td>
                ))}
              </tr>,
            ]
          })}
        </tbody>
      </table>
    </div>
  )
}
