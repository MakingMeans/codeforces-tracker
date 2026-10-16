/** Landing page. For now only the hero; search, recent handles and upcoming contests come next. */
export function Home() {
  return (
    <section className="ticks border-b border-line">
      <div className="mx-auto grid max-w-[1240px] gap-5 px-4 py-16 sm:px-6 sm:py-24">
        <p className="font-label text-[13px] font-semibold tracking-[0.18em] text-ink-muted uppercase">
          Codeforces profile tracker
        </p>
        <h1 className="max-w-[16ch] font-display text-[clamp(44px,8vw,92px)] leading-[0.95] text-balance uppercase">
          Track any Codeforces handle
        </h1>
        <p className="max-w-[62ch] text-lg text-ink-muted">
          Rank, rating history, activity and every contest entered, contest by contest. Live from the Codeforces API,
          right in your browser.
        </p>
        <p className="cut w-fit px-4 py-2 font-label text-sm font-bold tracking-[0.14em] uppercase [--cut:8px] [--cut-fill:var(--color-surface-2)]">
          Under construction
        </p>
      </div>
    </section>
  )
}
