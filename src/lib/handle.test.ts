import { describe, expect, it } from 'vitest'
import { cleanHandle, handleProblem } from './handle'

describe('cleanHandle', () => {
  it('trims spaces and a leading @', () => {
    expect(cleanHandle('  @tourist ')).toBe('tourist')
  })

  it('takes the handle out of a pasted profile link', () => {
    expect(cleanHandle('https://codeforces.com/profile/jiangly')).toBe('jiangly')
    expect(cleanHandle('codeforces.com/profile/Benq?locale=en')).toBe('Benq')
  })
})

describe('handleProblem', () => {
  it.each(['tourist', 'Benq', 'jiangly', 'a_b', 'x.y-z', 'A'.repeat(24)])('accepts %s', (handle) => {
    expect(handleProblem(handle)).toBeNull()
  })

  it.each([
    ['', 'Type a Codeforces handle.'],
    ['   ', 'Type a Codeforces handle.'],
    ['ab', 'Handles are at least 3 characters long.'],
    ['A'.repeat(25), 'Handles are at most 24 characters long.'],
    ['tour ist', 'Handles only use letters, digits, _ . and -.'],
    ['tourist!', 'Handles only use letters, digits, _ . and -.'],
    ['josé', 'Handles only use letters, digits, _ . and -.'],
  ])('rejects "%s"', (input, message) => {
    expect(handleProblem(input)).toBe(message)
  })
})
