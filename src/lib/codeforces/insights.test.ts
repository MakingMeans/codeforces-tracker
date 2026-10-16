import { describe, expect, it } from 'vitest'
import { contests as contestList, NOW, ratings, submissions } from '../../../tests/fixtures'
import type { ApiSubmission } from '../api/types'
import { buildContests } from './contests'
import { contestSummary, languageFamily, languageShares, solvedByDifficulty, topTags } from './insights'

describe('contestSummary', () => {
  it('summarises the match history', () => {
    expect(contestSummary(buildContests(ratings, submissions, contestList, NOW))).toEqual({
      total: 8,
      rated: 4,
      unrated: 3,
      pending: 1,
      bestPlace: 1631,
      // The first contest's jump from 0 to 1400 is left out.
      bestGain: 62,
      worstLoss: -33,
    })
  })

  it('has nothing to report without contests', () => {
    expect(contestSummary([])).toEqual({
      total: 0,
      rated: 0,
      unrated: 0,
      pending: 0,
      bestPlace: null,
      bestGain: null,
      worstLoss: null,
    })
  })
})

describe('solvedByDifficulty', () => {
  it('counts each solved problem once per difficulty, with the gaps', () => {
    const { buckets, withoutRating } = solvedByDifficulty(submissions)
    expect(buckets.map((bucket) => [bucket.rating, bucket.count])).toEqual([
      [800, 8],
      [900, 1],
      [1000, 1],
      [1100, 1],
      [1200, 1],
      [1300, 2],
      [1400, 1],
    ])
    expect(withoutRating).toBe(2)
  })

  it('is empty when nothing is solved', () => {
    expect(solvedByDifficulty([]).buckets).toEqual([])
  })
})

describe('topTags', () => {
  it('ranks the tags of solved problems', () => {
    expect(topTags(submissions, 5)).toEqual([
      { tag: 'math', count: 5 },
      { tag: 'implementation', count: 4 },
      { tag: 'greedy', count: 3 },
      { tag: 'brute force', count: 1 },
      { tag: 'constructive algorithms', count: 1 },
    ])
  })
})

describe('languageFamily', () => {
  it.each([
    ['GNU G++20 13.2 (64 bit, winlibs)', 'C++'],
    ['C++20 (GCC 13-64)', 'C++'],
    ['Clang++20 Diagnostics', 'C++'],
    ['GNU GCC C11 5.1.0', 'C'],
    ['Python 3', 'Python'],
    ['PyPy 3-64', 'Python'],
    ['Java 21 64bit', 'Java'],
    ['Kotlin 1.9', 'Kotlin'],
    ['C# 10, .NET SDK 6.0', 'C#'],
    ['Rust 1.75.0 (2021)', 'Rust'],
    ['Go 1.22.2', 'Go'],
    ['JavaScript V8 4.8.0', 'JavaScript'],
    ['Node.js 15.8.0 (64bit)', 'JavaScript'],
    ['Haskell GHC 8.10.1', 'Haskell'],
  ])('%s is %s', (compiler, family) => {
    expect(languageFamily(compiler)).toBe(family)
  })
})

describe('languageShares', () => {
  it('shares submissions by language, most used first', () => {
    const shares = languageShares(submissions)
    expect(shares.map(({ language, count }) => [language, count])).toEqual([
      ['C++', 28],
      ['Java', 1],
      ['Python', 1],
    ])
    expect(shares[0].percent).toBeCloseTo((28 / 30) * 100)
  })

  it('folds everything past the top slots into Other', () => {
    const many = ['C++', 'Python 3', 'Java 21', 'Kotlin 1.9', 'Rust 1.75', 'Go 1.22', 'Ruby 3', 'PHP 8'].map(
      (programmingLanguage, i) => ({ programmingLanguage, id: i }) as unknown as ApiSubmission,
    )
    const shares = languageShares(many, 6)
    expect(shares).toHaveLength(6)
    expect(shares.at(-1)).toMatchObject({ language: 'Other', count: 3 })
  })
})
