import { ChevronsDown, ChevronsUp } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { divisionFor, rankChange, rankFor } from '../../lib/codeforces/ranks'
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
  /** Rating a week ago, when the player has changed rank since: an arrow up or down after the handle. */
  weekAgo?: number | null
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

// Phones get narrower place and rating columns and a smaller emblem, so the handle keeps the room.
const fill = 'bg-surface-2 py-2'
const cell = `${fill} px-2 sm:px-3`
const extraCell = 'hidden sm:table-cell'

/** Up or down a rank since a week ago, or nothing. */
function moveOf(row: PlayerRow) {
  const change = rankChange(row.weekAgo, row.rating)
  return change && { up: change === 'up', was: rankFor(row.weekAgo) }
}

/** Players in order: place, emblem and handle, rating and best rating, and any extra columns. */
export function PlayerTable({ caption, extraColumns = [], rows, gapAfter }: PlayerTableProps) {
  return (
    <div className="min-w-0">
      {/* Fixed layout: the player column takes what the numbers leave, and long handles are cut, not overflowing. */}
      <table className="w-full table-fixed border-separate border-spacing-x-0 border-spacing-y-1.5 text-[17px]">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="font-label text-[12px] font-semibold tracking-[0.14em] text-ink-muted uppercase">
            <th scope="col" className="w-11 px-1.5 py-1 text-right sm:w-16 sm:px-3">
              #
            </th>
            <th scope="col" className="px-2 py-1 text-left sm:px-3">
              Player
            </th>
            <th scope="col" className="w-[4.5rem] px-2 py-1 text-right sm:w-24 sm:px-3">
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
            const move = moveOf(row)
            const columns = 4 + extraColumns.length
            const MoveIcon = move?.up ? ChevronsUp : ChevronsDown
            const moveText = move ? `${move.up ? 'up' : 'down'} from ${move.was.name} this week` : ''
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
                <td
                  className={cn(
                    fill,
                    'px-1.5 text-right font-display text-xl leading-none tabular-nums sm:px-3 sm:text-2xl',
                  )}
                >
                  {row.position ?? ''}
                </td>
                <td className={cell}>
                  <span className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                    <RankEmblem
                      rank={rank}
                      division={divisionFor(row.rating)}
                      size={84}
                      className="h-14 w-14 shrink-0 sm:h-[84px] sm:w-[84px]"
                    />
                    <a
                      href={routeHref({ handle: row.handle })}
                      onClick={linkHandler({ handle: row.handle })}
                      className="min-w-0 truncate text-base font-semibold underline-offset-3 hover:underline sm:text-lg"
                      style={{ color: rank.color }}
                    >
                      {row.handle}
                    </a>
                    {move ? (
                      <span
                        title={`Changed rank: ${moveText}`}
                        className={cn('shrink-0', move.up ? 'text-win' : 'text-loss')}
                      >
                        <MoveIcon aria-hidden className="h-4 w-4" />
                        <span className="sr-only">, {moveText}</span>
                      </span>
                    ) : null}
                    {row.active ? (
                      <span title="Competed in a rated contest this month" className="h-2 w-2 shrink-0 bg-win">
                        <span className="sr-only">, competed this month</span>
                      </span>
                    ) : null}
                    {row.highlight ? <span className="sr-only">, the profile you came from</span> : null}
                  </span>
                </td>
                <td
                  className={cn(cell, 'text-right text-base font-semibold tabular-nums sm:text-lg')}
                  style={{ color: rank.color }}
                >
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
