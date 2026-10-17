import { Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Footer } from './components/layout/footer'
import { NavRail, TabBar } from './components/layout/nav-rail'
import { TopBar } from './components/layout/top-bar'
import { SearchBox } from './components/search/search-box'
import { InvalidHandle } from './components/states/invalid-handle'
import { StateMessage } from './components/states/state-message'
import { useGroups } from './lib/groups'
import { cleanHandle, handleProblem } from './lib/handle'
import { scopeFromRoute, scopeName } from './lib/rankings/rankings'
import { sectionOf, useRoute } from './lib/route'
import { site } from './lib/site'
import { Compare } from './pages/compare'
import { GroupPage } from './pages/group'
import { GroupsHome } from './pages/groups'
import { Home } from './pages/home'
import { Profile } from './pages/profile'
import { RankingPage } from './pages/ranking'
import { RankingsHome } from './pages/rankings'

export default function App() {
  const { route } = useRoute()
  const handle = route.handle ? cleanHandle(route.handle) : null
  const vs = route.handle && route.vs ? cleanHandle(route.vs) : null
  const problem = route.handle ? handleProblem(route.handle) : null
  const vsProblem = route.handle && route.vs ? handleProblem(route.vs) : null
  const sameTwice = handle && vs ? handle.toLowerCase() === vs.toLowerCase() : false
  const [fetchedAt, setFetchedAt] = useState<number | null>(null)
  const groups = useGroups()
  const section = sectionOf(route)
  const { country, city, org } = route
  const scope = useMemo(() => scopeFromRoute({ country, city, org }), [country, city, org])
  const groupName = route.group ? (groups.find((group) => group.id === route.group)?.name ?? route.name) : null

  useEffect(() => {
    const title = route.group
      ? (groupName ?? 'Group')
      : route.groups
        ? 'Groups'
        : scope
          ? `${scopeName(scope)} ranking`
          : route.rankings
            ? 'Rankings'
            : handle && !problem
              ? vs && !vsProblem
                ? `${handle} vs ${vs}`
                : handle
              : null
    document.title = title ? `${title} · ${site.name}` : site.name
  }, [route.group, route.groups, route.rankings, groupName, scope, handle, vs, problem, vsProblem])

  function players() {
    if (!route.handle || !handle) return <Home />
    if (problem) {
      const other = route.vs
      return (
        <InvalidHandle
          handle={route.handle}
          problem={problem}
          to={other ? (fixed) => ({ handle: fixed, vs: other }) : undefined}
          exclude={vs ?? undefined}
        />
      )
    }
    if (route.vs && vsProblem) {
      return (
        <InvalidHandle handle={route.vs} problem={vsProblem} to={(fixed) => ({ handle, vs: fixed })} exclude={handle} />
      )
    }
    if (vs && sameTwice) {
      return (
        <StateMessage
          icon={Users}
          title="Pick two different players"
          actions={
            <SearchBox
              variant="fix"
              to={(fixed) => ({ handle, vs: fixed })}
              exclude={handle}
              label={`Compare ${handle} with`}
            />
          }
        >
          <p>Comparing {handle} with themselves would be a tie on every line. Who should they face?</p>
        </StateMessage>
      )
    }
    if (vs) return <Compare a={handle} b={vs} onFetched={setFetchedAt} />
    return <Profile handle={handle} onFetched={setFetchedAt} />
  }

  function page() {
    if (route.group) return <GroupPage id={route.group} sharedName={route.name} sharedMembers={route.members} />
    if (route.groups) return <GroupsHome />
    if (scope) return <RankingPage scope={scope} focus={route.focus} />
    if (route.rankings) return <RankingsHome />
    return players()
  }

  const home = section === 'players' && !route.handle
  const onProfile = section === 'players' && Boolean(route.handle) && !problem

  return (
    <div className="flex min-h-svh flex-col">
      <a
        href="#main"
        className="sr-only z-50 bg-accent px-4 py-2 font-label font-bold tracking-[0.14em] text-on-accent uppercase focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      <TopBar>{home ? null : <SearchBox variant="compact" />}</TopBar>
      <div className="flex flex-1">
        <NavRail active={section} />
        {/* On phones the tab bar covers the bottom edge, so the page leaves room for it. */}
        <div className="flex min-w-0 flex-1 flex-col pb-[calc(64px+env(safe-area-inset-bottom))] md:pb-0">
          <main id="main" className="flex-1">
            {page()}
          </main>
          <Footer fetchedAt={onProfile ? (fetchedAt ?? undefined) : undefined} />
        </div>
      </div>
      <TabBar active={section} />
    </div>
  )
}
