import { createRequire } from 'node:module'
import { describe, expect, it } from 'vitest'
import { DIVISIONS } from './codeforces/ranks'
import { emblemLabel, emblemSVG, starsFor } from './emblem'

interface DesignEmblems {
  emblemSVG: (tier: number, options?: { size?: number; division?: number }) => string
  DIVISIONS: typeof DIVISIONS
}

// The reference drawing kept with the design docs (a CommonJS file, loaded with Node's own require).
const design = createRequire(import.meta.url)('../../docs/design/rank-emblems.js') as DesignEmblems

/** Ids are generated differently on each side, and the colours differ only in case. */
const normalize = (svg: string) => svg.replace(/cfe[0-9a-z]+/g, 'ID').toLowerCase()

describe('rank emblems', () => {
  it.each([-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9])('tier %i matches the approved design exactly', (tier) => {
    expect(normalize(emblemSVG(tier, { id: 'cfe0', size: 64 }))).toBe(normalize(design.emblemSVG(tier, { size: 64 })))
  })

  it.each(DIVISIONS.flatMap((split, tier) => split.starts.map((_, i) => [tier, i + 1])))(
    'tier %i, division %i, matches the approved design exactly',
    (tier, division) => {
      expect(normalize(emblemSVG(tier, { id: 'cfe0', size: 64, division }))).toBe(
        normalize(design.emblemSVG(tier, { size: 64, division })),
      )
    },
  )

  it('splits the ranks the same way as the design', () => {
    expect(design.DIVISIONS).toEqual(DIVISIONS)
  })

  it('draws no division on Unrated', () => {
    expect(emblemSVG(-1, { id: 'cfe0', division: 2 })).toBe(emblemSVG(-1, { id: 'cfe0' }))
  })

  it('gives one star per rank colour', () => {
    expect([-1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(starsFor)).toEqual([0, 1, 2, 3, 4, 5, 6, 6, 7, 7, 7])
  })

  it('names the rank and its stars', () => {
    expect(emblemLabel(3)).toBe('Expert rank emblem, 4 stars')
    expect(emblemLabel(0)).toBe('Newbie rank emblem, 1 star')
    expect(emblemLabel(-1)).toBe('Unrated rank emblem')
    expect(emblemLabel(1, 2)).toBe('Pupil II rank emblem, 2 stars')
    expect(emblemLabel(9, 3)).toBe('Legendary Grandmaster III rank emblem, 7 stars')
  })
})
