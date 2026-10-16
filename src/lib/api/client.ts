/**
 * The Codeforces API, called straight from the visitor's browser: it answers with
 * `Access-Control-Allow-Origin: *`, so there is no backend in between.
 */
import type { ApiResponse } from './types'

const API = 'https://codeforces.com/api'

/** Codeforces allows about one call every two seconds; when it says so, wait and try again. */
export const RETRY_DELAYS_MS = [2000, 4000, 6000]
/** At most this many requests in flight, so a comparison (six calls) stays under the limit. */
const MAX_IN_FLIGHT = 3

export type CodeforcesErrorKind =
  /** The handle does not exist. */
  | 'not-found'
  /** Still over the call limit after every retry. */
  | 'rate-limited'
  /** Codeforces answered, but not with its API (maintenance, a 5xx page). */
  | 'unavailable'
  /** The request never reached Codeforces (offline, DNS, blocked). */
  | 'network'
  /** Any other refusal, with Codeforces' own comment as the message. */
  | 'api'

export class CodeforcesError extends Error {
  readonly kind: CodeforcesErrorKind

  constructor(kind: CodeforcesErrorKind, message: string) {
    super(message)
    this.name = 'CodeforcesError'
    this.kind = kind
  }
}

/** True for the error a fetch or wait throws when its AbortSignal fires. */
export const isAbortError = (error: unknown) => error instanceof Error && error.name === 'AbortError'

const abortError = (signal: AbortSignal) =>
  signal.reason instanceof Error ? signal.reason : new DOMException('The request was cancelled', 'AbortError')

/** A wait that ends early, with an AbortError, if the signal fires. */
export function sleep(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(abortError(signal))
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    const onAbort = () => {
      clearTimeout(timer)
      reject(abortError(signal!))
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

let inFlight = 0
const waiting: Array<() => void> = []

async function withSlot<T>(task: () => Promise<T>) {
  if (inFlight >= MAX_IN_FLIGHT) await new Promise<void>((resolve) => waiting.push(resolve))
  inFlight += 1
  try {
    return await task()
  } finally {
    inFlight -= 1
    waiting.shift()?.()
  }
}

/** Calls one API method and returns its `result`, retrying while Codeforces asks to slow down. */
export async function call<T>(method: string, params: Record<string, string>, signal?: AbortSignal): Promise<T> {
  const url = `${API}/${method}?${new URLSearchParams(params)}`

  for (let attempt = 0; ; attempt++) {
    let response: Response
    try {
      response = await withSlot(() => fetch(url, { signal }))
    } catch (error) {
      if (isAbortError(error)) throw error
      throw new CodeforcesError('network', 'Could not reach Codeforces.')
    }

    const body = (await response.json().catch((error: unknown) => {
      if (isAbortError(error)) throw error
      return null
    })) as ApiResponse<T> | null
    if (body?.status === 'OK') return body.result

    const comment = body?.status === 'FAILED' ? body.comment : ''
    if (response.status === 429 || /call limit/i.test(comment)) {
      if (attempt < RETRY_DELAYS_MS.length) {
        await sleep(RETRY_DELAYS_MS[attempt], signal)
        continue
      }
      throw new CodeforcesError('rate-limited', 'Codeforces is receiving too many requests right now.')
    }
    if (/not found/i.test(comment)) throw new CodeforcesError('not-found', comment)
    if (!body || response.status >= 500) {
      throw new CodeforcesError('unavailable', `Codeforces is not answering (HTTP ${response.status}).`)
    }
    throw new CodeforcesError('api', comment || `Codeforces answered HTTP ${response.status}.`)
  }
}
