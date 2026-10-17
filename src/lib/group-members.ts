/**
 * A group's members, live from Codeforces: one `user.info` call for all of them.
 * A handle that no longer exists fails the whole call, so it is set aside and
 * the call made again without it.
 */
import { useEffect, useState } from 'react'
import { call, CodeforcesError, isAbortError } from './api/client'
import type { ApiUser } from './api/types'
import { rankFor, type Rank } from './codeforces/ranks'
import { describeLoadError, type LoadProblem } from './errors'

export interface Member {
  handle: string
  rating: number | null
  maxRating: number | null
  rank: Rank
}

const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()

/** Best rating first, then the unrated by handle. */
export const byRating = (a: Member, b: Member) =>
  (b.rating ?? -Infinity) - (a.rating ?? -Infinity) || a.handle.localeCompare(b.handle)

export async function fetchMembers(handles: string[], signal?: AbortSignal) {
  let asked = [...handles]
  const missing: string[] = []
  while (asked.length > 0) {
    try {
      const users = await call<ApiUser[]>('user.info', { handles: asked.join(';') }, signal)
      const members = users.map((user): Member => {
        const rating = user.rating ?? null
        return { handle: user.handle, rating, maxRating: user.maxRating ?? rating, rank: rankFor(rating) }
      })
      return { members: members.sort(byRating), missing }
    } catch (error) {
      const gone =
        error instanceof CodeforcesError && error.kind === 'not-found'
          ? /handle (\S+) not found/i.exec(error.message)?.[1]
          : undefined
      if (!gone || !asked.some((handle) => same(handle, gone))) throw error
      missing.push(asked.find((handle) => same(handle, gone))!)
      asked = asked.filter((handle) => !same(handle, gone))
    }
  }
  return { members: [] as Member[], missing }
}

export type MembersState =
  | { status: 'loading' }
  | { status: 'ready'; members: Member[]; missing: string[] }
  | { status: 'error'; problem: LoadProblem }

/** The members of a list of handles, reloaded whenever the list changes. */
export function useGroupMembers(handles: string[]) {
  const key = handles.join(',')
  const [result, setResult] = useState<{ key: string; state: MembersState } | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const list = key ? key.split(',') : []
    if (list.length === 0) return
    const controller = new AbortController()
    fetchMembers(list, controller.signal).then(
      ({ members, missing }) => setResult({ key, state: { status: 'ready', members, missing } }),
      (error: unknown) => {
        if (!isAbortError(error)) setResult({ key, state: { status: 'error', problem: describeLoadError(error) } })
      },
    )
    return () => controller.abort()
  }, [key, attempt])

  const state: MembersState =
    handles.length === 0
      ? { status: 'ready', members: [], missing: [] }
      : result?.key === key
        ? result.state
        : { status: 'loading' }
  return { state, retry: () => setAttempt((value) => value + 1) }
}
