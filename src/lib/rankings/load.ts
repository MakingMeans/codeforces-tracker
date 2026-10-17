/**
 * Loads the rankings snapshot once per visit and shares it between pages. The
 * browser's HTTP cache keeps the file between visits.
 */
import { startTransition, useEffect, useState } from 'react'
import { asset } from '../site'
import { fromPayload, type RankingsPayload } from './data'
import { createRankings, type RankingsIndex } from './rankings'

export type RankingsWorkerResponse =
  { type: 'done'; payload: RankingsPayload } | { type: 'missing' } | { type: 'error'; message: string }

export type RankingsState =
  | { status: 'loading' }
  | { status: 'ready'; rankings: RankingsIndex }
  /** No snapshot was published with this build. */
  | { status: 'missing' }
  | { status: 'error'; message: string }

let loading: Promise<RankingsState> | null = null
let settled: RankingsState | null = null

function load(): Promise<RankingsState> {
  loading ??= new Promise<RankingsState>((resolve) => {
    const worker = new Worker(new URL('../../workers/rankings.worker.ts', import.meta.url), { type: 'module' })
    worker.onmessage = ({ data }: MessageEvent<RankingsWorkerResponse>) => {
      worker.terminate()
      if (data.type === 'done') resolve({ status: 'ready', rankings: createRankings(fromPayload(data.payload)) })
      else if (data.type === 'missing') resolve({ status: 'missing' })
      else resolve({ status: 'error', message: data.message })
    }
    worker.onerror = () => {
      worker.terminate()
      resolve({ status: 'error', message: 'The rankings could not be read.' })
    }
    worker.postMessage({ url: asset('data/rankings.json') })
  }).then((state) => {
    settled = state
    // A failure is not kept, so "Try again" fetches anew.
    if (state.status === 'error') loading = null
    return state
  })
  return loading
}

/** The snapshot, loading it on first use; `enabled: false` waits until it is wanted. */
export function useRankings(enabled = true) {
  const [state, setState] = useState<RankingsState>(() => settled ?? { status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!enabled) return
    let live = true
    load().then((next) => {
      // A transition, so the first render of a long ranking can be split up instead of blocking the page.
      if (live) startTransition(() => setState(next))
    })
    return () => {
      live = false
    }
  }, [enabled, attempt])

  return {
    state,
    retry: () => {
      settled = null
      setState({ status: 'loading' })
      setAttempt((value) => value + 1)
    },
  }
}
