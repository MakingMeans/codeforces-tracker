import { useState } from 'react'
import { RankingsStatus } from '../components/rankings/rankings-status'
import { ScopedSearch } from '../components/search/scoped-search'
import { Button } from '../components/ui/button'
import { Panel } from '../components/ui/panel'
import { formatDate, formatNumber, plural } from '../lib/codeforces/format'
import { rankFor } from '../lib/codeforces/ranks'
import { useRankings } from '../lib/rankings/load'
import type { RankingsIndex } from '../lib/rankings/rankings'
import { linkHandler, routeHref } from '../lib/route'

const PAGE = 30

function Countries({ rankings }: { rankings: RankingsIndex }) {
  const [shown, setShown] = useState(PAGE)
  const countries = rankings.countries()

  return (
    <Panel
      title="Countries"
      aside={`${plural(countries.length, 'country', 'countries')} · updated ${formatDate(rankings.data.generatedAt)}`}
    >
      <table className="w-full table-fixed border-separate border-spacing-x-0 border-spacing-y-1 text-[15px]">
        <caption className="sr-only">Countries by number of rated players</caption>
        <thead>
          <tr className="font-label text-[11px] font-semibold tracking-[0.14em] text-ink-muted uppercase">
            <th scope="col" className="w-14 px-3 py-1 text-right">
              #
            </th>
            <th scope="col" className="px-3 py-1 text-left">
              Country
            </th>
            <th scope="col" className="w-24 px-3 py-1 text-right">
              Players
            </th>
            <th scope="col" className="hidden w-24 px-3 py-1 text-right sm:table-cell">
              Average
            </th>
            <th scope="col" className="hidden w-24 px-3 py-1 text-right sm:table-cell">
              Best
            </th>
          </tr>
        </thead>
        <tbody>
          {countries.slice(0, shown).map((country, i) => (
            <tr key={country.country}>
              <td className="bg-surface-2 px-3 py-2.5 text-right font-display text-lg leading-none tabular-nums">
                {i + 1}
              </td>
              <td className="bg-surface-2 px-3 py-2.5">
                <a
                  href={routeHref({ country: country.country })}
                  onClick={linkHandler({ country: country.country })}
                  className="font-semibold underline-offset-3 hover:underline"
                >
                  {country.country}
                </a>
              </td>
              <td className="bg-surface-2 px-3 py-2.5 text-right tabular-nums">{formatNumber(country.players)}</td>
              <td
                className="hidden bg-surface-2 px-3 py-2.5 text-right tabular-nums sm:table-cell"
                style={{ color: rankFor(country.average).color }}
              >
                {country.average}
              </td>
              <td
                className="hidden bg-surface-2 px-3 py-2.5 text-right tabular-nums sm:table-cell"
                style={{ color: rankFor(country.best).color }}
              >
                {country.best}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {shown < countries.length ? (
        <Button className="justify-self-center" onClick={() => setShown(countries.length)}>
          Show all {countries.length}
        </Button>
      ) : null}
    </Panel>
  )
}

/** Find a country, city or organization, or browse the countries. */
export function RankingsHome() {
  const { state, retry } = useRankings()

  return (
    <>
      <section aria-labelledby="rankings-title" className="ticks border-b border-line">
        <div className="mx-auto grid max-w-[1240px] grid-cols-[minmax(0,1fr)] gap-6 px-4 py-10 sm:px-6 sm:py-14">
          <div className="grid gap-3">
            <p className="font-label text-[13px] font-semibold tracking-[0.18em] text-ink-muted uppercase">
              Codeforces rankings
            </p>
            <h1 id="rankings-title" className="font-display text-[clamp(40px,7vw,72px)] leading-none uppercase">
              Rankings
            </h1>
            <p className="max-w-[62ch] text-lg text-ink-muted">
              Every rated player who was on Codeforces in the last month, by country, city or organization. Updated once
              a day.
            </p>
          </div>
          <ScopedSearch scopes={['country', 'city', 'org']} />
        </div>
      </section>
      <div className="mx-auto grid max-w-[1240px] grid-cols-[minmax(0,1fr)] gap-4 px-4 py-8 sm:px-6">
        {state.status === 'ready' ? (
          <Countries rankings={state.rankings} />
        ) : (
          <RankingsStatus state={state} onRetry={retry} />
        )}
      </div>
    </>
  )
}
