import { ChevronDown } from 'lucide-react'
import { useId, useMemo, useState, type ReactNode } from 'react'
import { isRated, type ContestEntry } from '../../lib/codeforces/contests'
import { formatNumber, plural } from '../../lib/codeforces/format'
import { Button } from '../ui/button'
import { Panel } from '../ui/panel'
import { ContestRow } from './contest-row'

type Kind = 'all' | 'rated' | 'unrated'
/** Rows render in pages, so long histories stay quick. */
const PAGE = 30

/** The year a contest started, in the visitor's time zone. */
const yearOf = (contest: ContestEntry) => new Date(contest.start).getFullYear()
const ofKind = (contest: ContestEntry, kind: Kind) => kind === 'all' || isRated(contest) === (kind === 'rated')

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  children: ReactNode
}) {
  const id = useId()
  return (
    <div className="cut relative inline-flex items-center [--cut:8px] [--cut-fill:var(--color-surface-2)] [--cut-line:var(--color-line-strong)]">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="cursor-pointer appearance-none bg-transparent py-2 pr-9 pl-3.5 font-label text-sm font-bold tracking-[0.12em] text-ink uppercase [&_option]:bg-surface-2"
      >
        {children}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute right-3 h-3.5 w-3.5 text-ink-muted" />
    </div>
  )
}

/**
 * Every contest entered live, most recent first, filtered by Rated / Unrated and
 * by year. Each filter's counts follow the other one.
 */
export function MatchHistory({ contests }: { contests: ContestEntry[] }) {
  const [kind, setKind] = useState<Kind>('all')
  const [year, setYear] = useState<number | 'all'>('all')
  const [shown, setShown] = useState(PAGE)

  const years = useMemo(() => [...new Set(contests.map(yearOf))].sort((a, b) => b - a), [contests])
  // A year picked on another profile may not exist on this one.
  const activeYear = year !== 'all' && years.includes(year) ? year : 'all'
  const inYear = useMemo(
    () => (activeYear === 'all' ? contests : contests.filter((contest) => yearOf(contest) === activeYear)),
    [contests, activeYear],
  )
  const kindCounts = useMemo(() => {
    const rated = inYear.filter(isRated).length
    return { all: inYear.length, rated, unrated: inYear.length - rated }
  }, [inYear])
  const yearCounts = useMemo(() => {
    const counts = new Map<number, number>()
    let all = 0
    for (const contest of contests) {
      if (!ofKind(contest, kind)) continue
      counts.set(yearOf(contest), (counts.get(yearOf(contest)) ?? 0) + 1)
      all++
    }
    return { all, counts }
  }, [contests, kind])
  const visible = useMemo(() => inYear.filter((contest) => ofKind(contest, kind)), [inYear, kind])
  const rows = visible.slice(0, shown)

  return (
    <Panel title="Match history" className="match-history">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect
            label="Show contests"
            value={kind}
            onChange={(value) => {
              setKind(value as Kind)
              setShown(PAGE)
            }}
          >
            <option value="all">All contests ({formatNumber(kindCounts.all)})</option>
            <option value="rated">Rated ({formatNumber(kindCounts.rated)})</option>
            <option value="unrated">Unrated ({formatNumber(kindCounts.unrated)})</option>
          </FilterSelect>
          {years.length > 1 ? (
            <FilterSelect
              label="Year"
              value={String(activeYear)}
              onChange={(value) => {
                setYear(value === 'all' ? 'all' : Number(value))
                setShown(PAGE)
              }}
            >
              <option value="all">All years ({formatNumber(yearCounts.all)})</option>
              {years.map((value) => (
                <option key={value} value={value}>
                  {value} ({formatNumber(yearCounts.counts.get(value) ?? 0)})
                </option>
              ))}
            </FilterSelect>
          ) : null}
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
            : `No ${kind} contests ${activeYear === 'all' ? 'yet' : `in ${activeYear}`}.`}
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
