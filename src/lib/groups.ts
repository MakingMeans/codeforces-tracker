/**
 * The visitor's own groups of handles (friends, a team, a class). Codeforces
 * does not publish anyone's groups or friends, so these live in this browser
 * only; a group's link carries its name and members, so it can be shared.
 */
import { useSyncExternalStore } from 'react'
import { cleanHandle, HANDLE_PATTERN } from './handle'
import { readJSON, writeJSON } from './storage'

export interface Group {
  /** Random, local to this browser; also in the share link, so a shared group can be recognised. */
  id: string
  name: string
  members: string[]
}

export const MAX_MEMBERS = 100
export const MAX_NAME = 40
const KEY = 'cf-tracker:groups:v1'

const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase()

export const cleanName = (name: string) => name.replace(/\s+/g, ' ').trim().slice(0, MAX_NAME)

/** Handles from free text: commas, spaces, new lines or profile links; invalid ones and repeats left out. */
export function parseMembers(text: string): string[] {
  const members: string[] = []
  for (const piece of text.split(/[\s,;]+/)) {
    const handle = cleanHandle(piece)
    if (HANDLE_PATTERN.test(handle) && !members.some((member) => same(member, handle))) members.push(handle)
  }
  return members.slice(0, MAX_MEMBERS)
}

export const withMember = (members: string[], handle: string) =>
  members.some((member) => same(member, handle)) || members.length >= MAX_MEMBERS ? members : [...members, handle]

export const withoutMember = (members: string[], handle: string) => members.filter((member) => !same(member, handle))

export const hasMember = (group: Group, handle: string) => group.members.some((member) => same(member, handle))

/** Whatever was stored, reduced to well-formed groups. */
export function sanitizeGroups(value: unknown): Group[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    const group = item as Partial<Group> | null
    if (!group || typeof group.id !== 'string' || !/^[a-z0-9]{6,16}$/.test(group.id)) return []
    if (typeof group.name !== 'string' || !cleanName(group.name)) return []
    const members = (Array.isArray(group.members) ? group.members : [])
      .filter((member): member is string => typeof member === 'string' && HANDLE_PATTERN.test(member))
      .reduce<string[]>(withMember, [])
    return [{ id: group.id, name: cleanName(group.name), members }]
  })
}

export function newGroupId() {
  const bytes = crypto.getRandomValues(new Uint8Array(6))
  return [...bytes]
    .map((byte) => byte.toString(36).padStart(2, '0'))
    .join('')
    .slice(0, 10)
}

// ---------- the stored list ----------

let current: Group[] | null = null
const listeners = new Set<() => void>()
const snapshot = () => (current ??= sanitizeGroups(readJSON<unknown>('localStorage', KEY)))

function update(next: Group[]) {
  current = next
  writeJSON('localStorage', KEY, next)
  listeners.forEach((listener) => listener())
}

export function saveGroup(group: Group) {
  const list = snapshot()
  const exists = list.some((item) => item.id === group.id)
  update(exists ? list.map((item) => (item.id === group.id ? group : item)) : [...list, group])
}

export function createGroup(name: string, members: string[]): Group {
  const group = { id: newGroupId(), name: cleanName(name) || 'My group', members: members.slice(0, MAX_MEMBERS) }
  saveGroup(group)
  return group
}

export const deleteGroup = (id: string) => update(snapshot().filter((group) => group.id !== id))

function subscribe(listener: () => void) {
  listeners.add(listener)
  const onStorage = (event: StorageEvent) => {
    if (event.key !== KEY) return
    current = null
    listener()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}

export function useGroups() {
  return useSyncExternalStore(subscribe, snapshot)
}
