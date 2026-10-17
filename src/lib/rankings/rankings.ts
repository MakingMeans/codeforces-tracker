/**
 * Questions asked of the rankings snapshot: who is in a country, a city or an
 * organization and in what place, where a given player stands, and which places
 * match what someone is typing. Everything is computed on first use and kept.
 */
import { topThreeTeamRating } from '../codeforces/team-rating'
import type { Route } from '../route'
import type { Rankings } from './data'

export type Scope =
  { kind: 'country'; country: string } | { kind: 'city'; country: string; city: string } | { kind: 'org'; org: string }

/** A scope found in the snapshot, with the index it filters on. */
interface Resolved {
  scope: Scope
  column: 'country' | 'city' | 'org'
  id: number
}

export interface RankedRow {
  /** Index into the snapshot's columns. */
  row: number
  /** Place within the scope; equal ratings share a place (1, 2, 2, 4). */
  position: number
}

export interface ScopeStats {
  players: number
  /** Players who competed in a rated contest in the last month. */
  active: number
  average: number | null
  /** Codeforces' team rating of the best three. */
  teamTopThree: number | null
}

export interface Standing {
  scope: Scope
  name: string
  position: number
  total: number
}

export interface Suggestion {
  scope: Scope
  label: string
  /** The country of a city, shown next to it. */
  detail?: string
  players: number
}

export interface CountrySummary {
  country: string
  players: number
  average: number
  best: number
}

/** Lower case without accents, so "bogota" finds "Bogotá". */
export const fold = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()

export const scopeName = (scope: Scope) =>
  scope.kind === 'country' ? scope.country : scope.kind === 'city' ? scope.city : scope.org

/** The route of a scope's ranking. */
export const scopeRoute = (scope: Scope): Partial<Route> =>
  scope.kind === 'country'
    ? { country: scope.country }
    : scope.kind === 'city'
      ? { country: scope.country, city: scope.city }
      : { org: scope.org }

/** The scope a route asks for: an organization, a city within a country, or a country. */
export function scopeFromRoute(route: Pick<Route, 'country' | 'city' | 'org'>): Scope | null {
  if (route.org) return { kind: 'org', org: route.org }
  if (route.country && route.city) return { kind: 'city', country: route.country, city: route.city }
  if (route.country) return { kind: 'country', country: route.country }
  return null
}

const scopeKey = (scope: Scope) =>
  scope.kind === 'country'
    ? `country:${fold(scope.country)}`
    : scope.kind === 'city'
      ? `city:${fold(scope.country)}|${fold(scope.city)}`
      : `org:${fold(scope.org)}`

/** Places for an already filtered, rating-ordered list of rows. */
export function withPositions(rows: number[], rating: Int32Array): RankedRow[] {
  const ranked: RankedRow[] = []
  rows.forEach((row, i) => {
    const tied = i > 0 && rating[row] === rating[rows[i - 1]]
    ranked.push({ row, position: tied ? ranked[i - 1].position : i + 1 })
  })
  return ranked
}

