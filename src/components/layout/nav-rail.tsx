import { ArrowLeftRight, Search, Trophy, Users, type LucideIcon } from 'lucide-react'
import { cn } from '../../lib/cn'
import { linkHandler, routeHref, type Route, type Section } from '../../lib/route'

interface NavProps {
  active: Section
  /** The profile on screen, if any: Compare starts from it. */
  handle?: string | null
}

const sections = (
  handle?: string | null,
): { id: Section; label: string; icon: LucideIcon; route: Partial<Route> }[] => [
  { id: 'players', label: 'Players', icon: Search, route: {} },
  { id: 'compare', label: 'Compare', icon: ArrowLeftRight, route: { compare: true, handle: handle ?? null } },
  { id: 'rankings', label: 'Rankings', icon: Trophy, route: { rankings: true } },
  { id: 'groups', label: 'Groups', icon: Users, route: { groups: true } },
]

/** Desktop: a narrow rail on the left, each section an icon with a short label. */
export function NavRail({ active, handle }: NavProps) {
  return (
    <nav aria-label="Sections" className="sticky top-0 hidden h-svh w-[76px] shrink-0 border-r border-line md:block">
      <ul className="grid gap-1 pt-4">
        {sections(handle).map(({ id, label, icon: Icon, route }) => (
          <li key={id}>
            <a
              href={routeHref(route)}
              onClick={linkHandler(route)}
              aria-current={id === active ? 'page' : undefined}
              className={cn(
                'relative grid justify-items-center gap-1.5 py-3 text-ink-muted transition-colors hover:bg-surface hover:text-ink',
                id === active && 'text-ink',
              )}
            >
              {id === active ? <span aria-hidden className="absolute inset-y-2 left-0 w-[3px] bg-accent" /> : null}
              <Icon aria-hidden className="h-5 w-5" />
              <span className="font-label text-[11px] font-bold tracking-[0.12em] uppercase">{label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/** Phones: the same sections as tabs along the bottom edge. */
export function TabBar({ active, handle }: NavProps) {
  return (
    <nav
      aria-label="Sections"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid grid-cols-4">
        {sections(handle).map(({ id, label, icon: Icon, route }) => (
          <li key={id}>
            <a
              href={routeHref(route)}
              onClick={linkHandler(route)}
              aria-current={id === active ? 'page' : undefined}
              className={cn(
                'relative grid justify-items-center gap-1 pt-2.5 pb-2 text-ink-muted',
                id === active && 'text-ink',
              )}
            >
              {id === active ? <span aria-hidden className="absolute inset-x-5 top-0 h-[3px] bg-accent" /> : null}
              <Icon aria-hidden className="h-5 w-5" />
              <span className="font-label text-[11px] font-bold tracking-[0.12em] uppercase">{label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
