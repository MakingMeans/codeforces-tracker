/**
 * Downloads and processes a profile's submissions off the main thread: for
 * accounts with 10,000+ submissions, parsing several MB of JSON and deriving
 * the history blocked the page for 200–500 ms.
 *
 * Messages in:  { type: 'load', id, handle } · { type: 'contests', id, contests } · { type: 'cancel', id }
 * Messages out: { type: 'done', id, details } · { type: 'error', id, kind, message }
 */
import { CodeforcesError, isAbortError } from '../lib/api/client'
import type { ApiContest } from '../lib/api/types'
import { fetchDetails } from '../lib/codeforces/details'
import type { DetailsRequest, DetailsResponse } from '../lib/details-protocol'

const scope = self as unknown as {
  onmessage: ((event: MessageEvent<DetailsRequest>) => void) | null
  postMessage: (message: DetailsResponse) => void
}

interface Job {
  controller: AbortController
  resolveContests: (contests: ApiContest[]) => void
}
const jobs = new Map<number, Job>()

scope.onmessage = async ({ data }) => {
  if (data.type === 'cancel') {
    jobs.get(data.id)?.controller.abort()
    jobs.delete(data.id)
    return
  }
  if (data.type === 'contests') {
    jobs.get(data.id)?.resolveContests(data.contests)
    return
  }

  const controller = new AbortController()
  let resolveContests!: (contests: ApiContest[]) => void
  const contests = new Promise<ApiContest[]>((resolve) => (resolveContests = resolve))
  jobs.set(data.id, { controller, resolveContests })

  try {
    const details = await fetchDetails(data.handle, contests, controller.signal)
    scope.postMessage({ type: 'done', id: data.id, details })
  } catch (error) {
    if (isAbortError(error)) return
    scope.postMessage({
      type: 'error',
      id: data.id,
      kind: error instanceof CodeforcesError ? error.kind : 'api',
      message: error instanceof Error ? error.message : String(error),
    })
  } finally {
    jobs.delete(data.id)
  }
}
