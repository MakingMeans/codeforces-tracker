import { describe, expect, it } from 'vitest'
import { fromPayload, RankingsFormatError, toPayload, transferables, validateRankings } from './data'
import { encodeRankings, type RatedUser } from './format'
import { createRankings, fold, withPositions } from './rankings'

const USERS: RatedUser[] = [
  {
    handle: 'MakingMeans',
    rating: 1267,
    maxRating: 1273,
    country: 'Colombia',
    city: 'Bogotá',
    organization: 'Universidad El Bosque',
  },
  {
    handle: 'mcqueencin',
    rating: 2405,
    maxRating: 2405,
    country: 'Colombia',
    city: 'Bogotá',
    organization: 'Universidad Nacional de Colombia',
  },
  {
    handle: 'Luxuan',
    rating: 1171,
    maxRating: 1171,
    country: 'Colombia',
    city: 'Bogotá',
    organization: 'Universidad El Bosque',
  },
  {
    handle: 'osvarp',
    rating: 2005,
    maxRating: 2113,
    country: 'Colombia',
    city: 'Santiago de Cali',
    organization: 'Charles Fan Club',
  },
  {
    handle: '-osdajigu-',
    rating: 2005,
    maxRating: 2074,
    country: 'Colombia',
    city: 'Bogotá',
    organization: 'Universidad Nacional de Colombia',
  },
  {
    handle: 'tourist',
    rating: 3343,
    maxRating: 4009,
    country: 'Belarus',
    city: 'Gomel',
    organization: 'ITMO University',
  },
  { handle: 'nowhere', rating: 1500, maxRating: 1600, country: '', city: 'Ghost Town', organization: '  ' },
  // Same city name, different country.
  { handle: 'bogota_us', rating: 1400, maxRating: 1400, country: 'United States', city: 'Bogotá' },
]
const ACTIVE = new Set(['MakingMeans', 'Luxuan', 'tourist', 'osvarp'])
const GENERATED = Date.UTC(2026, 9, 17)

const load = () => {
  // Through JSON and back, as the file travels.
  const file = validateRankings(JSON.parse(JSON.stringify(encodeRankings(USERS, ACTIVE, GENERATED))))
  return createRankings(fromPayload(toPayload(file)))
}

describe('encodeRankings', () => {
  const file = encodeRankings(USERS, ACTIVE, GENERATED)

  it('orders players by rating, ties by handle', () => {
    expect(file.handles.split('\n')).toEqual([
      'tourist',
      'mcqueencin',
      '-osdajigu-',
      'osvarp',
      'nowhere',
      'bogota_us',
      'MakingMeans',
      'Luxuan',
    ])
    expect(file.rating).toEqual([3343, 2405, 2005, 2005, 1500, 1400, 1267, 1171])
  })

  it('stores names once and keeps empty ones out', () => {
    expect(file.countries).toEqual(['Belarus', 'Colombia', 'United States'])
    expect(file.orgs).not.toContain('')
    expect(file.org[file.handles.split('\n').indexOf('nowhere')]).toBe(-1)
  })

  it('ties a city to its country, and drops a city without one', () => {
    expect(file.cities.filter(([, name]) => name === 'Bogotá')).toHaveLength(2)
    expect(file.city[file.handles.split('\n').indexOf('nowhere')]).toBe(-1)
  })

  it('flags this month’s competitors', () => {
    expect(file.active).toBe('10010011')
  })
})

describe('validateRankings', () => {
  const good = () => JSON.parse(JSON.stringify(encodeRankings(USERS, ACTIVE, GENERATED)))

  it('accepts a file it wrote', () => {
    expect(() => validateRankings(good())).not.toThrow()
  })

  it('refuses another version, missing fields and uneven columns', () => {
    expect(() => validateRankings({ ...good(), version: 2 })).toThrow(RankingsFormatError)
    expect(() => validateRankings({ ...good(), handles: undefined })).toThrow(RankingsFormatError)
    expect(() => validateRankings({ ...good(), rating: [1, 2] })).toThrow(RankingsFormatError)
    expect(() => validateRankings(null)).toThrow(RankingsFormatError)
  })

  it('hands over every column without copying', () => {
    const payload = toPayload(validateRankings(good()))
    expect(transferables(payload)).toHaveLength(6)
    expect(fromPayload(payload).handles).toHaveLength(USERS.length)
  })
})

