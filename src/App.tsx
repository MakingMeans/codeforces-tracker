import { useEffect } from 'react'
import { Footer } from './components/layout/footer'
import { TopBar } from './components/layout/top-bar'
import { SearchBox } from './components/search/search-box'
import { InvalidHandle } from './components/states/invalid-handle'
import { cleanHandle, handleProblem } from './lib/handle'
import { useRoute } from './lib/route'
import { site } from './lib/site'
import { Home } from './pages/home'
import { Profile } from './pages/profile'

export default function App() {
  const { route } = useRoute()
  const handle = route.handle
  const problem = handle ? handleProblem(handle) : null

  useEffect(() => {
    document.title = handle && !problem ? `${cleanHandle(handle)} · ${site.name}` : site.name
  }, [handle, problem])

  return (
    <div className="flex min-h-svh flex-col">
      <a
        href="#main"
        className="sr-only z-50 bg-accent px-4 py-2 font-label font-bold tracking-[0.14em] text-on-accent uppercase focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      <TopBar>{handle ? <SearchBox variant="compact" /> : null}</TopBar>
      <main id="main" className="flex-1">
        {!handle ? (
          <Home />
        ) : problem ? (
          <InvalidHandle handle={handle} problem={problem} />
        ) : (
          <Profile key={cleanHandle(handle).toLowerCase()} handle={cleanHandle(handle)} />
        )}
      </main>
      <Footer />
    </div>
  )
}
