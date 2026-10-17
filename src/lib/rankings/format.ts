/**
 * The daily rankings snapshot, published as data/rankings.json next to the site.
 *
 * Codeforces serves its list of rated users (`user.ratedList`) as a static file
 * without `Access-Control-Allow-Origin`, so the browser cannot download it. A
 * scheduled GitHub Actions run fetches it once a day (scripts/build-rankings.ts)
 * and publishes it in this compact, column-per-field form: 136,000 players come
 * to about 5 MB of JSON, 1.5 MB gzipped.
 *
 * No imports: the build script runs this file with Node's type stripping.
 */

export const RANKINGS_VERSION = 1

export interface RankingsFile {
  version: typeof RANKINGS_VERSION
  /** When the list was fetched from Codeforces, in ms. */
  generatedAt: number
  countries: string[]
  /** Each city with the index of its country: the same name can exist in two countries. */
  cities: [country: number, name: string][]
  orgs: string[]
  /** Handles joined with "\n". Every column below is in the same order: rating, best first. */
  handles: string
  rating: number[]
  maxRating: number[]
  /** Index into `countries`, `cities`, `orgs`; -1 when the player left it empty. */
  country: number[]
  city: number[]
  org: number[]
  /** "1" when the player competed in a rated contest in the last month, "0" otherwise. */
  active: string
}

/** The fields of a Codeforces user this snapshot keeps. */
export interface RatedUser {
  handle: string
  rating: number
  maxRating: number
  country?: string
  city?: string
  organization?: string
}

function dictionary() {
  const list: string[] = []
  const index = new Map<string, number>()
  return {
    list,
    id(value: string | undefined) {
      const name = value?.trim()
      if (!name) return -1
      let id = index.get(name)
      if (id === undefined) {
        id = list.length
        index.set(name, id)
        list.push(name)
      }
      return id
    },
  }
}

/** Best rating first; equal ratings in handle order, so the file is stable from day to day. */
const byRating = (a: RatedUser, b: RatedUser) =>
  b.rating - a.rating || (a.handle.toLowerCase() < b.handle.toLowerCase() ? -1 : 1)

export function encodeRankings(users: RatedUser[], active: Set<string>, generatedAt: number): RankingsFile {
  const countries = dictionary()
  const orgs = dictionary()
  const cities: [number, string][] = []
  const cityIndex = new Map<string, number>()
  const file: RankingsFile = {
    version: RANKINGS_VERSION,
    generatedAt,
    countries: countries.list,
    cities,
    orgs: orgs.list,
    handles: '',
    rating: [],
    maxRating: [],
    country: [],
    city: [],
    org: [],
    active: '',
  }
  const handles: string[] = []
  let flags = ''

  for (const user of [...users].sort(byRating)) {
    const country = countries.id(user.country)
    const cityName = user.city?.trim()
    let city = -1
    if (country >= 0 && cityName) {
      const key = country + '|' + cityName
      city = cityIndex.get(key) ?? -1
      if (city < 0) {
        city = cities.length
        cityIndex.set(key, city)
        cities.push([country, cityName])
      }
    }
    handles.push(user.handle)
    file.rating.push(user.rating)
    file.maxRating.push(user.maxRating)
    file.country.push(country)
    file.city.push(city)
    file.org.push(orgs.id(user.organization))
    flags += active.has(user.handle) ? '1' : '0'
  }

  file.handles = handles.join('\n')
  file.active = flags
  return file
}
