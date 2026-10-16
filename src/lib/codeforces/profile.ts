/**
 * A profile loads in two steps: `user.info` first (fast, and it fails cleanly
 * for an unknown handle before megabytes of submissions are downloaded), then
 * the rating history, every submission and the contest list together. The
 * second step runs in a worker when the browser has them.
 */
import { call, CodeforcesError } from '../api/client'
import type { ApiContest, ApiUser } from '../api/types'
import type { DetailsRequest, DetailsResponse } from '../details-protocol'
import { getContestList } from './contest-list'
import { fetchDetails, type ProfileDetails } from './details'
import { toProfileUser, type ProfileUser } from './user'

export type { ProfileDetails } from './details'
export { deriveDetails } from './details'

export interface Profile {
  user: ProfileUser
  details: ProfileDetails
  /** When the data was read from Codeforces, in ms. */
  fetchedAt: number
}

export async function loadUser(handle: string, signal: AbortSignal, now = Date.now()): Promise<ProfileUser> {
  const [user] = await call<ApiUser[]>('user.info', { handles: handle }, signal)
  return toProfileUser(user, now)
}

// ---------- the details worker ----------

let worker: Worker | null = null
let nextId = 1
const pending = new Map<number, { resolve: (details: ProfileDetails) => void; reject: (error: unknown) => void }>()

function getWorker() {
  if (worker) return worker
  worker = new Worker(new URL('../../workers/details.worker.ts', import.meta.url), { type: 'module' })
  worker.onmessage = ({ data }: MessageEvent<DetailsResponse>) => {
    const job = pending.get(data.id)
    if (!job) return
    pending.delete(data.id)
    if (data.type === 'done') job.resolve(data.details)
    else job.reject(new CodeforcesError(data.kind, data.message))
  }
  worker.onerror = () => {
    // The worker itself failed to start or crashed: fail what is waiting and start a new one next time.
    pending.forEach((job) => job.reject(new CodeforcesError('api', 'The page could not process the data.')))
    pending.clear()
    worker?.terminate()
    worker = null
  }
  return worker
}

const send = (message: DetailsRequest) => getWorker().postMessage(message)

function loadInWorker(handle: string, contests: Promise<ApiContest[]>, signal: AbortSignal) {
  return new Promise<ProfileDetails>((resolve, reject) => {
    const id = nextId++
    pending.set(id, { resolve, reject })
    send({ type: 'load', id, handle })
    contests.then(
      (list) => pending.has(id) && send({ type: 'contests', id, contests: list }),
      (error: unknown) => {
        if (!pending.has(id)) return
        pending.delete(id)
        send({ type: 'cancel', id })
        reject(error)
      },
    )
    signal.addEventListener(
      'abort',
      () => {
        if (!pending.has(id)) return
        pending.delete(id)
        send({ type: 'cancel', id })
        reject(signal.reason ?? new DOMException('The request was cancelled', 'AbortError'))
      },
      { once: true },
    )
  })
}

export function loadDetails(handle: string, signal: AbortSignal): Promise<ProfileDetails> {
  // The contest list stays on this thread: its cache lives in localStorage, which workers cannot reach.
  const contests = getContestList(signal)
  if (typeof Worker === 'undefined') return fetchDetails(handle, contests, signal)
  return loadInWorker(handle, contests, signal)
}
