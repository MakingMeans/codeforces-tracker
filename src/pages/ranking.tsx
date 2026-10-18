import { MapPinOff } from 'lucide-react'
import { startTransition, useEffect, useMemo, useState, type ReactNode } from 'react'
import { PlayerTable, type PlayerRow } from '../components/rankings/player-table'
import { AverageRankEmblem, AverageRankLabel } from '../components/rankings/average-rank'
import { RankingsStatus } from '../components/rankings/rankings-status'
import { StatTiles } from '../components/rankings/stat-tiles'
import { StateMessage } from '../components/states/state-message'
import { Button, ButtonLink } from '../components/ui/button'
import { formatDate, plural } from '../lib/codeforces/format'
import { averageRankFor, rankFor } from '../lib/codeforces/ranks'
import { useRankings } from '../lib/rankings/load'
import { scopeName, scopeRoute, type RankingsIndex, type Scope } from '../lib/rankings/rankings'
import { linkHandler, routeHref, type Route } from '../lib/route'

const PAGE = 50
const KIND: Record<Scope['kind'], string> = { country: 'Country', city: 'City', org: 'Organization' }

function Crumb({ route, children }: { route: Partial<Route>; children: ReactNode }) {
  return (
    <a href={routeHref(route)} onClick={linkHandler(route)} className="underline underline-offset-3 hover:text-ink">
      {children}
    </a>
  )
}

function PlaceLink({ route, children }: { route: Partial<Route>; children: string }) {
  return (
    <a href={routeHref(route)} onClick={linkHandler(route)} className="underline-offset-3 hover:underline">
      {children}
    </a>
  )
}

