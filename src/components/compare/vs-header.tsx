import { ArrowLeftRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import type { ProfileUser } from '../../lib/codeforces/user'
import { linkHandler, routeHref } from '../../lib/route'
import { HandleName } from '../profile/handle-name'
import { ProfilePhoto } from '../profile/profile-photo'
import { RankEmblem } from '../rank-emblem'
import { ButtonLink } from '../ui/button'

function Side({ user, color, align }: { user: ProfileUser; color: string; align: 'start' | 'end' }) {
  return (
    <div className={cn('flex min-w-0 items-center gap-4', align === 'end' && 'md:flex-row-reverse md:text-right')}>
      <ProfilePhoto
        sources={user.photos}
        handle={user.handle}
        color={user.rank.color}
        className="h-20 w-20 sm:h-24 sm:w-24"
      />
      <div className="grid min-w-0 gap-1">
        <span
          aria-hidden
          className={cn('h-1 w-10', align === 'end' && 'md:justify-self-end')}
          style={{ backgroundColor: color }}
        />
        <a
          href={routeHref({ handle: user.handle })}
          onClick={linkHandler({ handle: user.handle })}
          className="font-display text-[clamp(30px,4vw,44px)] leading-none break-all hover:underline"
        >
          <HandleName handle={user.handle} rank={user.rank} />
        </a>
        <div className={cn('flex items-center gap-2', align === 'end' && 'md:flex-row-reverse')}>
          <RankEmblem rank={user.rank} size={44} />
          <div className="grid">
            <span
              className="font-label text-[13px] font-bold tracking-[0.1em] uppercase"
              style={{ color: user.rank.color }}
            >
              {user.rank.name}
            </span>
            <span className="font-display text-[28px] leading-none">{user.rating ?? '—'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Placeholder({ children }: { children: ReactNode }) {
  return <div className="grid min-h-24 content-center text-ink-muted">{children}</div>
}

interface VsHeaderProps {
  a: ProfileUser | null
  b: ProfileUser | null
  colors: [string, string]
  /** Shown in place of a side that has not loaded. */
  aFallback: ReactNode
  bFallback: ReactNode
  handles: [string, string]
}

/** Both players facing each other, with a swap button. */
export function VsHeader({ a, b, colors, aFallback, bFallback, handles }: VsHeaderProps) {
  return (
    <section aria-label="Comparison" className="ticks border-b border-line">
      <h1 className="sr-only">
        {handles[0]} vs {handles[1]}
      </h1>
      <div className="mx-auto grid max-w-[1240px] grid-cols-[minmax(0,1fr)] items-center gap-5 px-4 py-7 sm:px-6 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        {a ? <Side user={a} color={colors[0]} align="start" /> : <Placeholder>{aFallback}</Placeholder>}
        <div className="grid justify-items-center gap-2">
          <span className="font-display text-[56px] leading-none text-accent">VS</span>
          <ButtonLink
            variant="ghost"
            href={routeHref({ handle: handles[1], vs: handles[0] })}
            onClick={linkHandler({ handle: handles[1], vs: handles[0] })}
            className="px-3 py-1.5 text-[13px]"
          >
            <ArrowLeftRight aria-hidden />
            Swap
          </ButtonLink>
        </div>
        {b ? <Side user={b} color={colors[1]} align="end" /> : <Placeholder>{bFallback}</Placeholder>}
      </div>
    </section>
  )
}