describe('rankings', () => {
  const rankings = load()

  it('ranks a country, equal ratings sharing a place', () => {
    const colombia = rankings.ranking({ kind: 'country', country: 'Colombia' })!
    const rows = colombia.rows.map(({ row, position }) => [rankings.data.handles[row], position])
    expect(rows).toEqual([
      ['mcqueencin', 1],
      ['-osdajigu-', 2],
      ['osvarp', 2],
      ['MakingMeans', 4],
      ['Luxuan', 5],
    ])
  })

  it('finds places whatever the case or accents', () => {
    expect(rankings.ranking({ kind: 'country', country: 'colombia' })?.scope).toEqual({
      kind: 'country',
      country: 'Colombia',
    })
    expect(rankings.ranking({ kind: 'city', country: 'Colombia', city: 'bogota' })?.rows).toHaveLength(4)
    expect(rankings.ranking({ kind: 'org', org: 'universidad el bosque' })?.rows).toHaveLength(2)
    expect(rankings.ranking({ kind: 'country', country: 'Atlantis' })).toBeNull()
  })

  it('keeps cities of the same name apart', () => {
    expect(rankings.ranking({ kind: 'city', country: 'United States', city: 'Bogotá' })?.rows).toHaveLength(1)
  })

  it('can rank only this month’s competitors', () => {
    const active = rankings.ranking({ kind: 'country', country: 'Colombia' }, true)!
    expect(active.rows.map(({ row, position }) => [rankings.data.handles[row], position])).toEqual([
      ['osvarp', 1],
      ['MakingMeans', 2],
      ['Luxuan', 3],
    ])
  })

  it('sums up a scope', () => {
    const { rows } = rankings.ranking({ kind: 'org', org: 'Universidad El Bosque' })!
    expect(rankings.stats(rows)).toEqual({ players: 2, active: 2, average: 1219, teamTopThree: 1377 })
  })

  it('says where a player stands', () => {
    expect(rankings.standing('MakingMeans')).toEqual([
      { scope: { kind: 'country', country: 'Colombia' }, name: 'Colombia', position: 4, total: 5 },
      { scope: { kind: 'city', country: 'Colombia', city: 'Bogotá' }, name: 'Bogotá', position: 3, total: 4 },
      { scope: { kind: 'org', org: 'Universidad El Bosque' }, name: 'Universidad El Bosque', position: 1, total: 2 },
    ])
    expect(rankings.standing('makingmeans')).toHaveLength(3)
    expect(rankings.standing('nowhere')).toEqual([])
    expect(rankings.standing('not_in_the_list')).toEqual([])
  })

  it('suggests places, those starting with the text first', () => {
    expect(rankings.suggest('org', 'univ').map((s) => s.label)).toEqual([
      'Universidad Nacional de Colombia',
      'Universidad El Bosque',
      'ITMO University',
    ])
    expect(rankings.suggest('city', 'bogota')).toEqual([
      { scope: { kind: 'city', country: 'Colombia', city: 'Bogotá' }, label: 'Bogotá', detail: 'Colombia', players: 4 },
      {
        scope: { kind: 'city', country: 'United States', city: 'Bogotá' },
        label: 'Bogotá',
        detail: 'United States',
        players: 1,
      },
    ])
    expect(rankings.suggest('country', ' ')).toEqual([])
  })

  it('lists countries, most players first', () => {
    expect(rankings.countries()).toEqual([
      { country: 'Colombia', players: 5, average: 1771, best: 2405 },
      { country: 'Belarus', players: 1, average: 3343, best: 3343 },
      { country: 'United States', players: 1, average: 1400, best: 1400 },
    ])
  })
})

describe('withPositions', () => {
  it('gives equal ratings the same place and skips the places they take', () => {
    const rating = Int32Array.from([2000, 1900, 1900, 1900, 1800])
    expect(withPositions([0, 1, 2, 3, 4], rating).map((r) => r.position)).toEqual([1, 2, 2, 2, 5])
  })
})

describe('fold', () => {
  it('drops case and accents', () => {
    expect(fold('  Bogotá D.C. ')).toBe('bogota d.c.')
    expect(fold('São Paulo')).toBe('sao paulo')
  })
})
