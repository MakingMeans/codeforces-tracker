import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchMembers } from './group-members'

const ok = (result: unknown) => new Response(JSON.stringify({ status: 'OK', result }))
const failed = (comment: string) => new Response(JSON.stringify({ status: 'FAILED', comment }), { status: 400 })
const user = (handle: string, rating?: number) => ({ handle, rating, maxRating: rating, titlePhoto: '', avatar: '' })

let fetchMock: ReturnType<typeof vi.fn>

beforeEach(() => {
  fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('fetchMembers', () => {
  it('asks for everyone at once and orders them, unrated last', async () => {
    fetchMock.mockResolvedValueOnce(ok([user('Luxuan', 1171), user('newcomer'), user('MakingMeans', 1267)]))
    const { members, missing } = await fetchMembers(['Luxuan', 'newcomer', 'MakingMeans'])
    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://codeforces.com/api/user.info?handles=Luxuan%3Bnewcomer%3BMakingMeans',
    )
    expect(members.map((m) => [m.handle, m.rating, m.rank.name])).toEqual([
      ['MakingMeans', 1267, 'Pupil'],
      ['Luxuan', 1171, 'Newbie'],
      ['newcomer', null, 'Unrated'],
    ])
    expect(missing).toEqual([])
  })

  it('sets aside handles that no longer exist and asks again', async () => {
    fetchMock
      .mockResolvedValueOnce(failed('handles: User with handle gone_one not found'))
      .mockResolvedValueOnce(ok([user('tourist', 3343)]))
    const { members, missing } = await fetchMembers(['tourist', 'Gone_One'])
    expect(missing).toEqual(['Gone_One'])
    expect(members.map((m) => m.handle)).toEqual(['tourist'])
    expect(fetchMock.mock.calls[1][0]).toBe('https://codeforces.com/api/user.info?handles=tourist')
  })

  it('passes on any other failure', async () => {
    fetchMock.mockResolvedValueOnce(failed('handles: Field should contain between 1 and 10000 items'))
    await expect(fetchMembers(['tourist'])).rejects.toThrow(/between 1 and 10000/)
  })
})
