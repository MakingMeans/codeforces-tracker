import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { site } from '../../lib/site'
import { GithubIcon } from './github-icon'
import { Wordmark } from './wordmark'

/** The bar on every page: the wordmark home link, an optional slot (the search box) and the source link. */
export function TopBar({ children }: { children?: ReactNode }) {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-6">
        <a href={import.meta.env.BASE_URL} className="text-[26px] text-ink" aria-label={`${site.name} home`}>
          <Wordmark />
        </a>
        {children ? (
          // On phones the search takes its own full-width row under the wordmark.
          <div className="order-last flex w-full min-w-0 sm:order-none sm:ml-auto sm:w-auto sm:flex-1 sm:justify-end">
            {children}
          </div>
        ) : null}
        <a
          href={site.repo}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Source code on GitHub"
          className={cn(
            'ml-auto grid h-9 w-9 place-items-center text-ink-muted transition-colors hover:text-ink',
            Boolean(children) && 'sm:ml-0',
          )}
        >
          <GithubIcon className="h-5 w-5" />
        </a>
      </div>
    </header>
  )
}
