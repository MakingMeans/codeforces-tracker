import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { call, CodeforcesError, isAbortError } from './client'

const ok = (result: unknown) => new Response(JSON.stringify({ status: 'OK', result }), { status: 200 })
const failed = (comment: string, status = 400) =>
  new Response(JSON.stringify({ status: 'FAILED', comment }), { status })

let fetchMock: ReturnType<typeof vi.fn>

beforeEach(() => {
  fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

/** Settles a promise into a value we can assert on without unhandled rejections. */
const settle = <T>(promise: Promise<T>) =>
  promise.then(
    (value) => ({ ok: true as const, value }),
    (error: unknown) => ({ ok: false as const, error }),
  )

describe('call', () => {
  it('returns the result and sends the parameters', async () => {
    fetchMock.mockResolvedValueOnce(ok([{ handle: 'tourist' }]))
    await expect(call('user.info', { handles: 'tourist' })).resolves.toEqual([{ handle: 'tourist' }])
    expect(fetchMock.mock.calls[0][0]).toBe('https://codeforces.com/api/user.info?handles=tourist')
  })

  it('waits 2 seconds and retries after HTTP 429', async () => {
    fetchMock.mockResolvedValueOnce(new Response('', { status: 429 })).mockResolvedValueOnce(ok(1))
    const result = settle(call('contest.list', {}))
    await vi.advanceTimersByTimeAsync(1999)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1)
    await expect(result).resolves.toEqual({ ok: true, value: 1 })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('backs off 2, 4 and 6 seconds on "Call limit exceeded", then gives up', async () => {
    fetchMock.mockImplementation(async () => failed('Call limit exceeded'))
    const result = settle(call('user.status', { handle: 'jiangly' }))
    await vi.advanceTimersByTimeAsync(2000 + 4000 + 6000)
    const outcome = await result
    expect(fetchMock).toHaveBeenCalledTimes(4)
    expect(outcome.ok).toBe(false)
    expect(!outcome.ok && outcome.error).toBeInstanceOf(CodeforcesError)
    expect(!outcome.ok && (outcome.error as CodeforcesError).kind).toBe('rate-limited')
  })

  it('reports an unknown handle as not found, without retrying', async () => {
    fetchMock.mockResolvedValueOnce(failed('handles: User with handle nobody_here not found'))
    await expect(call('user.info', { handles: 'nobody_here' })).rejects.toMatchObject({ kind: 'not-found' })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('reports a request that never arrives as a network error', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    await expect(call('user.info', { handles: 'tourist' })).rejects.toMatchObject({ kind: 'network' })
  })

  it('reports a page that is not the API as unavailable', async () => {
    fetchMock.mockResolvedValueOnce(new Response('<html>Codeforces is temporarily unavailable</html>', { status: 503 }))
    await expect(call('user.info', { handles: 'tourist' })).rejects.toMatchObject({ kind: 'unavailable' })
  })

  it('passes any other refusal through with its comment', async () => {
    fetchMock.mockResolvedValueOnce(failed('handle: Field should contain between 3 and 24 characters'))
    await expect(call('user.rating', { handle: 'ab' })).rejects.toMatchObject({
      kind: 'api',
      message: 'handle: Field should contain between 3 and 24 characters',
    })
  })

  it('stops waiting to retry as soon as the request is cancelled', async () => {
    fetchMock.mockResolvedValueOnce(new Response('', { status: 429 }))
    const controller = new AbortController()
    const result = settle(call('user.status', { handle: 'tourist' }, controller.signal))
    await vi.advanceTimersByTimeAsync(500)
    controller.abort()
    const outcome = await result
    expect(!outcome.ok && isAbortError(outcome.error)).toBe(true)
    await vi.advanceTimersByTimeAsync(10_000)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('keeps at most three requests in flight', async () => {
    const pending: Array<(response: Response) => void> = []
    fetchMock.mockImplementation(() => new Promise<Response>((resolve) => pending.push(resolve)))
    const calls = Array.from({ length: 5 }, (_, i) => call('user.info', { handles: `user${i}` }))
    await vi.advanceTimersByTimeAsync(0)
    expect(fetchMock).toHaveBeenCalledTimes(3)

    pending.shift()!(ok(0))
    await vi.advanceTimersByTimeAsync(0)
    expect(fetchMock).toHaveBeenCalledTimes(4)

    while (pending.length || fetchMock.mock.calls.length < 5) {
      pending.shift()?.(ok(0))
      await vi.advanceTimersByTimeAsync(0)
    }
    pending.forEach((resolve) => resolve(ok(0)))
    await expect(Promise.all(calls)).resolves.toHaveLength(5)
  })
})
