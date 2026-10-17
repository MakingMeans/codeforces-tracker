import { RankLadder } from '../components/home/rank-ladder'
import { UpcomingContests } from '../components/home/upcoming-contests'
import { ExampleHandles, RecentSearches } from '../components/search/handle-chips'
import { ScopedSearch } from '../components/search/scoped-search'

/** The home page fades in piece by piece, top to bottom; reduced motion shows it all at once. */
const FADE = 'animate-fade-up'

export function Home() {
  return (
    <>
      <section aria-labelledby="home-title" className="ticks border-b border-line">
        <div className="mx-auto grid max-w-[1240px] grid-cols-[minmax(0,1fr)] gap-6 px-4 py-14 sm:px-6 sm:py-20">
          <div className="grid gap-4">
            <p className={`${FADE} font-label text-[13px] font-semibold tracking-[0.18em] text-ink-muted uppercase`}>
              Codeforces profile tracker
            </p>
            <h1
              id="home-title"
              className={`${FADE} max-w-[16ch] font-display text-[clamp(44px,8vw,92px)] leading-[0.95] text-balance uppercase [animation-delay:80ms]`}
            >
              Track any Codeforces handle
            </h1>
            <p className={`${FADE} max-w-[62ch] text-lg text-ink-muted [animation-delay:160ms]`}>
              Rank, rating history, activity and every contest entered, contest by contest. Live from the Codeforces
              API, right in your browser.
            </p>
          </div>
          <div className={`${FADE} relative z-20 [animation-delay:240ms]`}>
            <ScopedSearch scopes={['player', 'country', 'city', 'org']} />
          </div>
          <div className={`${FADE} grid gap-3 [animation-delay:320ms]`}>
            <RecentSearches />
            <ExampleHandles />
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1240px] grid-cols-[minmax(0,1fr)] gap-4 px-4 py-10 sm:px-6 lg:grid-cols-2">
        <div className={`${FADE} grid min-w-0 [animation-delay:400ms]`}>
          <UpcomingContests />
        </div>
        <div className={`${FADE} grid min-w-0 [animation-delay:480ms]`}>
          <RankLadder />
        </div>
      </div>
    </>
  )
}
