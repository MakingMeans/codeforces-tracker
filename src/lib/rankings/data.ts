/**
 * Reading the rankings snapshot. The worker checks the file and turns its columns
 * into typed arrays, which cross to the page without being copied; the page only
 * splits the handles back into a list.
 */
import { RANKINGS_VERSION, type RankingsFile } from './format'

/** The snapshot as the page uses it. */
export interface Rankings {
  generatedAt: number
  countries: string[]
  cities: { country: number; name: string }[]
  orgs: string[]
  /** In rating order, best first, like every column below. */
  handles: string[]
  rating: Int32Array
  maxRating: Int32Array
  /** -1 when empty. */
  country: Int32Array
  city: Int32Array
  org: Int32Array
  /** 1 when the player competed in a rated contest in the last month. */
  active: Uint8Array
}

/** What the worker posts: the handles still joined, the columns as transferable arrays. */
export type RankingsPayload = Omit<Rankings, 'handles'> & { handles: string }

export class RankingsFormatError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RankingsFormatError'
  }
}

const isNumbers = (value: unknown, length: number): value is number[] =>
  Array.isArray(value) && value.length === length && value.every((n) => Number.isInteger(n))
const isStrings = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string')

/** Checks a parsed rankings.json and returns it typed, or throws `RankingsFormatError`. */
export function validateRankings(value: unknown): RankingsFile {
  const file = value as Partial<RankingsFile> | null
  if (!file || typeof file !== 'object') throw new RankingsFormatError('Not a rankings file.')
  if (file.version !== RANKINGS_VERSION) throw new RankingsFormatError(`Unknown rankings version ${file.version}.`)
  if (typeof file.generatedAt !== 'number' || typeof file.handles !== 'string' || typeof file.active !== 'string') {
    throw new RankingsFormatError('The rankings file is missing fields.')
  }
  if (!isStrings(file.countries) || !isStrings(file.orgs) || !Array.isArray(file.cities)) {
    throw new RankingsFormatError('The rankings file has broken name lists.')
  }
  const count = file.handles ? file.handles.split('\n').length : 0
  const columns = [file.rating, file.maxRating, file.country, file.city, file.org]
  if (!columns.every((column) => isNumbers(column, count)) || file.active.length !== count) {
    throw new RankingsFormatError('The rankings columns do not line up.')
  }
  return file as RankingsFile
}

/** The worker's side: typed columns, ready to transfer. */
export function toPayload(file: RankingsFile): RankingsPayload {
  return {
    generatedAt: file.generatedAt,
    countries: file.countries,
    cities: file.cities.map(([country, name]) => ({ country, name })),
    orgs: file.orgs,
    handles: file.handles,
    rating: Int32Array.from(file.rating),
    maxRating: Int32Array.from(file.maxRating),
    country: Int32Array.from(file.country),
    city: Int32Array.from(file.city),
    org: Int32Array.from(file.org),
    active: Uint8Array.from(file.active, (flag) => (flag === '1' ? 1 : 0)),
  }
}

/** The buffers to hand over with `postMessage` instead of copying them. */
export const transferables = (payload: RankingsPayload) =>
  [payload.rating, payload.maxRating, payload.country, payload.city, payload.org, payload.active].map(
    (column) => column.buffer,
  )

/** The page's side. */
export const fromPayload = (payload: RankingsPayload): Rankings => ({
  ...payload,
  handles: payload.handles ? payload.handles.split('\n') : [],
})
