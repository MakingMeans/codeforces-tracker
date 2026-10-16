import { CodeforcesError } from './api/client'

export interface LoadProblem {
  kind: 'not-found' | 'rate-limited' | 'unavailable' | 'offline' | 'network' | 'api'
  title: string
  detail: string
  /** Whether trying again can help. */
  retry: boolean
}

/** What to tell the visitor when loading from Codeforces fails. */
export function describeLoadError(error: unknown): LoadProblem {
  const offline = typeof navigator !== 'undefined' && navigator.onLine === false
  if (offline) {
    return {
      kind: 'offline',
      title: 'You are offline',
      detail: 'Reconnect to the internet and try again.',
      retry: true,
    }
  }
  if (error instanceof CodeforcesError) {
    switch (error.kind) {
      case 'not-found':
        return { kind: 'not-found', title: 'Player not found', detail: error.message, retry: false }
      case 'rate-limited':
        return {
          kind: 'rate-limited',
          title: 'Codeforces is busy',
          detail: 'It is limiting how often it can be asked. Wait a few seconds and try again.',
          retry: true,
        }
      case 'unavailable':
        return {
          kind: 'unavailable',
          title: 'Codeforces is not answering',
          detail: 'The site may be down or under maintenance. Try again in a moment.',
          retry: true,
        }
      case 'network':
        return {
          kind: 'network',
          title: 'Could not reach Codeforces',
          detail: 'Check your connection, or whether an extension is blocking codeforces.com.',
          retry: true,
        }
      case 'api':
        return { kind: 'api', title: 'Codeforces refused the request', detail: error.message, retry: true }
    }
  }
  return {
    kind: 'api',
    title: 'Something went wrong',
    detail: error instanceof Error ? error.message : String(error),
    retry: true,
  }
}
