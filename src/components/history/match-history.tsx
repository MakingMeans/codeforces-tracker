import { ChevronDown } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import { isRated, type ContestEntry } from '../../lib/codeforces/contests'
import { formatNumber, plural } from '../../lib/codeforces/format'
import { Button } from '../ui/button'
import { Panel } from '../ui/panel'
import { ContestRow } from './contest-row'

type Filter = 'all' | 'rated' | 'unrated'
/** Rows render in pages, so long histories stay quick. */
const PAGE = 30

/** Every contest entered live, most recent first, with a Rated / Unrated filter. */
export function MatchHistory({ contests }: { contests: ContestEntry[] }) {
  const [filter, setFilter] = useState<Filter>('all')
  const [shown, setShown] = useState(PAGE)
  const selectId = useId()

  const counts = useMemo(() => {
    const rated = contests.filter(isRated).length
    return { all: contests.length, rated, unrated: contests.length - rated }
  }, [contests])
  const visible = useMemo(
    () => (filter === 'all' ? contests : contests.filter((contest) => isRated(contest) === (filter === 'rated'))),
    [contests, filter],
  )
  const rows = visible.slice(0, shown)

  return (
    <Panel title="Match history" className="match-history">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="cut relative inline-flex items-center [--cut:8px] [--cut-fill:var(--color-surface-2)] [--cut-line:var(--color-line-strong)]">
          <label htmlFor={selectId} className="sr-only">
            Show contests
          </label>
          <select
            id={selectId}
            value={filter}
            onChange={(event) => {
              setFilter(event.target.value as Filter)
              setShown(PAGE)
            }}
            className="cursor-pointer appearance-none bg-transparent py-2 pr-9 pl-3.5 font-label text-sm font-bold tracking-[0.12em] text-ink uppercase [&_option]:bg-surface-2"
          >
            <option value="all">All contests ({formatNumber(counts.all)})</option>
            <option value="rated">Rated ({formatNumber(counts.rated)})</option>
            <option value="unrated">Unrated ({formatNumber(counts.unrated)})</option>
          </select>
          <ChevronDown aria-hidden className="pointer-events-none absolute right-3 h-3.5 w-3.5 text-ink-muted" />
        </div>
        <p className="text-sm text-ink-muted tabular-nums" aria-live="polite">
          {visible.length === 0
            ? 'No contests'
            : rows.length < visible.length
              ? `Showing ${formatNumber(rows.length)} of ${formatNumber(visible.length)}`
              : plural(visible.length, 'contest')}
        </p>
      </div>

      {visible.length === 0 ? (
        <p className="py-8 text-center text-sm text-ink-muted">
          {contests.length === 0
            ? 'No contest entered live yet. Practice and virtual runs do not count.'
            : `No ${filter} contests yet.`}
        </p>
      ) : (
        <>
          <ol className="grid gap-1.5">
            {rows.map((contest) => (
              <ContestRow key={contest.id} contest={contest} />
            ))}
          </ol>
          {rows.length < visible.length ? (
            <Button className="justify-self-center" onClick={() => setShown((value) => value + PAGE)}>
              Load {Math.min(PAGE, visible.length - rows.length)} more
            </Button>
          ) : null}
        </>
      )}
    </Panel>
  )
}
