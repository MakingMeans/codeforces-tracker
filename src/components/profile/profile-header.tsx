import { ArrowUpRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { formatAgo, formatDelta, formatMonthYear, formatNumber } from '../../lib/codeforces/format'
import type { ProfileUser } from '../../lib/codeforces/user'
import { useNow } from '../../lib/use-now'
import { CompareForm } from '../compare/compare-form'
import { RankEmblem } from '../rank-emblem'
import { ButtonLink } from '../ui/button'
import { HandleName } from './handle-name'
import { ProfilePhoto } from './profile-photo'

function Meta({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid">
      <dt className="font-label text-xs font-semibold tracking-[0.16em] text-ink-muted uppercase">{label}</dt>
      <dd className="font-semibold tabular-nums">{children}</dd>
    </div>
  )
}

/** Photo, handle, where they are from, rank and rating, and a link to the Codeforces profile. */
export function ProfileHeader({ user }: { user: ProfileUser }) {
  const now = useNow(60_000)
  const { rank, maxRank } = user

  return (
    <section aria-label="Profile" className="ticks border-b border-line">
      <div className="mx-auto grid max-w-[1240px] grid-cols-[minmax(0,1fr)] items-center gap-6 px-4 py-7 sm:grid-cols-[auto_minmax(0,1fr)] sm:px-6 lg:grid-cols-[auto_minmax(0,1fr)_auto]">
        <ProfilePhoto
          sources={user.photos}
          handle={user.handle}
          color={rank.color}
          className="h-24 w-24 sm:h-[132px] sm:w-[132px]"
        />

        <div className="grid min-w-0 gap-1.5">
          <h1 className="font-display text-[clamp(38px,5vw,56px)] leading-none tracking-[0.01em] break-all">
            <HandleName handle={user.handle} rank={rank} />
          </h1>
          {user.organization || user.location ? (
            <p className="text-ink-muted">{[user.organization, user.location].filter(Boolean).join(' · ')}</p>
          ) : null}
          <dl className="mt-1.5 flex flex-wrap gap-x-6 gap-y-2">
            <Meta label="Contribution">{formatDelta(user.contribution)}</Meta>
            <Meta label="Friends of">{formatNumber(user.friendOfCount)}</Meta>
            <Meta label="Registered">{formatMonthYear(user.registeredAt)}</Meta>
            <Meta label="Last online">{formatAgo(Math.max(0, now - user.lastOnlineAt), user.lastOnlineAt)}</Meta>
          </dl>
        </div>

        <div className="flex items-center gap-4 sm:col-span-2 lg:col-span-1">
          <RankEmblem rank={rank} size={88} />
          <div className="grid gap-0.5">
            <span
              className="font-label text-[17px] leading-tight font-bold tracking-[0.12em] uppercase"
              style={{ color: rank.color }}
            >
              {rank.name}
            </span>
            {user.rating !== null ? (
              <>
                <span className="font-display text-[60px] leading-[0.95]">{user.rating}</span>
                <span className="text-sm text-ink-muted">
                  Max <b className="font-semibold text-ink tabular-nums">{user.maxRating}</b> ·{' '}
                  <span style={{ color: maxRank.color }}>{maxRank.name}</span>
                </span>
              </>
            ) : (
              <span className="max-w-[24ch] text-sm text-ink-muted">No rated contest yet, so no rating.</span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-start gap-3 sm:col-span-2 lg:col-span-3">
          <ButtonLink
            variant="primary"
            href={`https://codeforces.com/profile/${encodeURIComponent(user.handle)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open on Codeforces
            <ArrowUpRight aria-hidden />
          </ButtonLink>
          <CompareForm handle={user.handle} />
        </div>
      </div>
    </section>
  )
}
