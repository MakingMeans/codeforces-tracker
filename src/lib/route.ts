/**
 * The page state lives in the query string (`?handle=tourist`, `?handle=a&vs=b`):
 * GitHub Pages cannot serve paths like /u/tourist, but every query-string URL
 * reaches index.html, so any view can be bookmarked and shared.
 */
import { useCallback, useMemo, useSyncExternalStore, type MouseEvent } from 'react'

export interface Route {
  handle: string | null
  vs: string | null
}

const NAVIGATE = 'cf-tracker:navigate'

export function readRoute(search: string): Route {
  const params = new URLSearchParams(search)
  return { handle: params.get('handle')?.trim() || null, vs: params.get('vs')?.trim() || null }
}

/** The page URL for a route, under the site's base path. */
export function routeHref(route: Partial<Route>) {
  const params = new URLSearchParams()
  if (route.handle) params.set('handle', route.handle)
  if (route.handle && route.vs) params.set('vs', route.vs)
  const query = params.toString()
  return `${import.meta.env.BASE_URL}${query ? `?${query}` : ''}`
}

/** Changes the URL; `replace` rewrites the current history entry instead of adding one. */
export function navigate(route: Partial<Route>, { replace = false } = {}) {
  const href = routeHref(route)
  if (href === `${location.pathname}${location.search}`) return
  if (replace) history.replaceState(null, '', href)
  else history.pushState(null, '', href)
  window.dispatchEvent(new Event(NAVIGATE))
  if (!replace) window.scrollTo({ top: 0 })
}

export type RouteParam = keyof Route

/** Rewrites one parameter of the current URL in place, keeping the others. */
export function replaceRouteParam(param: RouteParam, value: string) {
  navigate({ ...readRoute(location.search), [param]: value }, { replace: true })
}

function subscribe(onChange: () => void) {
  window.addEventListener('popstate', onChange)
  window.addEventListener(NAVIGATE, onChange)
  return () => {
    window.removeEventListener('popstate', onChange)
    window.removeEventListener(NAVIGATE, onChange)
  }
}

const getSearch = () => location.search

/** The current route; re-renders on back/forward and on `navigate`. */
export function useRoute() {
  const search = useSyncExternalStore(subscribe, getSearch)
  const route = useMemo(() => readRoute(search), [search])
  const go = useCallback((next: Partial<Route>, options?: { replace?: boolean }) => navigate(next, options), [])
  return { route, navigate: go }
}

/** A click handler for links to routes: keeps new-tab clicks native, handles the rest in place. */
export function linkHandler(route: Partial<Route>) {
  return (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return
    event.preventDefault()
    navigate(route)
  }
}
