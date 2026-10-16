import { describe, expect, it } from 'vitest'
import { contestKind } from './contest-kind'

describe('contestKind', () => {
  it.each([
    ['Codeforces Round 1001 (Div. 2)', 'div2'],
    ['Codeforces Round 1010 (Div. 1 + Div. 2)', 'div1'],
    ['Codeforces Round 990 (Div. 1)', 'div1'],
    ['Codeforces Round 1005 (Div. 3)', 'div3'],
    ['Codeforces Round 1009 (Div. 4)', 'div4'],
    ['Educational Codeforces Round 190 (Rated for Div. 2)', 'edu'],
    ['Codeforces Global Round 31', 'global'],
    ['WorldQuant Round 1 (Codeforces Round 1128, Div. 1 + Div. 2)', 'div1'],
    ['Testing Round 30 (Unrated)', 'other'],
    ['Contest 100500', 'other'],
  ])('%s is %s', (name, kind) => {
    expect(contestKind(name)).toBe(kind)
  })
})
