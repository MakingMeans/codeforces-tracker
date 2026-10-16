import { X } from 'lucide-react'
import { removeRecentSearch, useRecentSearches } from '../../lib/recent-searches'
import { linkHandler, routeHref } from '../../lib/route'

const EXAMPLES = ['tourist', 'jiangly', 'Benq']

const chip =
  'cut inline-flex items-center [--cut:7px] [--cut-fill:var(--color-surface-2)] [--cut-line:var(--color-line)]'
const link = 'py-1.5 pr-3 pl-3 font-medium underline-offset-3 hover:underline'

function Label({ children }: { children: string }) {
  return (
    <span className="font-label text-[13px] font-semibold tracking-[0.16em] text-ink-muted uppercase">{children}</span>
  )
}

/** Handles looked up in this browser, each removable. Hidden until there is one. */
export function RecentSearches() {
  const recent = useRecentSearches()
  if (recent.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <Label>Recent</Label>
      <ul className="flex flex-wrap gap-2">
        {recent.map((handle) => (
          <li key={handle} className={chip}>
            <a href={routeHref({ handle })} onClick={linkHandler({ handle })} className={`${link} pr-1`}>
              {handle}
            </a>
            <button
              type="button"
              onClick={() => removeRecentSearch(handle)}
              aria-label={`Remove ${handle} from recent searches`}
              className="grid cursor-pointer place-items-center py-1.5 pr-2.5 pl-1.5 text-ink-muted transition-colors hover:text-accent"
            >
              <X aria-hidden className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** A few well-known handles to start from. */
export function ExampleHandles() {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <Label>Try</Label>
      <ul className="flex flex-wrap gap-2">
        {EXAMPLES.map((handle) => (
          <li key={handle} className={chip}>
            <a href={routeHref({ handle })} onClick={linkHandler({ handle })} className={link}>
              {handle}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
