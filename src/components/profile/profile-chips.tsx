import { useMemo } from 'react'
import { useRankings } from '../../lib/rankings/load'
import { scopeRoute } from '../../lib/rankings/rankings'
import { linkHandler, routeHref } from '../../lib/route'

/**
 * Under the profile's name: the player's place in their country, city and
 * organization from the daily rankings, each a link to that ranking with the
 * player marked. Nothing shows for a player missing from the rankings.
 */
export function ProfileChips({ handle }: { handle: string }) {
  const { state } = useRankings()
  const standing = useMemo(() => (state.status === 'ready' ? state.rankings.standing(handle) : []), [state, handle])
  if (standing.length === 0) return null

  return (
    <ul aria-label="Rankings" className="mt-2 flex flex-wrap gap-2">
      {standing.map((place) => {
        const route = { ...scopeRoute(place.scope), focus: handle }
        return (
          <li key={place.scope.kind}>
            <a
              href={routeHref(route)}
              onClick={linkHandler(route)}
              title={`#${place.position} of ${place.total} in today’s ${place.name} ranking`}
              className="cut inline-flex items-center gap-2 px-3 py-1.5 text-sm [--cut:7px] [--cut-fill:var(--color-surface)] [--cut-line:var(--color-line-strong)] hover:[--cut-fill:var(--color-surface-2)] hover:[--cut-line:var(--color-ink)]"
            >
              <span className="font-display text-base leading-none">#{place.position}</span>
              <span className="sr-only"> of {place.total} in</span>
              <span className="max-w-[16rem] truncate">{place.name}</span>
            </a>
          </li>
        )
      })}
    </ul>
  )
}
