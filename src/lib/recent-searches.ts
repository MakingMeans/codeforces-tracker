/**
 * Handles the visitor looked up, most recent first, kept in this browser only.
 */
import { useSyncExternalStore } from 'react'
import { HANDLE_PATTERN } from './handle'
import { readJSON, writeJSON } from './storage'

export const MAX_RECENT = 8
const KEY = 'cf-tracker:recent:v1'

const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()

/** Puts a handle first, without a case-insensitive duplicate, keeping at most eight. */
export const withRecent = (list: string[], handle: string) =>
  [handle, ...list.filter((item) => !same(item, handle))].slice(0, MAX_RECENT)

export const withoutRecent = (list: string[], handle: string) => list.filter((item) => !same(item, handle))

function load(): string[] {
  const stored = readJSON<unknown>('localStorage', KEY)
  if (!Array.isArray(stored)) return []
  return stored
    .filter((item): item is string => typeof item === 'string' && HANDLE_PATTERN.test(item))
    .slice(0, MAX_RECENT)
}

let current: string[] | null = null
const listeners = new Set<() => void>()

const snapshot = () => (current ??= load())

function update(next: string[]) {
  current = next
  writeJSON('localStorage', KEY, next)
  listeners.forEach((listener) => listener())
}

export const addRecentSearch = (handle: string) => update(withRecent(snapshot(), handle))
export const removeRecentSearch = (handle: string) => update(withoutRecent(snapshot(), handle))

function subscribe(listener: () => void) {
  listeners.add(listener)
  // Another tab changed the list.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== KEY) return
    current = load()
    listener()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

export function useRecentSearches() {
  return useSyncExternalStore(subscribe, snapshot)
}
