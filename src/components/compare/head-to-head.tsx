import { useState } from 'react'
import { cn } from '../../lib/cn'
import type { SharedContest } from '../../lib/codeforces/compare'
import type { ContestEntry } from '../../lib/codeforces/contests'
import { formatDate, formatDelta, formatNumber } from '../../lib/codeforces/format'
import { Button } from '../ui/button'

const PAGE = 20
const ROW =
  'grid grid-cols-[minmax(0,1fr)_4.5rem_4.5rem] items-center gap-3 sm:grid-cols-[6.5rem_minmax(0,1fr)_5rem_5rem]'

function Result({ contest, ahead }: { contest: ContestEntry; ahead: boolean }) {
  if (!contest.place) {
    return <span className="text-sm text-ink-muted">{contest.outcome === 'pending' ? 'Pending' : 'Unrated'}</span>
  }
  const delta = contest.after - contest.before
  return (
    <span className="grid">
      <span className={cn('font-display text-lg leading-none tabular-nums', ahead ? 'text-ink' : 'text-ink-muted')}>
        #{formatNumber(contest.place)}
      </span>
      <span className={cn('text-xs tabular-nums', delta > 0 ? 'text-win' : delta < 0 ? 'text-loss' : 'text-ink-muted')}>
        {formatDelta(delta)}
      </span>
    </span>
  )
}

interface HeadToHeadProps {
  shared: SharedContest[]
  handles: [string, string]
  colors: [string, string]
}

/** Contests both entered, with each one's place and change; the better place is highlighted. */
export function HeadToHead({ shared, handles, colors }: HeadToHeadProps) {
  const [shown, setShown] = useState(PAGE)
  if (shared.length === 0) {
    return <p className="py-6 text-center text-sm text-ink-muted">They have not entered the same contest yet.</p>
  }
  return (
    <div className="grid gap-3">
      <div
        aria-hidden
        className={`${ROW} px-3.5 font-label text-xs font-semibold tracking-[0.14em] text-ink-muted uppercase`}
      >
        <span className="hidden sm:block">Date</span>
        <span>Contest</span>
        {handles.map((handle, i) => (
          <span key={i} className="grid min-w-0 justify-items-end gap-1">
            <span className="h-1 w-6" style={{ backgroundColor: colors[i] }} />
            <span className="max-w-full truncate">{handle}</span>
          </span>
        ))}
      </div>
      <ol className="grid gap-1.5">
        {shared.slice(0, shown).map((contest) => (
          <li key={contest.id} className={`${ROW} border-l-[3px] border-line-strong bg-surface-2 py-2 pr-3 pl-3.5`}>
            <span className="hidden text-[13px] text-ink-muted tabular-nums sm:block">{formatDate(contest.start)}</span>
            <a
              href={`https://codeforces.com/contest/${contest.id}`}
              target="_blank"
              rel="noopener noreferrer"
              title={contest.name}
              className="line-clamp-2 text-sm font-semibold underline-offset-3 hover:underline"
            >
              {contest.name}
            </a>
            {(['a', 'b'] as const).map((side, i) => (
              <span key={side} className="text-right">
                <span className="sr-only">
                  {handles[i]}
                  {contest.ahead === side ? ', ahead' : ''}:{' '}
                </span>
                <Result contest={contest[side]} ahead={contest.ahead === side} />
              </span>
            ))}
          </li>
        ))}
      </ol>
      {shown < shared.length ? (
        <Button className="justify-self-center" onClick={() => setShown((value) => value + PAGE)}>
          Load {Math.min(PAGE, shared.length - shown)} more
        </Button>
      ) : null}
    </div>
  )
}
