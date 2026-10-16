import { describe, expect, it } from 'vitest'
import { NOW, ratings, user, userInfoUnrated } from '../../../tests/fixtures'
import { UNRATED } from './ranks'
import { photoSources, toProfileUser, toRatingHistory } from './user'

describe('toProfileUser', () => {
  it('reads a rated user', () => {
    const profile = toProfileUser(user, NOW)
    expect(profile).toMatchObject({
      handle: 'Sample_Handle',
      rating: 1429,
      maxRating: 1462,
      organization: 'Example University',
      location: 'Bogotá, Colombia',
      contribution: 12,
      friendOfCount: 48,
      registeredAt: Date.parse('2023-03-10T12:00:00Z'),
    })
    expect(profile.rank.name).toBe('Specialist')
    expect(profile.maxRank.name).toBe('Specialist')
  })

  it('keeps a user who never took a rated contest Unrated', () => {
    const profile = toProfileUser(userInfoUnrated, NOW)
    expect(profile.rating).toBeNull()
    expect(profile.maxRating).toBeNull()
    expect(profile.rank).toBe(UNRATED)
    expect(profile.maxRank).toBe(UNRATED)
    expect(profile.organization).toBeUndefined()
    expect(profile.location).toBeUndefined()
  })
})

describe('photoSources', () => {
  it('makes protocol-relative URLs absolute and tries past the CDN cache before the avatar', () => {
    expect(photoSources(user, NOW)).toEqual([
      'https://userpic.codeforces.org/1/title/abc.jpg',
      `https://userpic.codeforces.org/1/title/abc.jpg?v=${NOW}`,
      'https://userpic.codeforces.org/1/avatar/abc.jpg',
    ])
  })

  it('appends to an existing query string', () => {
    expect(photoSources({ titlePhoto: 'https://x.org/p.jpg?s=1', avatar: 'https://x.org/a.jpg' }, 5)[1]).toBe(
      'https://x.org/p.jpg?s=1&v=5',
    )
  })
})

describe('toRatingHistory', () => {
  it('turns rating changes into chart points', () => {
    expect(toRatingHistory(ratings).map(({ rating, delta, place }) => [rating, delta, place])).toEqual([
      [1400, 1400, 8000],
      [1400, 0, 5000],
      [1462, 62, 1631],
      [1429, -33, 4210],
    ])
  })
})
