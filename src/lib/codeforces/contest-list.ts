import { call } from '../api/client'
import type { ApiContest } from '../api/types'
import { readJSON, writeJSON } from '../storage'

/** The list is the same for everyone and changes slowly, so it is kept for an hour. */
export const CONTEST_LIST_TTL_MS = 60 * 60 * 1000
const KEY = 'cf-tracker:contest-list:v1'

interface Cached {
  savedAt: number
  contests: ApiContest[]
}

/** Only the fields the site reads, which cuts the stored size by more than half. */
const trim = ({ id, name, phase, durationSeconds, startTimeSeconds }: ApiContest): ApiContest => ({
  id,
  name,
  phase,
  durationSeconds,
  startTimeSeconds,
})

let memory: Cached | null = null

/** Every non-gym contest, from memory, then localStorage, then the API. */
export async function getContestList(signal?: AbortSignal, now = Date.now()): Promise<ApiContest[]> {
  const fresh = (cached: Cached | null) => cached !== null && now - cached.savedAt < CONTEST_LIST_TTL_MS
  if (fresh(memory)) return memory!.contests

  const stored = readJSON<Cached>('localStorage', KEY)
  if (fresh(stored)) {
    memory = stored
    return stored!.contests
  }

  const contests = (await call<ApiContest[]>('contest.list', { gym: 'false' }, signal)).map(trim)
  memory = { savedAt: now, contests }
  writeJSON('localStorage', KEY, memory)
  return contests
}

/** For tests: forget the in-memory copy. */
export const resetContestListMemory = () => {
  memory = null
}

/** Contests that have not started yet, soonest first. */
export const upcomingContests = (contests: ApiContest[], now: number) =>
  contests
    .filter((contest) => contest.phase === 'BEFORE' && (contest.startTimeSeconds ?? 0) * 1000 > now)
    .sort((a, b) => (a.startTimeSeconds ?? 0) - (b.startTimeSeconds ?? 0))