export function createRankings(data: Rankings) {
  const byName = (names: string[]) => new Map(names.map((name, id) => [fold(name), id]))
  const countryIds = byName(data.countries)
  const orgIds = byName(data.orgs)
  const cityIds = new Map(data.cities.map((city, id) => [`${city.country}|${fold(city.name)}`, id]))

  const count = (column: Int32Array, size: number) => {
    const counts = new Int32Array(size)
    for (const id of column) if (id >= 0) counts[id]++
    return counts
  }
  let counts: { country: Int32Array; city: Int32Array; org: Int32Array } | null = null
  const players = () =>
    (counts ??= {
      country: count(data.country, data.countries.length),
      city: count(data.city, data.cities.length),
      org: count(data.org, data.orgs.length),
    })

  function resolve(scope: Scope): Resolved | null {
    if (scope.kind === 'org') {
      const id = orgIds.get(fold(scope.org))
      return id === undefined ? null : { scope: { kind: 'org', org: data.orgs[id] }, column: 'org', id }
    }
    const country = countryIds.get(fold(scope.country))
    if (country === undefined) return null
    if (scope.kind === 'country') {
      return { scope: { kind: 'country', country: data.countries[country] }, column: 'country', id: country }
    }
    const id = cityIds.get(`${country}|${fold(scope.city)}`)
    if (id === undefined) return null
    return {
      scope: { kind: 'city', country: data.countries[country], city: data.cities[id].name },
      column: 'city',
      id,
    }
  }

  const memberCache = new Map<string, number[]>()
  /** Every row in the scope, best first. */
  function members(resolved: Resolved) {
    const key = scopeKey(resolved.scope)
    let rows = memberCache.get(key)
    if (!rows) {
      rows = []
      const column = data[resolved.column]
      for (let row = 0; row < column.length; row++) if (column[row] === resolved.id) rows.push(row)
      memberCache.set(key, rows)
    }
    return rows
  }

  /** The scope's players in order, with their places; `activeOnly` ranks only this month's competitors. */
  function ranking(scope: Scope, activeOnly = false) {
    const resolved = resolve(scope)
    if (!resolved) return null
    const all = members(resolved)
    const rows = activeOnly ? all.filter((row) => data.active[row] === 1) : all
    return { scope: resolved.scope, rows: withPositions(rows, data.rating) }
  }

  function stats(rows: RankedRow[]): ScopeStats {
    const ratings = rows.map(({ row }) => data.rating[row])
    return {
      players: rows.length,
      active: rows.reduce((sum, { row }) => sum + data.active[row], 0),
      average: ratings.length ? Math.round(ratings.reduce((a, b) => a + b, 0) / ratings.length) : null,
      teamTopThree: topThreeTeamRating(ratings),
    }
  }

  /** Where a player stands in their country, city and organization, as of the snapshot. */
  function standing(handle: string): Standing[] {
    let row = data.handles.indexOf(handle)
    if (row < 0) {
      const wanted = handle.toLowerCase()
      row = data.handles.findIndex((item) => item.toLowerCase() === wanted)
    }
    if (row < 0) return []
    const scopes: Scope[] = []
    const country = data.country[row]
    if (country >= 0) {
      scopes.push({ kind: 'country', country: data.countries[country] })
      const city = data.city[row]
      if (city >= 0) scopes.push({ kind: 'city', country: data.countries[country], city: data.cities[city].name })
    }
    if (data.org[row] >= 0) scopes.push({ kind: 'org', org: data.orgs[data.org[row]] })

    return scopes.flatMap((scope) => {
      const ranked = ranking(scope)
      const mine = ranked?.rows.find((entry) => entry.row === row)
      return ranked && mine
        ? [{ scope: ranked.scope, name: scopeName(ranked.scope), position: mine.position, total: ranked.rows.length }]
        : []
    })
  }

  let folded: { countries: string[]; cities: string[]; orgs: string[] } | null = null
  /** Places whose name contains what was typed: names that start with it first, then the biggest. */
  function suggest(kind: Scope['kind'], query: string, limit = 8): Suggestion[] {
    const q = fold(query)
    if (!q) return []
    folded ??= {
      countries: data.countries.map(fold),
      cities: data.cities.map((c) => fold(c.name)),
      orgs: data.orgs.map(fold),
    }
    const names = kind === 'country' ? folded.countries : kind === 'city' ? folded.cities : folded.orgs
    const sizes = players()[kind]
    const found: { id: number; starts: boolean }[] = []
    names.forEach((name, id) => {
      const at = name.indexOf(q)
      if (at >= 0) found.push({ id, starts: at === 0 || name[at - 1] === ' ' })
    })
    found.sort((a, b) => Number(b.starts) - Number(a.starts) || sizes[b.id] - sizes[a.id])
    return found.slice(0, limit).map(({ id }) => {
      if (kind === 'country') {
        return { scope: { kind, country: data.countries[id] }, label: data.countries[id], players: sizes[id] }
      }
      if (kind === 'org') return { scope: { kind, org: data.orgs[id] }, label: data.orgs[id], players: sizes[id] }
      const city = data.cities[id]
      const country = data.countries[city.country]
      return { scope: { kind, country, city: city.name }, label: city.name, detail: country, players: sizes[id] }
    })
  }

  let summaries: CountrySummary[] | null = null
  /** Every country, most players first, with its average and best rating. */
  function countries(): CountrySummary[] {
    if (summaries) return summaries
    const sum = new Float64Array(data.countries.length)
    const best = new Int32Array(data.countries.length).fill(-2_147_483_648)
    const sizes = players().country
    for (let row = 0; row < data.country.length; row++) {
      const id = data.country[row]
      if (id < 0) continue
      sum[id] += data.rating[row]
      if (data.rating[row] > best[id]) best[id] = data.rating[row]
    }
    summaries = data.countries
      .map((country, id) => ({ country, players: sizes[id], average: Math.round(sum[id] / sizes[id]), best: best[id] }))
      .filter((summary) => summary.players > 0)
      .sort((a, b) => b.players - a.players || a.country.localeCompare(b.country))
    return summaries
  }

  return {
    data,
    resolve: (scope: Scope) => resolve(scope)?.scope ?? null,
    ranking,
    stats,
    standing,
    suggest,
    countries,
  }
}

export type RankingsIndex = ReturnType<typeof createRankings>
