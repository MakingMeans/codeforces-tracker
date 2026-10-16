import { RotateCw } from 'lucide-react'
import { useEffect } from 'react'
import { ContestSummaryCard } from '../components/profile/contest-summary-card'
import { ProfileHeader } from '../components/profile/profile-header'
import { RatingCard } from '../components/profile/rating-card'
import { LoadError } from '../components/states/load-error'
import { Button } from '../components/ui/button'
import { Panel } from '../components/ui/panel'
import { ScanLoader } from '../components/ui/scan-loader'
import { plural } from '../lib/codeforces/format'
import type { ProfileDetails } from '../lib/codeforces/profile'
import type { ProfileUser } from '../lib/codeforces/user'
import type { LoadProblem } from '../lib/errors'
import { useProfile } from '../lib/use-profile'

const BODY =
  'mx-auto grid max-w-[1240px] grid-cols-[minmax(0,1fr)] gap-4 px-4 py-6 sm:px-6 lg:grid-cols-[20rem_minmax(0,1fr)]'

function Skeleton({ className }: { className: string }) {
  return <div aria-hidden className={`animate-pulse bg-surface-2/70 ${className}`} />
}

/** Before the header arrives: the shape of the page, and what is happening. */
function ProfileSkeleton({ handle }: { handle: string }) {
  return (
    <div aria-busy="true">
      <div className="ticks border-b border-line">
        <div className="mx-auto grid max-w-[1240px] gap-5 px-4 py-7 sm:px-6">
          <ScanLoader label={`Fetching ${handle} from Codeforces…`} />
          <div className="flex items-center gap-6">
            <Skeleton className="h-24 w-24 shrink-0 sm:h-[132px] sm:w-[132px]" />
            <div className="grid flex-1 gap-3">
              <Skeleton className="h-12 w-[min(320px,80%)]" />
              <Skeleton className="h-4 w-[min(240px,60%)]" />
              <Skeleton className="h-8 w-[min(420px,90%)]" />
            </div>
          </div>
        </div>
      </div>
      <div className={BODY}>
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  )
}

function DetailsError({ problem, onRetry }: { problem: LoadProblem; onRetry: () => void }) {
  return (
    <Panel title="Could not load the details">
      <div className="grid justify-items-start gap-3 text-sm text-ink-muted">
        <p>
          <span className="font-semibold text-ink">{problem.title}.</span> {problem.detail}
        </p>
        {problem.retry ? (
          <Button variant="primary" onClick={onRetry}>
            <RotateCw aria-hidden />
            Try again
          </Button>
        ) : null}
      </div>
    </Panel>
  )
}

function ProfileBody({ user, details }: { user: ProfileUser; details: ProfileDetails }) {
  return (
    <>
      <aside className="grid min-w-0 content-start gap-4">
        <RatingCard user={user} />
        <ContestSummaryCard contests={details.contests} />
      </aside>
      <div className="grid min-w-0 content-start gap-4">
        <Panel title="Rating" aside={plural(details.ratingHistory.length, 'rated contest')}>
          <p className="text-sm text-ink-muted">The rating chart is the next piece being built.</p>
        </Panel>
      </div>
    </>
  )
}

interface ProfileProps {
  handle: string
  /** Reports when the data shown was read, for the footer. */
  onFetched: (time: number | null) => void
}

export function Profile({ handle, onFetched }: ProfileProps) {
  const { state, retry } = useProfile(handle)
  const { user, details, problem, previous } = state

  useEffect(() => {
    onFetched(state.fetchedAt)
  }, [state.fetchedAt, onFetched])

  if (!user) {
    if (problem) return <LoadError problem={problem} handle={handle} onRetry={retry} />
    if (!previous) return <ProfileSkeleton handle={handle} />
    // The last profile stays on screen, dimmed, until the new header arrives.
    return (
      <div aria-busy="true" className="relative">
        <div className="absolute inset-x-0 top-0 z-10 px-4 pt-3 sm:px-6">
          <div className="mx-auto max-w-[1240px]">
            <ScanLoader label={`Fetching ${handle} from Codeforces…`} />
          </div>
        </div>
        <div inert className="pointer-events-none opacity-40 transition-opacity">
          <ProfileHeader user={previous.user} />
          <div className={BODY}>
            <ProfileBody user={previous.user} details={previous.details} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <ProfileHeader user={user} />
      <div className={BODY}>
        {details ? (
          <ProfileBody user={user} details={details} />
        ) : (
          <>
            <aside className="grid min-w-0 content-start gap-4">
              <RatingCard user={user} />
            </aside>
            <div className="grid min-w-0 content-start gap-4">
              {problem ? (
                <DetailsError problem={problem} onRetry={retry} />
              ) : (
                <div aria-busy="true" className="grid gap-4">
                  <ScanLoader label="Loading rating history, submissions and contests…" />
                  <Skeleton className="h-72" />
                  <Skeleton className="h-56" />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}
