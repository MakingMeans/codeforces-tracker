import { RotateCw } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { CompareChart, type Series } from '../components/compare/compare-chart'
import { HeadToHead } from '../components/compare/head-to-head'
import { StatRows } from '../components/compare/stat-rows'
import { VsHeader } from '../components/compare/vs-header'
import { Button } from '../components/ui/button'
import { Panel } from '../components/ui/panel'
import { ScanLoader } from '../components/ui/scan-loader'
import { compareStats, headToHead } from '../lib/codeforces/compare'
import { plural } from '../lib/codeforces/format'
import type { Profile } from '../lib/codeforces/profile'
import { useProfile, type ProfileState } from '../lib/use-profile'

/** Series colours: the first two language slots (--color-lang-1 and -2), validated as a colour-blind-safe pair. */
const COLORS: [string, string] = ['#3987e5', '#d95926']

/** A side's profile once everything has arrived, kept stable between renders. */
function useComplete({ user, details, fetchedAt }: ProfileState): Profile | null {
  return useMemo(() => (user && details && fetchedAt ? { user, details, fetchedAt } : null), [user, details, fetchedAt])
}

function SideStatus({ state, handle, onRetry }: { state: ProfileState; handle: string; onRetry: () => void }) {
  if (state.problem) {
    return (
      <div className="grid justify-items-start gap-2 text-sm">
        <p>
          <span className="font-semibold text-ink">
            {state.problem.kind === 'not-found' ? `No account called “${handle}”` : state.problem.title}.
          </span>{' '}
          {state.problem.kind === 'not-found' ? null : state.problem.detail}
        </p>
        {state.problem.retry ? (
          <Button onClick={onRetry} className="px-3 py-1.5 text-[13px]">
            <RotateCw aria-hidden />
            Try again
          </Button>
        ) : null}
      </div>
    )
  }
  return <ScanLoader label={`Fetching ${handle}…`} />
}

interface CompareProps {
  a: string
  b: string
  onFetched: (time: number | null) => void
}

/** Two players side by side: ratings over time, stats, and the contests both entered. */
export function Compare({ a, b, onFetched }: CompareProps) {
  const left = useProfile(a, 'handle')
  const right = useProfile(b, 'vs')
  const profileA = useComplete(left.state)
  const profileB = useComplete(right.state)

  useEffect(() => {
    onFetched(profileA && profileB ? Math.min(profileA.fetchedAt, profileB.fetchedAt) : null)
  }, [profileA, profileB, onFetched])

  const handleA = left.state.user?.handle ?? a
  const handleB = right.state.user?.handle ?? b
  const handles: [string, string] = [handleA, handleB]
  const historyA = profileA?.details.ratingHistory
  const historyB = profileB?.details.ratingHistory
  const series = useMemo<Series[]>(
    () => [
      { handle: handleA, color: COLORS[0], dashed: false, history: historyA ?? [] },
      { handle: handleB, color: COLORS[1], dashed: true, history: historyB ?? [] },
    ],
    [handleA, handleB, historyA, historyB],
  )
  const both = profileA && profileB
  const duel = useMemo(
    () => (both ? headToHead(profileA.details.contests, profileB.details.contests) : null),
    [both, profileA, profileB],
  )

  return (
    <>
      <VsHeader
        a={left.state.user}
        b={right.state.user}
        colors={COLORS}
        handles={handles}
        aFallback={<SideStatus state={left.state} handle={a} onRetry={left.retry} />}
        bFallback={<SideStatus state={right.state} handle={b} onRetry={right.retry} />}
      />
      <div className="mx-auto grid max-w-[1240px] grid-cols-[minmax(0,1fr)] gap-4 px-4 py-6 sm:px-6">
        {both && duel ? (
          <>
            <Panel title="Rating">
              <CompareChart series={series} />
            </Panel>
            <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
              <Panel title="Stats">
                <StatRows rows={compareStats(profileA, profileB)} colors={COLORS} />
              </Panel>
              <Panel
                title="Head to head"
                aside={
                  duel.shared.length
                    ? `${plural(duel.shared.length, 'shared contest')} · ${handleA} ahead ${duel.aAhead} · ${handleB} ahead ${duel.bAhead}`
                    : undefined
                }
              >
                <HeadToHead shared={duel.shared} handles={handles} colors={COLORS} />
              </Panel>
            </div>
          </>
        ) : left.state.problem || right.state.problem ? (
          <p className="py-10 text-center text-ink-muted">Both players are needed to compare them.</p>
        ) : (
          <div aria-busy="true" className="grid gap-4">
            <ScanLoader label="Loading both histories…" />
            <div className="h-72 animate-pulse bg-surface-2/70" />
          </div>
        )}
      </div>
    </>
  )
}