function Ranking({ rankings, scope, focus }: { rankings: RankingsIndex; scope: Scope; focus: string | null }) {
  const [activeOnly, setActiveOnly] = useState(false)
  const [shown, setShown] = useState(PAGE)
  const { data } = rankings

  const everyone = useMemo(() => rankings.ranking(scope), [rankings, scope])
  const listed = useMemo(
    () => (activeOnly ? rankings.ranking(scope, true) : everyone),
    [rankings, scope, activeOnly, everyone],
  )

  // The player the visitor came from is scrolled to once, on arrival.
  useEffect(() => {
    document.querySelector('tr[data-focus]')?.scrollIntoView({ block: 'center' })
  }, [])

  if (!everyone || !listed) {
    return (
      <StateMessage
        icon={MapPinOff}
        title="No ranking here"
        actions={
          <ButtonLink href={routeHref({ rankings: true })} onClick={linkHandler({ rankings: true })}>
            All rankings
          </ButtonLink>
        }
      >
        <p>
          No rated player who was on Codeforces in the last month lists{' '}
          <span className="font-semibold text-ink">“{scopeName(scope)}”</span> as their {KIND[scope.kind].toLowerCase()}
          .
        </p>
      </StateMessage>
    )
  }

  const found = everyone.scope
  const all = rankings.stats(everyone.rows)
  const current = rankings.stats(listed.rows)
  const wanted = focus?.toLowerCase()
  const focusAt = wanted ? listed.rows.findIndex(({ row }) => data.handles[row].toLowerCase() === wanted) : -1
  const visible = listed.rows.slice(0, shown)
  // A far-down player stays in view: the first rows, a gap, then the rows around them.
  const around = focusAt >= shown ? listed.rows.slice(focusAt - 2, focusAt + 3) : []

  const toRow = ({ row, position }: { row: number; position: number }): PlayerRow => {
    const country = data.country[row] >= 0 ? data.countries[data.country[row]] : null
    const city = data.city[row] >= 0 ? data.cities[data.city[row]].name : null
    const org = data.org[row] >= 0 ? data.orgs[data.org[row]] : null
    const cells = {
      country: country ? <PlaceLink route={{ country }}>{country}</PlaceLink> : null,
      city: country && city ? <PlaceLink route={{ country, city }}>{city}</PlaceLink> : null,
      org: org ? <PlaceLink route={{ org }}>{org}</PlaceLink> : null,
    }
    const highlight = data.handles[row].toLowerCase() === wanted
    return {
      key: data.handles[row],
      position,
      handle: data.handles[row],
      rating: data.rating[row],
      maxRating: data.maxRating[row],
      active: data.active[row] === 1,
      extra:
        found.kind === 'country'
          ? [cells.city, cells.org]
          : found.kind === 'city'
            ? [cells.org]
            : [cells.country, cells.city],
      highlight,
    }
  }

  return (
    <>
      <section aria-labelledby="ranking-title" className="ticks border-b border-line">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-6 px-4 py-8 sm:px-6">
          <div className="flex min-w-0 items-center gap-5">
            <AverageRankEmblem average={current.average} />
            <div className="grid min-w-0 gap-2">
              <p className="flex flex-wrap gap-x-2 text-sm text-ink-muted">
                <Crumb route={{ rankings: true }}>Rankings</Crumb>
                <span aria-hidden>›</span>
                {found.kind === 'city' ? (
                  <>
                    <Crumb route={{ country: found.country }}>{found.country}</Crumb>
                    <span aria-hidden>›</span>
                  </>
                ) : null}
                <span>{KIND[found.kind]}</span>
              </p>
              <h1
                id="ranking-title"
                className="font-display text-[clamp(34px,5.5vw,56px)] leading-none break-words uppercase"
              >
                {scopeName(found)}
              </h1>
              <AverageRankLabel average={current.average} />
            </div>
          </div>
          <StatTiles
            items={[
              { label: 'Players', value: all.players },
              { label: 'Competed this month', value: all.active },
              { label: 'Average', value: current.average ?? '—', color: averageRankFor(current.average).color },
              {
                label: 'Team rating · top 3',
                value: current.teamTopThree ?? '—',
                color: rankFor(current.teamTopThree).color,
              },
            ]}
          />
        </div>
      </section>

      <div className="mx-auto grid max-w-[1240px] grid-cols-[minmax(0,1fr)] gap-4 px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={activeOnly}
            onClick={() =>
              startTransition(() => {
                setActiveOnly((value) => !value)
                setShown(PAGE)
              })
            }
            className="inline-flex cursor-pointer items-center gap-2.5 font-label text-[13px] font-bold tracking-[0.12em] text-ink-muted uppercase hover:text-ink"
          >
            <span
              aria-hidden
              className={`relative h-5 w-9 transition-colors ${activeOnly ? 'bg-win' : 'bg-surface-3'}`}
            >
              <span
                className={`absolute top-[3px] h-3.5 w-3.5 bg-bg transition-[left] ${activeOnly ? 'left-[19px]' : 'left-[3px]'}`}
              />
            </span>
            Competed this month only
          </button>
          <p className="text-sm text-ink-muted tabular-nums">
            {plural(listed.rows.length, 'player')} · updated {formatDate(data.generatedAt)}
          </p>
        </div>

        {listed.rows.length === 0 ? (
          <p className="py-8 text-center text-ink-muted">Nobody here competed in a rated contest this month.</p>
        ) : (
          <PlayerTable
            caption={`${scopeName(found)} ranking`}
            extraColumns={
              found.kind === 'country'
                ? ['City', 'Organization']
                : found.kind === 'city'
                  ? ['Organization']
                  : ['Country', 'City']
            }
            rows={[...visible, ...around].map(toRow)}
            gapAfter={around.length ? visible.length - 1 : undefined}
          />
        )}
        {shown < listed.rows.length ? (
          <Button className="justify-self-center" onClick={() => setShown((value) => value + PAGE)}>
            Show {Math.min(PAGE, listed.rows.length - shown)} more
          </Button>
        ) : null}
        <p className="text-sm text-ink-muted">
          <span aria-hidden className="mr-1.5 inline-block h-[7px] w-[7px] bg-win align-middle" />
          competed in a rated contest this month. Places come from Codeforces’ list of rated users, read every three
          hours with the latest contests’ rating changes; players who left the {KIND[found.kind].toLowerCase()} empty
          are not here.
        </p>
      </div>
    </>
  )
}

/** A country's, city's or organization's players, best first. */
export function RankingPage({ scope, focus }: { scope: Scope; focus: string | null }) {
  const { state, retry } = useRankings()
  if (state.status !== 'ready') {
    return (
      <div className="mx-auto grid max-w-[1240px] px-4 py-8 sm:px-6">
        <RankingsStatus state={state} onRetry={retry} />
      </div>
    )
  }
  return <Ranking key={JSON.stringify(scopeRoute(scope))} rankings={state.rankings} scope={scope} focus={focus} />
}
