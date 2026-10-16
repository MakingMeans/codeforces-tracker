import { RankLadder } from '../components/home/rank-ladder'
import { UpcomingContests } from '../components/home/upcoming-contests'
import { ExampleHandles, RecentSearches } from '../components/search/handle-chips'
import { SearchBox } from '../components/search/search-box'

export function Home() {
  return (
    <>
      <section aria-labelledby="home-title" className="ticks border-b border-line">
        <div className="mx-auto grid max-w-[1240px] grid-cols-[minmax(0,1fr)] gap-6 px-4 py-14 sm:px-6 sm:py-20">
          <div className="grid gap-4">
            <p className="font-label text-[13px] font-semibold tracking-[0.18em] text-ink-muted uppercase">
              Codeforces profile tracker
            </p>
            <h1
              id="home-title"
              className="max-w-[16ch] font-display text-[clamp(44px,8vw,92px)] leading-[0.95] text-balance uppercase"
            >
              Track any Codeforces handle
            </h1>
            <p className="max-w-[62ch] text-lg text-ink-muted">
              Rank, rating history, activity and every contest entered, contest by contest. Live from the Codeforces
              API, right in your browser.
            </p>
          </div>
          <SearchBox variant="hero" />
          <div className="grid gap-3">
            <RecentSearches />
            <ExampleHandles />
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1240px] grid-cols-[minmax(0,1fr)] gap-4 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <UpcomingContests />
        <RankLadder />
      </div>
    </>
  )
}
