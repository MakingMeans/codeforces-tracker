import { describe, expect, it } from 'vitest'
import { MAX_RECENT, withoutRecent, withRecent } from './recent-searches'

describe('recent searches', () => {
  it('puts the latest handle first', () => {
    expect(withRecent(['jiangly', 'Benq'], 'tourist')).toEqual(['tourist', 'jiangly', 'Benq'])
  })

  it('moves a handle searched again to the front, whatever its case', () => {
    expect(withRecent(['jiangly', 'Tourist', 'Benq'], 'tourist')).toEqual(['tourist', 'jiangly', 'Benq'])
  })

  it(`keeps at most ${MAX_RECENT}`, () => {
    const many = Array.from({ length: MAX_RECENT }, (_, i) => `user${i}`)
    const next = withRecent(many, 'newest')
    expect(next).toHaveLength(MAX_RECENT)
    expect(next[0]).toBe('newest')
    expect(next).not.toContain(`user${MAX_RECENT - 1}`)
  })

  it('removes one handle, whatever its case', () => {
    expect(withoutRecent(['tourist', 'jiangly'], 'TOURIST')).toEqual(['jiangly'])
  })
})
