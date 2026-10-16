import { startTransition, useCallback, useEffect, useState } from 'react'
import { isAbortError } from './api/client'
import { loadDetails, loadUser, type Profile, type ProfileDetails } from './codeforces/profile'
import type { ProfileUser } from './codeforces/user'
import { describeLoadError, type LoadProblem } from './errors'
import { cacheProfile, getCachedProfile } from './profile-cache'
import { addRecentSearch } from './recent-searches'
import { navigate } from './route'

export interface ProfileState {
  /** Lower-cased handle this state belongs to. */
  key: string
  user: ProfileUser | null
  details: ProfileDetails | null
  fetchedAt: number | null
  problem: LoadProblem | null
  /** The last complete profile of another handle, shown dimmed until the new header arrives. */
  previous: Profile | null
}

function start(key: string, before: ProfileState | null): ProfileState {
  const cached = getCachedProfile(key)
  if (cached) return { key, ...cached, problem: null, previous: null }
  const previous =
    before?.user && before.details && before.fetchedAt
      ? { user: before.user, details: before.details, fetchedAt: before.fetchedAt }
      : (before?.previous ?? null)
  return { key, user: null, details: null, fetchedAt: null, problem: null, previous }
}

/**
 * Loads a profile: the header first, then everything else. Changing the handle
 * cancels whatever is still in flight, so two users' data never mix.
 */
export function useProfile(handle: string) {
  const key = handle.toLowerCase()
  const [state, setState] = useState<ProfileState>(() => start(key, null))
  const [attempt, setAttempt] = useState(0)

  // A new handle: start over during render, keeping the old profile to show dimmed.
  if (state.key !== key) setState(start(key, state))

  useEffect(() => {
    if (getCachedProfile(key)) return
    const controller = new AbortController()
    const { signal } = controller
    const update = (patch: Partial<ProfileState>) =>
      setState((current) => (current.key === key ? { ...current, ...patch } : current))

    ;(async () => {
      try {
        const user = await loadUser(key, signal)
        update({ user, previous: null })
        addRecentSearch(user.handle)
        // Show Codeforces' own capitalisation in the address bar.
        if (new URLSearchParams(location.search).get('handle') !== user.handle) {
          navigate({ handle: user.handle }, { replace: true })
        }

        const details = await loadDetails(user.handle, signal)
        const fetchedAt = Date.now()
        // Rendering every section at once is the heaviest step on slow phones; a transition lets
        // React split it and keep the page responsive.
        startTransition(() => update({ details, fetchedAt }))
        cacheProfile({ user, details, fetchedAt }, fetchedAt)
      } catch (error) {
        if (!isAbortError(error)) update({ problem: describeLoadError(error), previous: null })
      }
    })()

    return () => controller.abort()
  }, [key, attempt])

  const retry = useCallback(() => {
    setState((current) => ({ ...current, problem: null }))
    setAttempt((value) => value + 1)
  }, [])

  return { state, retry }
}
