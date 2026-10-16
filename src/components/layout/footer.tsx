import { site } from '../../lib/site'

/** Disclaimer and data source on every page; `fetchedAt` adds when the shown data was read. */
export function Footer({ fetchedAt }: { fetchedAt?: number }) {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-baseline justify-between gap-x-6 gap-y-2 px-4 py-5 text-[13px] text-ink-muted sm:px-6">
        <p>
          Not affiliated with Codeforces or Riot Games. Data from the{' '}
          <a
            href={site.api}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-3 hover:text-ink"
          >
            public Codeforces API
          </a>
          .
        </p>
        <p className="flex flex-wrap gap-x-4 gap-y-1">
          {fetchedAt ? (
            <span className="tabular-nums">
              Fetched at {new Date(fetchedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          ) : null}
          <a
            href={site.repo}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-3 hover:text-ink"
          >
            Source on GitHub
          </a>
        </p>
      </div>
    </footer>
  )
}
