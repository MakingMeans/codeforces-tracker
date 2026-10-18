import { describe, expect, it } from 'vitest'
import type { RatedUser } from './format'
import { applyRecent, type RatingChange } from './recent'

const user = (handle: string, rating: number, maxRating = rating): RatedUser => ({ handle, rating, maxRating })
let time = 1_792_000_000
const change = (handle: string, oldRating: number, newRating: number, contestId = 1): RatingChange => ({
  contestId,
  handle,
  ratingUpdateTimeSeconds: (time += 3600),
  oldRating,
  newRating,
})

describe('applyRecent', () => {
  it('applies a contest the list has not counted yet', () => {
    const { users, moved } = applyRecent([user('MakingMeans', 1267, 1273)], [change('MakingMeans', 1267, 1424)])
    expect(users).toEqual([user('MakingMeans', 1424, 1424)])
    expect(moved).toEqual(new Map([['MakingMeans', 1267]]))
  })

  it('leaves a contest the list already has alone', () => {
    const { users } = applyRecent([user('a', 1424, 1500)], [change('a', 1267, 1424)])
    expect(users).toEqual([user('a', 1424, 1500)])
  })

  it('picks the chain up wherever the list is along it', () => {
    const week = [change('a', 1250, 1273), change('a', 1273, 1267), change('a', 1267, 1424)]
    for (const listed of [1250, 1273, 1267, 1424]) {
      expect(applyRecent([user('a', listed, 1424)], week).users[0].rating).toBe(1424)
    }
  })

  it('follows a chain that comes back to an earlier rating', () => {
    const week = [change('a', 1500, 1520), change('a', 1520, 1500), change('a', 1500, 1480)]
    expect(applyRecent([user('a', 1500)], week).users[0].rating).toBe(1480)
    expect(applyRecent([user('a', 1480)], week).users[0].rating).toBe(1480)
  })

  it('reads the changes in the order they were rated, whatever order they come in', () => {
    const first = change('a', 1300, 1350)
    const second = change('a', 1350, 1410)
    expect(applyRecent([user('a', 1300)], [second, first]).users[0].rating).toBe(1410)
  })

  it('keeps the best rating', () => {
    expect(applyRecent([user('a', 1900, 2100)], [change('a', 1900, 1950)]).users[0]).toEqual(user('a', 1950, 2100))
  })

  it('marks a change of rank, up or down, against the rating a week ago', () => {
    const { moved } = applyRecent(
      [user('up', 1190), user('down', 1610), user('division', 1210), user('back', 1390)],
      [
        change('up', 1190, 1230),
        change('down', 1610, 1580),
        change('division', 1210, 1290),
        change('back', 1390, 1410),
        change('back', 1410, 1395),
      ],
    )
    expect(moved).toEqual(
      new Map([
        ['up', 1190],
        ['down', 1610],
      ]),
    )
  })

  it('does not call a first contest a change of rank', () => {
    expect(applyRecent([user('new', 0)], [change('new', 0, 1250)]).moved.size).toBe(0)
  })

  it('lists who competed, and leaves out changes for players the list does not have', () => {
    const { users, competed } = applyRecent([user('a', 1500)], [change('a', 1500, 1510), change('stranger', 0, 900)])
    expect(users).toHaveLength(1)
    expect(competed).toEqual(new Set(['a', 'stranger']))
  })
})
