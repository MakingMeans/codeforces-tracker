/**
 * Builds public/data/rankings.json: every rated player who was on Codeforces in
 * the last month, with country, city and organization, for the rankings pages.
 *
 * Codeforces serves this list without CORS headers, so the browser cannot fetch
 * it; this runs in GitHub Actions before each build (daily, on a schedule).
 *
 *   npm run data
 *
 * When Codeforces cannot be reached, the copy already published is kept, so a
 * deploy never loses the rankings; without either, the site builds without them
 * and the rankings pages say so.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { encodeRankings, type RankingsFile, type RatedUser } from '../src/lib/rankings/format.ts'

const API = 'https://codeforces.com/api/user.ratedList'
const PUBLISHED = 'https://makingmeans.github.io/codeforces-tracker/data/rankings.json'
const OUT = resolve(import.meta.dirname, '../public/data/rankings.json')
/** Fewer than this many players means Codeforces answered with something else. */
const MIN_PLAYERS = 10_000

const sleep = (ms: number) => new Promise((done) => setTimeout(done, ms))

async function ratedList(query: string): Promise<RatedUser[]> {
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(`${API}?${query}`, { headers: { 'User-Agent': 'cf-tracker rankings build' } })
    const body = (await response.json().catch(() => null)) as {
      status: string
      result?: RatedUser[]
      comment?: string
    } | null
    if (body?.status === 'OK' && body.result) return body.result
    const busy = response.status === 429 || /call limit/i.test(body?.comment ?? '') || response.status >= 500
    if (busy && attempt < 3) {
      await sleep(5000 * (attempt + 1))
      continue
    }
    throw new Error(`user.ratedList?${query} answered HTTP ${response.status}: ${body?.comment ?? 'not the API'}`)
  }
}

async function build(): Promise<RankingsFile> {
  const everyone = await ratedList('activeOnly=false&includeRetired=false')
  await sleep(2500) // Codeforces allows about one call every two seconds.
  const competed = await ratedList('activeOnly=true&includeRetired=false')
  if (everyone.length < MIN_PLAYERS) throw new Error(`Only ${everyone.length} players in the list.`)
  return encodeRankings(everyone, new Set(competed.map((user) => user.handle)), Date.now())
}

async function published(): Promise<string> {
  const response = await fetch(PUBLISHED)
  if (!response.ok) throw new Error(`The published copy answered HTTP ${response.status}.`)
  return response.text()
}

async function save(json: string) {
  await mkdir(dirname(OUT), { recursive: true })
  await writeFile(OUT, json)
}

try {
  const file = await build()
  await save(JSON.stringify(file))
  const active = [...file.active].filter((flag) => flag === '1').length
  console.log(
    `rankings.json: ${file.rating.length} players (${active} competed this month), ${file.countries.length} countries, ${file.cities.length} cities, ${file.orgs.length} organizations`,
  )
} catch (error) {
  console.warn(`Could not build the rankings: ${error instanceof Error ? error.message : error}`)
  try {
    await save(await published())
    console.warn('Kept the copy already published.')
  } catch (fallback) {
    console.warn(`No rankings in this build: ${fallback instanceof Error ? fallback.message : fallback}`)
  }
}
