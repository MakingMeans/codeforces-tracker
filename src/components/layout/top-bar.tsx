import type { ReactNode } from 'react'
import { site } from '../../lib/site'
import { GithubIcon } from './github-icon'
import { Wordmark } from './wordmark'

/** The bar on every page: the wordmark home link, an optional slot (the search box) and the source link. */
export function TopBar({ children }: { children?: ReactNode }) {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-4 px-4 py-3 sm:px-6">
        <a href={import.meta.env.BASE_URL} className="text-[26px] text-ink" aria-label={`${site.name} home`}>
          <Wordmark />
        </a>
        <div className="ml-auto flex min-w-0 flex-1 justify-end">{children}</div>
        <a
          href={site.repo}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Source code on GitHub"
          className="grid h-9 w-9 place-items-center text-ink-muted transition-colors hover:text-ink"
        >
          <GithubIcon className="h-5 w-5" />
        </a>
      </div>
    </header>
  )
}
