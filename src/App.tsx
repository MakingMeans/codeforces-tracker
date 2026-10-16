import { Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Footer } from './components/layout/footer'
import { TopBar } from './components/layout/top-bar'
import { SearchBox } from './components/search/search-box'
import { InvalidHandle } from './components/states/invalid-handle'
import { StateMessage } from './components/states/state-message'
import { cleanHandle, handleProblem } from './lib/handle'
import { useRoute } from './lib/route'
import { site } from './lib/site'
import { Compare } from './pages/compare'
import { Home } from './pages/home'
import { Profile } from './pages/profile'

export default function App() {
  const { route } = useRoute()
  const handle = route.handle ? cleanHandle(route.handle) : null
  const vs = route.handle && route.vs ? cleanHandle(route.vs) : null
  const problem = route.handle ? handleProblem(route.handle) : null
  const vsProblem = route.handle && route.vs ? handleProblem(route.vs) : null
  const sameTwice = handle && vs ? handle.toLowerCase() === vs.toLowerCase() : false
  const [fetchedAt, setFetchedAt] = useState<number | null>(null)

  useEffect(() => {
    document.title =
      handle && !problem
        ? vs && !vsProblem
          ? `${handle} vs ${vs} · ${site.name}`
          : `${handle} · ${site.name}`
        : site.name
  }, [handle, vs, problem, vsProblem])

  function page() {
    if (!route.handle || !handle) return <Home />
    if (problem) return <InvalidHandle handle={route.handle} problem={problem} />
    if (route.vs && vsProblem) return <InvalidHandle handle={route.vs} problem={vsProblem} />
    if (vs && sameTwice) {
      return (
        <StateMessage icon={Users} title="Pick two different players">
          <p>Comparing {handle} with themselves would be a tie on every line.</p>
        </StateMessage>
      )
    }
    if (vs) return <Compare a={handle} b={vs} onFetched={setFetchedAt} />
    return <Profile handle={handle} onFetched={setFetchedAt} />
  }

  return (
    <div className="flex min-h-svh flex-col">
      <a
        href="#main"
        className="sr-only z-50 bg-accent px-4 py-2 font-label font-bold tracking-[0.14em] text-on-accent uppercase focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      <TopBar>{route.handle ? <SearchBox variant="compact" /> : null}</TopBar>
      <main id="main" className="flex-1">
        {page()}
      </main>
      <Footer fetchedAt={route.handle && !problem ? (fetchedAt ?? undefined) : undefined} />
    </div>
  )
}
