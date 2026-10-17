import { describe, expect, it } from 'vitest'
import { readRoute, routeHref, sectionOf } from './route'

const BASE = import.meta.env.BASE_URL

describe('routeHref', () => {
  it('writes the home page, a profile and a comparison', () => {
    expect(routeHref({})).toBe(BASE)
    expect(routeHref({ handle: 'tourist' })).toBe(`${BASE}?handle=tourist`)
    expect(routeHref({ handle: 'tourist', vs: 'Benq' })).toBe(`${BASE}?handle=tourist&vs=Benq`)
  })

  it('writes rankings with readable names', () => {
    expect(routeHref({ rankings: true })).toBe(`${BASE}?rankings`)
    expect(routeHref({ country: 'Colombia', city: 'Bogotá', focus: 'MakingMeans' })).toBe(
      `${BASE}?country=Colombia&city=Bogot%C3%A1&focus=MakingMeans`,
    )
    expect(routeHref({ org: 'Universidad El Bosque' })).toBe(`${BASE}?org=Universidad+El+Bosque`)
  })

  it('leaves out a second handle without a first, and a city without a country', () => {
    expect(routeHref({ vs: 'Benq' })).toBe(BASE)
    expect(routeHref({ city: 'Bogotá' })).toBe(BASE)
  })
})

describe('readRoute', () => {
  it('reads back what routeHref writes', () => {
    const route = { country: 'Colombia', city: 'Bogotá', focus: 'MakingMeans' }
    expect(readRoute(routeHref(route).slice(BASE.length))).toMatchObject(route)
    const org = { org: 'Universidad El Bosque' }
    expect(readRoute(routeHref(org).slice(BASE.length))).toMatchObject(org)
  })

  it('reads flags and trims values', () => {
    expect(readRoute('?rankings')).toMatchObject({ rankings: true, compare: false, handle: null })
    expect(readRoute('?handle=%20tourist%20')).toMatchObject({ handle: 'tourist' })
  })
})

describe('compare and sections', () => {
  it('writes the compare page, with a first player', () => {
    expect(routeHref({ compare: true })).toBe(`${BASE}?compare`)
    expect(routeHref({ compare: true, handle: 'tourist' })).toBe(`${BASE}?compare&handle=tourist`)
    expect(readRoute('?compare&handle=tourist')).toMatchObject({ compare: true, handle: 'tourist' })
  })

  it('puts each page in its section', () => {
    expect(sectionOf(readRoute(''))).toBe('players')
    expect(sectionOf(readRoute('?handle=tourist'))).toBe('players')
    expect(sectionOf(readRoute('?compare'))).toBe('compare')
    expect(sectionOf(readRoute('?handle=tourist&vs=Benq'))).toBe('compare')
    expect(sectionOf(readRoute('?country=Colombia'))).toBe('rankings')
    expect(sectionOf(readRoute('?org=ITMO+University'))).toBe('rankings')
  })
})
