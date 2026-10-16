/**
 * Browser storage that never throws: private windows, full quotas and blocked
 * site data all behave as an empty store.
 */
type StoreName = 'localStorage' | 'sessionStorage'

const store = (name: StoreName): Storage | null => {
  try {
    return globalThis[name] ?? null
  } catch {
    return null
  }
}

export function readJSON<T>(name: StoreName, key: string): T | null {
  try {
    const raw = store(name)?.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function writeJSON(name: StoreName, key: string, value: unknown) {
  try {
    store(name)?.setItem(key, JSON.stringify(value))
  } catch {
    // Quota exceeded or storage blocked: the value just is not kept.
  }
}

export function remove(name: StoreName, key: string) {
  try {
    store(name)?.removeItem(key)
  } catch {
    // Nothing to do.
  }
}
