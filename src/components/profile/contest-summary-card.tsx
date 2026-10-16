import type { ReactNode } from 'react'
import { formatDelta, formatNumber, plural } from '../../lib/codeforces/format'
import { contestSummary } from '../../lib/codeforces/insights'
import type { ContestEntry } from '../../lib/codeforces/contests'
import { Panel } from '../ui/panel'

function Stat({ label, children, tone }: { label: string; children: ReactNode; tone?: 'win' | 'loss' }) {
  return (
    <div className="flex flex-col-reverse">
      <dt className="text-[13px] text-ink-muted">{label}</dt>
      <dd
        className={`font-display text-[26px] leading-tight ${tone === 'win' ? 'text-win' : tone === 'loss' ? 'text-loss' : ''}`}
      >
        {children}
      </dd>
    </div>
  )
}

/** Totals over the whole match history. */
export function ContestSummaryCard({ contests }: { contests: ContestEntry[] }) {
  const summary = contestSummary(contests)
  return (
    <Panel title="Contests" aside={`${plural(summary.total, 'entered', 'entered')}`}>
      {summary.total === 0 ? (
        <p className="text-sm text-ink-muted">No contest entered live yet.</p>
      ) : (
        <dl className="grid grid-cols-2 gap-x-3 gap-y-3.5">
          <Stat label="Rated">{formatNumber(summary.rated)}</Stat>
          <Stat label={summary.pending ? `Unrated · ${summary.pending} pending` : 'Unrated'}>
            {formatNumber(summary.unrated + summary.pending)}
          </Stat>
          <Stat label="Best place">{summary.bestPlace ? `#${formatNumber(summary.bestPlace)}` : '—'}</Stat>
          <Stat label="Biggest gain" tone={summary.bestGain ? 'win' : undefined}>
            {summary.bestGain ? formatDelta(summary.bestGain) : '—'}
          </Stat>
          <Stat label="Biggest loss" tone={summary.worstLoss ? 'loss' : undefined}>
            {summary.worstLoss ? formatDelta(summary.worstLoss) : '—'}
          </Stat>
        </dl>
      )}
    </Panel>
  )
}
