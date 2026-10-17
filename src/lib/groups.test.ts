import { describe, expect, it } from 'vitest'
import {
  cleanName,
  hasMember,
  MAX_MEMBERS,
  newGroupId,
  parseMembers,
  sanitizeGroups,
  withMember,
  withoutMember,
} from './groups'

describe('parseMembers', () => {
  it('reads handles separated by commas, spaces or lines, and profile links', () => {
    expect(parseMembers('tourist, jiangly\nBenq https://codeforces.com/profile/MakingMeans')).toEqual([
      'tourist',
      'jiangly',
      'Benq',
      'MakingMeans',
    ])
  })

  it('leaves out invalid handles and repeats in any case', () => {
    expect(parseMembers('ok_handle a!! OK_HANDLE x')).toEqual(['ok_handle'])
  })

  it('stops at the member limit', () => {
    const many = Array.from({ length: MAX_MEMBERS + 20 }, (_, i) => `player${i}`).join(' ')
    expect(parseMembers(many)).toHaveLength(MAX_MEMBERS)
  })
})

describe('members', () => {
  it('adds a handle once, whatever its case', () => {
    expect(withMember(['tourist'], 'Benq')).toEqual(['tourist', 'Benq'])
    expect(withMember(['tourist'], 'TOURIST')).toEqual(['tourist'])
  })

  it('removes a handle whatever its case', () => {
    expect(withoutMember(['tourist', 'Benq'], 'benq')).toEqual(['tourist'])
  })

  it('finds a member whatever the case', () => {
    expect(hasMember({ id: 'abcdef', name: 'x', members: ['MakingMeans'] }, 'makingmeans')).toBe(true)
  })
})

describe('sanitizeGroups', () => {
  it('keeps well-formed groups and cleans their members', () => {
    expect(
      sanitizeGroups([
        { id: 'abc123', name: '  Mi   equipo ', members: ['tourist', 'bad handle!', 'TOURIST', 'Benq'] },
        { id: 'NOPE', name: 'Bad id', members: [] },
        { id: 'def456', name: '   ', members: [] },
        'junk',
        null,
      ]),
    ).toEqual([{ id: 'abc123', name: 'Mi equipo', members: ['tourist', 'Benq'] }])
  })

  it('treats anything else as no groups', () => {
    expect(sanitizeGroups(null)).toEqual([])
    expect(sanitizeGroups({ groups: [] })).toEqual([])
  })
})

describe('names and ids', () => {
  it('collapses spaces and caps the length of a name', () => {
    expect(cleanName('  a   b  ')).toBe('a b')
    expect(cleanName('x'.repeat(80))).toHaveLength(40)
  })

  it('makes ids that sanitizeGroups accepts', () => {
    const id = newGroupId()
    expect(sanitizeGroups([{ id, name: 'x', members: [] }])).toHaveLength(1)
  })
})
