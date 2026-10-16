import { ArrowUpRight, Clock, RotateCw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { isAbortError } from '../../lib/api/client'
import type { ApiContest } from '../../lib/api/types'
import { getContestList, upcomingContests } from '../../lib/codeforces/contest-list'
import { formatCountdown, formatDuration, formatStart } from '../../lib/codeforces/format'
import { describeLoadError, type LoadProblem } from '../../lib/errors'
import { useNow } from '../../lib/use-now'
import { Button } from '../ui/button'
import { Panel } from '../ui/panel'

type State =
  { status: 'loading' } | { status: 'ready'; contests: ApiContest[] } | { status: 'error'; problem: LoadProblem }

const SHOWN = 5

/** The next contests on Codeforces, with a live countdown. */
export function UpcomingContests() {
  const [state, setState] = useState<State>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const now = useNow(30_000)

  useEffect(() => {
    const controller = new AbortController()
    getContestList(controller.signal).then(
      (contests) => setState({ status: 'ready', contests }),
      (error: unknown) => {
        if (!isAbortError(error)) setState({ status: 'error', problem: describeLoadError(error) })
      },
    )
    return () => controller.abort()
  }, [attempt])

  const upcoming = state.status === 'ready' ? upcomingContests(state.contests, now).slice(0, SHOWN) : []

  return (
    <Panel
      title="Upcoming contests"
      aside={
        <a
          href="https://codeforces.com/contests"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 underline-offset-3 hover:text-ink hover:underline"
        >
          All on Codeforces
          <ArrowUpRight aria-hidden className="h-3.5 w-3.5" />
        </a>
      }
    >
      {state.status === 'loading' ? (
        <ul aria-busy="true" aria-label="Loading upcoming contests" className="grid gap-2">
          {Array.from({ length: 3 }, (_, i) => (
            <li key={i} className="h-[62px] animate-pulse bg-surface-2/60" />
          ))}
        </ul>
      ) : state.status === 'error' ? (
        <div className="grid justify-items-start gap-3 text-sm text-ink-muted">
          <p>
            <span className="font-semibold text-ink">{state.problem.title}.</span> {state.problem.detail}
          </p>
          <Button
            onClick={() => {
              setState({ status: 'loading' })
              setAttempt((value) => value + 1)
            }}
          >
            <RotateCw aria-hidden />
            Try again
          </Button>
        </div>
      ) : upcoming.length === 0 ? (
        <p className="text-sm text-ink-muted">No contests are scheduled right now.</p>
      ) : (
        <ol className="grid gap-2">
          {upcoming.map((contest) => {
            const start = (contest.startTimeSeconds ?? 0) * 1000
            return (
              <li
                key={contest.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 border-l-[3px] border-accent bg-surface-2 py-2.5 pr-3 pl-4"
              >
                <a
                  href={`https://codeforces.com/contests/${contest.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="line-clamp-2 font-semibold underline-offset-3 hover:underline"
                  title={contest.name}
                >
                  {contest.name}
                </a>
                <span className="text-right font-display text-lg leading-none tabular-nums">
                  {formatCountdown(start - now)}
                </span>
                <span className="flex flex-wrap items-center gap-x-3 text-[13px] text-ink-muted">
                  <time dateTime={new Date(start).toISOString()}>{formatStart(start)}</time>
                  {contest.durationSeconds ? (
                    <span className="inline-flex items-center gap-1">
                      <Clock aria-hidden className="h-3 w-3" />
                      {formatDuration(contest.durationSeconds)}
                    </span>
                  ) : null}
                </span>
              </li>
            )
          })}
        </ol>
      )}
    </Panel>
  )
}
