import { ArrowUpRight, Clock, Hourglass, Minus, TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react'
import { memo } from 'react'
import { cn } from '../../lib/cn'
import { contestKind } from '../../lib/codeforces/contest-kind'
import type { ContestEntry, ContestOutcome } from '../../lib/codeforces/contests'
import { formatDate, formatDelta, formatDuration, formatNumber } from '../../lib/codeforces/format'
import { rankFor, UNRATED } from '../../lib/codeforces/ranks'
import { RankEmblem } from '../rank-emblem'
import { ContestPattern } from './contest-pattern'
import { ProblemChips } from './problem-chips'

/** A result is said three ways: tint and bar, the signed delta, and this label with its icon. */
const RESULT: Record<ContestOutcome, { label: string; icon: LucideIcon; tone: string }> = {
  gain: { label: 'Rated', icon: TrendingUp, tone: 'text-win' },
  loss: { label: 'Rated', icon: TrendingDown, tone: 'text-loss' },
  even: { label: 'Rated', icon: Minus, tone: 'text-ink-muted' },
  unrated: { label: 'Unrated', icon: Minus, tone: 'text-ink-muted' },
  pending: { label: 'Pending', icon: Hourglass, tone: 'text-ink-muted' },
}

/** Gyms live under /gym/, everything else under /contest/. */
const contestUrl = (id: number) => `https://codeforces.com/${id >= 100_000 ? 'gym' : 'contest'}/${id}`

function ResultTag({ outcome, className }: { outcome: ContestOutcome; className?: string }) {
  const { label, icon: Icon, tone } = RESULT[outcome]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-label text-xs font-bold tracking-[0.16em] uppercase',
        tone,
        className,
      )}
    >
      <Icon aria-hidden className="h-3.5 w-3.5" />
      {label}
    </span>
  )
}

function Ratings({ contest }: { contest: ContestEntry }) {
  if (contest.before === 0 && (contest.outcome === 'unrated' || contest.outcome === 'pending')) {
    return <span className="text-ink-muted">Unrated</span>
  }
  return (
    <span>
      <span style={{ color: rankFor(contest.before).color }}>{contest.before}</span>
      <span className="text-ink-muted"> → </span>
      {contest.outcome === 'pending' ? (
        <span className="text-ink-muted" title="The rating change has not been applied yet">
          ?
        </span>
      ) : (
        <span style={{ color: rankFor(contest.after).color }}>{contest.after}</span>
      )}
    </span>
  )
}

/** One contest, Valorant match-history style. */
export const ContestRow = memo(function ContestRow({ contest }: { contest: ContestEntry }) {
  const url = contestUrl(contest.id)
  const duration = formatDuration(contest.duration)
  // The rank held going into the contest, not the one it led to.
  const rank = contest.before > 0 ? rankFor(contest.before) : UNRATED
  const delta = contest.outcome === 'pending' ? '—' : formatDelta(contest.after - contest.before)
  const failed =
    contest.failed === 0 ? 'No failed attempts' : `${contest.failed} failed attempt${contest.failed === 1 ? '' : 's'}`

  return (
    <li className={cn('contest-row', contest.outcome === 'gain' && 'is-gain', contest.outcome === 'loss' && 'is-loss')}>
      <ContestPattern kind={contestKind(contest.name)} />

      <div className="cr-date text-sm leading-snug">
        <time dateTime={new Date(contest.start).toISOString()} className="font-semibold">
          {formatDate(contest.start)}
        </time>
        {duration ? (
          <>
            <span aria-hidden className="cr-date-sep text-ink-muted">
              ·
            </span>
            <span className="flex items-center gap-1 text-[13px] text-ink-muted">
              <Clock aria-hidden className="cr-clock h-3 w-3" />
              <span className="sr-only">Duration</span>
              {duration}
            </span>
          </>
        ) : null}
      </div>

      <div className="cr-emblem">
        <RankEmblem rank={rank} size={44} label={`${rank.name} going in`} />
      </div>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        title={contest.name}
        className="cr-name line-clamp-3 justify-self-start font-semibold underline-offset-3 hover:underline @min-[641px]:line-clamp-1"
      >
        {contest.name}
      </a>

      <div className="cr-detail flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[13px] text-ink-muted tabular-nums">
        <ProblemChips problems={contest.problems} />
        <span>{failed}</span>
        {contest.place ? <span>Place #{formatNumber(contest.place)}</span> : null}
        <span className="cr-tag-compact">
          <ResultTag outcome={contest.outcome} />
        </span>
      </div>

      <div className="cr-ratings grid justify-items-end text-[15px] font-semibold tabular-nums">
        <Ratings contest={contest} />
        <span className="cr-ratings-label font-label text-[11px] font-semibold tracking-[0.16em] text-ink-muted uppercase">
          Rating
        </span>
      </div>

      <div className="cr-delta grid justify-items-end">
        <span className={cn('font-display text-[30px] leading-none', RESULT[contest.outcome].tone)}>
          <span className="sr-only">Rating change </span>
          {delta}
        </span>
        <ResultTag outcome={contest.outcome} className="cr-tag" />
      </div>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={-1}
        aria-hidden
        className="cr-link grid h-7 place-items-center text-ink-muted hover:text-ink"
      >
        <ArrowUpRight className="h-4 w-4" />
      </a>
    </li>
  )
})
