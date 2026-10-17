/**
 * The page state lives in the query string (`?handle=tourist`, `?handle=a&vs=b`,
 * `?country=Colombia&city=Bogotá`): GitHub Pages cannot serve paths like
 * /u/tourist, but every query-string URL reaches index.html, so any view can be
 * bookmarked and shared.
 */
import { useCallback, useMemo, useSyncExternalStore, type MouseEvent } from 'react'

export interface Route {
  handle: string | null
  vs: string | null
  /** The page for picking two players to compare (`?compare`), `handle` filling the first. */
  compare: boolean
  /** The rankings page (`?rankings`). */
  rankings: boolean
  /** A ranking: a country, a city within it, or an organization. */
  country: string | null
  city: string | null
  org: string | null
  /** A player to point out in a ranking. */
  focus: string | null
}

const NAVIGATE = 'cf-tracker:navigate'
/** Parameters in the order they are written, so equal routes give equal URLs. */
const ORDER = ['compare', 'handle', 'vs', 'rankings', 'country', 'city', 'org', 'focus'] as const

export function readRoute(search: string): Route {
  const params = new URLSearchParams(search)
  const text = (key: string) => params.get(key)?.trim() || null
  return {
    handle: text('handle'),
    vs: text('vs'),
    compare: params.has('compare'),
    rankings: params.has('rankings'),
    country: text('country'),
    city: text('city'),
    org: text('org'),
    focus: text('focus'),
  }
}

/** Readable query values: spaces as "+", commas kept (handle lists). */
const encode = (value: string) => encodeURIComponent(value).replace(/%20/g, '+').replace(/%2C/gi, ',')

/** The page URL for a route, under the site's base path. */
export function routeHref(route: Partial<Route>) {
  const parts: string[] = []
  for (const key of ORDER) {
    const value = route[key]
    if ((key === 'vs' && !route.handle) || (key === 'city' && !route.country)) continue
    if (value === true) parts.push(key)
    else if (typeof value === 'string' && value) parts.push(`${key}=${encode(value)}`)
  }
  return `${import.meta.env.BASE_URL}${parts.length ? `?${parts.join('&')}` : ''}`
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

export type Section = 'players' | 'compare' | 'rankings'

/** Which section a page belongs to: search and profiles under Players, comparisons under Compare. */
export function sectionOf(route: Route): Section {
  if (route.compare || (route.handle && route.vs)) return 'compare'
  if (route.rankings || route.country || route.org) return 'rankings'
  return 'players'
}

/** The parameters a loaded profile rewrites with its canonical handle. */
export type RouteParam = 'handle' | 'vs'

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
