import { describe, expect, it } from 'vitest'
import { readRoute, routeHref } from './route'

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

  it('writes groups, with members as a comma list', () => {
    expect(routeHref({ groups: true })).toBe(`${BASE}?groups`)
    expect(routeHref({ group: 'abc123', name: 'Mi equipo', members: 'tourist,Benq' })).toBe(
      `${BASE}?group=abc123&name=Mi+equipo&members=tourist,Benq`,
    )
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
    const group = { group: 'abc123', name: 'Mi equipo', members: 'tourist,Benq' }
    expect(readRoute(routeHref(group).slice(BASE.length))).toMatchObject(group)
  })

  it('reads flags and trims values', () => {
    expect(readRoute('?rankings')).toMatchObject({ rankings: true, groups: false, handle: null })
    expect(readRoute('?handle=%20tourist%20')).toMatchObject({ handle: 'tourist' })
  })
})
