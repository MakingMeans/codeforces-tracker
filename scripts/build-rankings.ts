/**
 * Builds public/data/rankings.json: every rated player who was on Codeforces in
 * the last month, with country, city and organization, for the rankings pages.
 *
 * Codeforces serves this list without CORS headers, so the browser cannot fetch
 * it; this runs in GitHub Actions before each build (every three hours, on a
 * schedule). Codeforces rebuilds the list once a day, so the rating changes of
 * the last week's contests are laid over it (src/lib/rankings/recent.ts): a
 * contest counts here a few hours after it is rated, not the next day.
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
import { applyRecent, RECENT_DAYS, type RatingChange } from '../src/lib/rankings/recent.ts'

const API = 'https://codeforces.com/api'
const PUBLISHED = 'https://makingmeans.github.io/codeforces-tracker/data/rankings.json'
const OUT = resolve(import.meta.dirname, '../public/data/rankings.json')
/** Fewer than this many players means Codeforces answered with something else. */
const MIN_PLAYERS = 10_000

interface Contest {
  id: number
  phase: string
  startTimeSeconds?: number
  durationSeconds: number
}

const sleep = (ms: number) => new Promise((done) => setTimeout(done, ms))

async function api<T>(method: string, query: string): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(`${API}/${method}?${query}`, {
      headers: { 'User-Agent': 'cf-tracker rankings build' },
    })
    const body = (await response.json().catch(() => null)) as {
      status: string
      result?: T
      comment?: string
    } | null
    if (body?.status === 'OK' && body.result) return body.result
    const busy = response.status === 429 || /call limit/i.test(body?.comment ?? '') || response.status >= 500
    if (busy && attempt < 3) {
      await sleep(5000 * (attempt + 1))
      continue
    }
    throw new Error(`${method}?${query} answered HTTP ${response.status}: ${body?.comment ?? 'not the API'}`)
  }
}

/**
 * The rating changes of every contest that ended in the last week. What cannot be
 * read is left out (the next run tries again): the rankings still build.
 */
async function recentChanges(): Promise<RatingChange[]> {
  const since = Date.now() / 1000 - RECENT_DAYS * 86_400
  let contests: Contest[]
  try {
    contests = await api<Contest[]>('contest.list', 'gym=false')
  } catch (error) {
    console.warn(`No recent contests: ${error instanceof Error ? error.message : error}`)
    return []
  }
  const ended = contests.filter(
    (contest) => contest.phase === 'FINISHED' && (contest.startTimeSeconds ?? 0) + contest.durationSeconds >= since,
  )
  const changes: RatingChange[] = []
  for (const contest of ended) {
    await sleep(2500)
    try {
      const rated = await api<RatingChange[]>('contest.ratingChanges', `contestId=${contest.id}`)
      changes.push(...rated.filter((change) => change.ratingUpdateTimeSeconds >= since))
    } catch (error) {
      console.warn(`Skipped contest ${contest.id}: ${error instanceof Error ? error.message : error}`)
    }
  }
  console.log(`${ended.length} contests in the last ${RECENT_DAYS} days, ${changes.length} rating changes`)
  return changes
}

async function build(): Promise<RankingsFile> {
  const everyone = await api<RatedUser[]>('user.ratedList', 'activeOnly=false&includeRetired=false')
  await sleep(2500) // Codeforces allows about one call every two seconds.
  const competed = await api<RatedUser[]>('user.ratedList', 'activeOnly=true&includeRetired=false')
  if (everyone.length < MIN_PLAYERS) throw new Error(`Only ${everyone.length} players in the list.`)
  await sleep(2500)
  const recent = applyRecent(everyone, await recentChanges())
  const active = new Set([...competed.map((user) => user.handle), ...recent.competed])
  return encodeRankings(recent.users, active, Date.now(), recent.moved)
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
    `rankings.json: ${file.rating.length} players (${active} competed this month, ${file.moves?.length ?? 0} changed rank this week), ${file.countries.length} countries, ${file.cities.length} cities, ${file.orgs.length} organizations`,
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
