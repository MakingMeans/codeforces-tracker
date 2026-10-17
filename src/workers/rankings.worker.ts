/**
 * Downloads and checks the rankings snapshot off the main thread: 5 MB of JSON
 * and 136,000 rows would otherwise block the page while being parsed.
 *
 * Message in:   { url }
 * Messages out: { type: 'done', payload } (columns transferred, not copied)
 *               { type: 'missing' } when there is no snapshot
 *               { type: 'error', message }
 */
import { toPayload, transferables, validateRankings } from '../lib/rankings/data'
import type { RankingsWorkerResponse } from '../lib/rankings/load'

const scope = self as unknown as {
  onmessage: ((event: MessageEvent<{ url: string }>) => void) | null
  postMessage: (message: RankingsWorkerResponse, transfer?: Transferable[]) => void
}

scope.onmessage = async ({ data }) => {
  try {
    const response = await fetch(data.url)
    if (response.status === 404) return scope.postMessage({ type: 'missing' })
    if (!response.ok) throw new Error(`The rankings answered HTTP ${response.status}.`)
    const payload = toPayload(validateRankings(await response.json()))
    scope.postMessage({ type: 'done', payload }, transferables(payload))
  } catch (error) {
    scope.postMessage({ type: 'error', message: error instanceof Error ? error.message : String(error) })
  }
}
